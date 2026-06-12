const Conversation = require('../models/Conversation.js')
const {uploadFileToCloudinary} = require('../config/cloudinary.js');
const Message = require('../models/Message.js')



exports.sendMessage = async(req,res)=>{
    try {
        const {senderId,content,receiverId,messageStatus} = req.body;
        const file = req.file;

        const participants = [senderId,receiverId].sort();
        //check if converstation already exits
        let conversation = await Conversation.findOne({
            participants : participants,
        })
        
        if(!conversation){
            conversation = await Conversation({
                participants
            })
            await conversation.save();
        }
        let imageOrVideoUrl = null;
        let contentType = null;

        if(file){
            const uploadFile = await uploadFileToCloudinary(file);
            if(!uploadFile?.secure_url){
                return responseHandler.response(res,400,"file upload failed");
            }
            imageOrVideoUrl = uploadFile?.secure_url;
            if(file.mimetype.startsWith('image')){
                contentType = "image"
            }else if(file.mimetype.startsWith('video')){
                contentType = "video"
            }
            else{
                return response(res,400,'unsupported file type')
            }
        }
        else if(content?.trim()){
            contentType = "text";
        }
        else{
            return response(res,400,'message content is required')
        }
        const message = new Message({
            sender: senderId,
            receiver:receiverId,
            content, 
            messageStatus,
            conversation:conversation?._id,
            imageOrVideoUrl,
            contentType
        })

        await message.save();

        if(message?.content){
            conversation.lastMessage = message?.id
        }
        conversation.unreadCount+=1;
        await conversation.save();

        const populatedMessage = await Message.findOne(message?._id).populate("sender","username profilePicture")
        .populate("receiver","username profilePicture")

        //emit socket event for realtime
        if(req.io && req.socketUserMap){
            const receiverSocketId = req.socketUserMap.get(receiverId);
            if(receiverSocketId){
                req.io.to(receiverSocketId).emit("new_message",populatedMessage);
                message.messageStatus = "delivered";
                
            }
        }
        return responseHandler.response(res,201,"messagge sent successfully",populatedMessage)
    } catch (error) {
        console.log(error);
        return responseHandler.response(res,500,"internal server error")
    }
};

//get all conversation

exports.getConversation = async(req,res) => {
    const userId = req.user.userId;
    try{
        const conversations = await Conversation.find({participants : userId}).populate("participants","username profilePicture isOnline lastSeen")
        .populate({
            path:"lastMessage",
            populate:{
                path:"sender receiver",
                select:"username profilePicture"
            }
        }).sort({updatedAt : -1})
        return responseHandler.response(res,200,'conversations fetched successfully',conversations);
    }catch(error){
        console.log(error);
        return responseHandler.response(res,500,'internal server error');
    }
}

//get message of specific conversation

exports.getMessages = async(req,res) => {
    const {conversationId}=req.params;
    const userId = req.user.userId;
    try{
        const conversation= await Conversation.findById(conversationId);
        if(!conversation){
            return responseHandler.response(res,404,'conversation not found');
        }
        if(!conversation.participants.includes(userId)){
            return responseHandler.response(res,403,'you are not authorized to access this conversation');
        }
        const messages = await Message.find({conversation:conversationId}).populate("sender","username profilePicture")
        .populate("receiver","username profilePicture").sort("createdAt")

        await Message.updateMany({conversation:conversationId ,receiver:userId , messageStatus:{$in : ["send","delivered"]},},{$set:{messageStatus:"read"},},);
        conversation.unreadCount=0;
        await conversation.save();
        return responseHandler.response(res,200,'messages fetched successfully',messages);
    }
    catch(error){
        console.log(error);
        return responseHandler.response(res,500,'internal server error');
    }
}

//read double teek
exports.markAsRead = async(req,res) => {
    const {messageIds}=req.body;
    const userId = req.user.userId;
    try{
       let message = await Message.find({_id:{$in:messageIds},receiver:userId})
       await Message.updateMany({_id:{$in:messageIds},receiver:userId},{$set:{messageStatus:"read"}});
//notify to original sender
               //emit socket event for realtime
        if(req.io && req.socketUserMap){
            for(const message of messages){
                const senderSocketId = req.socketUserMap.get(message.sender.toString());
                if(senderSocketId){
                    const updateMessage = {
                        _id:message._id,
                        messageStatus:"read"
                    }
                    req.io.to(senderSocketId).emit("message_read",updateMessage);
                    await message.save();
                }
            }
        }
       return responseHandler.response(res,200,'messages marked as read successfully',message);
    }
    catch(error){
        console.log(error);
        return responseHandler.response(res,500,'internal server error');
    }
}


//delete msg

exports.deleteMessage = async(req,res) => {
    const {messageIds} = req.body;
    const userId = req.user.userId;
    try{
        const message = await Message.findById(messageIds)
        if(!message){
            return responseHandler.response(res,404,'message not found')
        }
        if(message.sender.toSting() !== userId){
            return response(res,403,"not authorized to delete this message")

        }
        await message.deleteOne();
                //emit socket event for realtime
        if(req.io && req.socketUserMap){
            const receiverSocketId = req.socketUserMap.get(message.receiver.toString());
            if(receiverSocketId){
                req.io.to(receiverSocketId).emit("message_deleted",{messageId:message._id});
            }
        }
        return responseHandler.response(res,200,'message deleted successfully',message);
    }
    catch(error){
        console.log(error);
        return responseHandler.response(res,500,'internal server error');
    }
}