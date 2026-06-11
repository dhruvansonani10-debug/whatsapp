const express = require('express');
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middleware/authMiddleware');
const {multerMiddleware} = require('../config/cloudinary');

const router = express.Router();

router.post('/',authMiddleware,multerMiddleware,statusController.createStatus);
router.get('/',authMiddleware,statusController.getStauts);
router.put('/:statusId/view',authMiddleware,statusController.viewStauts);
router.delete('/:statusId',authMiddleware,statusController.deleteStatus);

//protected route

module.exports = router;  