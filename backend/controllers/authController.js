const User = require("../models/user.model");
const responseHandler = require("../utils/responseHandler");
const otpGenrate = require('../utils/otpGenerator');
const sendOtpToEmail = require('../services/emailservice');

const tiwiloService = require('../services/twilloservice');

//send otp 


const sendOtp = async (req,res)=>{
    const {phoneNumber,phoneSuffix,email} = req.body;
    const otp = otpGenrate();
    const expiry = new Date(DAte.now() + 5 * 60 *1000);
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

module.exports = {sendOtp,VerifyOtp}