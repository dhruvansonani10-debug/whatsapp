const User = require("../models/User");
const responseHandler = require("../utils/responseHandler");
const otpGenrate = require('../utils/otpGenerator');
const sendOtpToEmail = require('../services/emailservice');
const Conversation = require('../models/Conversation');

const tiwiloService = require('../services/twilloservice');
const generateToken = require("../utils/genrateToken");
const {uploadFileToCloudinary} = require('../config/cloudinary');

//send otp 


const sendOtp = async (req,res)=>{
    const {phoneNumber,phoneSuffix,email} = req.body;
    const otp = otpGenrate();
    const expiry = new Date(Date.now() + 5 * 60 *1000);
    let user;
    try{
        if(email){
            user = await User.findOne({email})
            if(!user){
                user = new User({email})
            }
            user.emailOtp = otp;
            user.emailOtpExpiry = expiry;
            await user.save()
            await sendOtpToEmail(email,otp)
            
            return response(res,200,'otp send to your mail',{email})
        }
        if(!phoneNumber || !phoneSuffix){
            return response(res,400,'phone number and suffix are required');
        }
        const fullPhoneNUmber = `${phoneSuffix}${phoneNumber}`;
        user = await User.findOne({phoneNumber});
        if(!user){
            user = await new User ({phoneNubmer,phoneSuffix});
        }
        await tiwiloService.sendOtpToPhoneNumber(fullPhoneNUmber);
        await user.save();
        return response(res,200,'otp send to your user',user)
        
    }catch(error){
        console.log(error);
        return response(res,500,'internal server error');
    }
}


//verify otp

const VerifyOtp = async(req,res)=>{
    const {phoneNumber,phoneSuffix,email,otp} = req.body;
    try{
        if(email){

        const user = await User.findOne({email})
        if(!user){
            return response(res,404,'user not found');
        }
        const now = new Date();
        if(user.emailOtp || String(user.emailOtp) !== String(otp) || now > new Date(user.emailOtpExpiry)){
            return response(res,400,'invalid otp or expired');
        }
        user.emailOtp = null;
        user.emailOtpExpiry = null;
        await user.save();
        return response(res,200,'otp verified successfully',user)

    }
    else{
        if(!phoneNumber || !phoneSuffix){
            return response(res,400,'phone number and suffix are required');
        }
        const fullPhoneNUmber = `${phoneSuffix}${phoneNumber}`;
        user = await User.findOne({phoneNumber});
        if(!user){
            user = await new User ({phoneNubmer,phoneSuffix});
        }
        const result = await tiwiloService.VerifyOtp(fullPhoneNUmber,otp);
        if(result.stauts !== 'approved'){
            return response(res,400,'invalid otp')
        }
        user.isVerified = true;
        
        await user.save();
        return response(res,200,'otp send to your user',user)

    }
    const token = generateToken(user?._id);
    res.cookie("auth_token",token , {
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:30 * 24 * 60 * 60 * 1000
    })

}
    catch(error){
        console.log(error);
        return response(res,500,'internal server error');
    }
}

const updateProfile = async(req,res)=>{
    const {username,agreed,about} = req.body;
    const userId= req.user.userId;
    try{
        const user = await User.findById(userId);
        const file = req.file;
        if(file){
            const uploadResult = await uploadOnCloudinary(file);
            console.log(uploadResult)
            user.profilePicture = uploadResult?.secure_url;
        }
        else if(req.body.profilePicture){
            user.profilePicture=req.body.profilePicture
        }

        if(username){
            user.username=username
        }
        if(about){
            user.about=about
        }
        if(agreed){
            user.isAgreed=agreed
        } 
        await user.save();
        return response(res,200,'profile updated successfully',user);
    }catch(error){
        console.log(error);
        return response(res,500,'internal server error');
    }
}   

const checkAuthenticated = async(req,res) => {
    try{
        const userId = req.user.userId;
        if(!userId){
            return response(res,200,'unauthenticated : please login');
        }
        const user = await User.findById(userId);
        if(!user){
            return response(res,404,'user not found');
        }
        return response(res,200,'user is authenticated',user);
    }catch(error){
        console.log(error);
        return response(res,500,'internal server error');
    }
}

const logout = async(req,res)=>{
    try{
        res.clearCookie('auth_token');
        return response(res,200,'logged out successfully');
    }catch(error){
        console.log(error);
        return response(res,500,'internal server error');
    }
}

const getAllUser = async(req,res) => {
    const loggedInUser = req.user.userId;
    try{
        const users = await User.find({_id : {$ne : loggedInUser}}).select('username profilePicture lastSeen isOnline about phoneNumber phoneSuffix').lean();
        const userWithConversation = await Promise.all(
            users.map(async(user) => {
                const conversation = await Conversation.findOne({
                    participants:{$all:[loggedInUser,user?._id]}
                }).populate({
                    path:'participants',
                    select:'content createdAt sender receiver'
                }).lean();
                return {
                    ...user,
                    conversation : conversation?conversation:null,
                    
                }
                
            })
        )
        return responseHandler(res,200,'all users',userWithConversation);
    }catch(error){
        console.log(error);
        return response(res,500,'internal server error');
    }
}

module.exports = {sendOtp,VerifyOtp,updateProfile,logout,checkAuthenticated,getAllUser}