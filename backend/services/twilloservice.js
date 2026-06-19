require('dotenv').config();
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID 
const authToken = process.env.TWILIO_AUTH_TOKEN 
const serviceSid = process.env.TWILIO_SERVICE_SID 
if (!accountSid || !authToken || !serviceSid) {
    throw new Error(
        'Missing Twilio configuration: set TWILIO_ACCOUNT_SID/TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN/TWILIO_AUTH_TOKEN, and TWILIO_SERVICE_SID/TWILIO_SERVICE_SID.',
    );
}

const client = twilio(accountSid, authToken);

const sendOtpToPhoneNumber = async (phoneNumber) => {
    try {
        console.log("sending otp to this number ", phoneNumber);
        if (!phoneNumber) {
            throw new Error("Please provide phone number");
        }
        const response = await client.verify.v2.services(serviceSid).verifications.create({ to: phoneNumber, channel: "sms" });
        console.log("otp sent successfully", response);
        return response;
    } catch (error) {
        console.log("Error sending otp", error);
        throw error;
    }
};

const VerifyOtp = async (phoneNumber, otp) => {
    try {
        console.log("this is my otp",otp);
        console.log("this number",phoneNumber)
        const response = await client.verify.v2.services(serviceSid).verificationChecks.create({ to: phoneNumber, code: otp });
        console.log("this is my otp response",response)
        return response;
    } catch (error) {
        console.log("Error verifying otp", error)
        throw error;
    }
};

module.exports = {
    sendOtpToPhoneNumber,
    VerifyOtp
}
