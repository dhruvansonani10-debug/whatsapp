const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    phoneNumber:{
        type: String,
        required: true
    },
    phoneSuffix:{
        type: String,
        required: true
    },
    
    username:{
        type:String,
        required: true
    },
    email:{
        type:String,
        lowercase: true,
        unique: true,
        trim: true,      // Removes accidental whitespaces from the beginning/end
        validate: {
      validator: (value) => validator.isEmail(value),
      message: props => `${props.value} is not a valid email address!`
    }

    },
    emailOtp:{
        type:String,
    },
    emailOtpExpiry:{
        type:Date
    },
    profilePicture:{
        type: String,
        required: true
    },
    about:{
        type:String,
    },
    lastSeen:{
        type:Date,
    },
    isOnline:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    agreedToTerms:{
        type:Boolean,
        default:false
    }
    
    


},{
    timestamps: true
}) 

module.exports = mongoose.model("User", userSchema);