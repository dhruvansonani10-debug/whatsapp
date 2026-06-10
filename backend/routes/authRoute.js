const express = require('express');
const {sendOtp,VerifyOtp} = require('../controllers/authController');


const router = express.Router();

router.post('/send-otp',sendOtp);
router.post('/verify-otp',VerifyOtp);

module.exports = router;