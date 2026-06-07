const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    conversation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    }, 
    content:{
        type: String
    },
    imageOrVideoUrl:{
        type: String
    },
    contentType:{
        type: String,
        require: true,
        enum:['text','image','video']
    },  
    reaction:[{
        user:{type: mongoose.Schema.Types.ObjectId,ref: 'User'},
        emoji:{
            type:String
        }
    }],
    messageStatus:{
        type: String,
        default: 'sent',
    }
    

},{
    timestamps: true
})

module.exports = mongoose.model('Message', messageSchema);