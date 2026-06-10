const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const {multerMiddleware} = require('../config/cloudinary');

const router = express.Router();

router.post('/send-message',authMiddleware,multerMiddleware,chatController.sendMessage);
router.get('/conversation',authMiddleware,chatController.getConversation);
router.get('/conversation/:conversationId/messages',authMiddleware,chatController.getMessages);
router.put('/messages/read',authMiddleware,chatController.markAsRead);
router.delete('/message/:messageId',authMiddleware,chatController.deleteMessage);

//protected route

module.exports = router;  