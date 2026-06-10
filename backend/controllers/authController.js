const User = require("../models/user.model");
const responseHandler = require("../utils/responseHandler");
const otpGenrate = require('../utils/otpGenerator');

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
        await user.save();
        return response(res,200,'otp send to your user',user)
        
    }catch(error){
        console.log(error);
        return response(res,500,'internal server error');
    }
}