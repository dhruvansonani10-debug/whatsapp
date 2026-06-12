const Status = require("../models/Status.js");
const { uploadFileToCloudinary } = require("../config/cloudinary.js");
const Message = require("../models/Message.js");
const response = require("../utils/responseHandler.js");

exports.createStatus = async (req, res) => {
  try {
    const { content, contentType } = req.body;
    const userId = req.user.userId;
    const file = req.file;

    let mediaUrl = null;
    let finalContentType = contentType || "text";
    //file upload
    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);
      if (!uploadFile?.secure_url) {
        return responseHandler.response(res, 400, "file upload failed");
      }
      imageOrVideoUrl = uploadFile?.secure_url;
      if (file.mimetype.startsWith("image")) {
        finalContentType = "image";
      } else if (file.mimetype.startsWith("video")) {
        finalContentType = "video";
      } else {
        return response(res, 400, "unsupported file type");
      }
    } else if (content?.trim()) {
      finalContentType = "text";
    } else {
      return response(res, 400, "message content is required");
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const status = new Status({
      user: userId,
      content: medialUrl || content,
      contentType: finalContentType,
      expiresAt,
    });
    await status.save();

    const populatedStatus = await Status.findOne(status?._id)
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture");

    //Emit socket event
    if (req.io && req.socketUserMap) {
      for (const [connectingUserId, socketId] of req.socketUserMap) {
        if (connectingUserId !== userId) {
          req.io.to(socketId).emit("new_status", populatedStatus);
        }
      }
    }

    return responseHandler.response(
      res,
      201,
      "status created successfully",
      populatedStatus,
    );
  } catch (error) {
    console.log(error);
    return responseHandler.response(res, 500, "internal server error");
  }
};

exports.getStauts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const status = await Status.find({
      expiresAt: { $gt: new Date() },
      user: { $ne: userId },
    })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .sort({ createdAt: -1 });
    return responseHandler.response(
      res,
      200,
      "status fetched successfully",
      status,
    );
  } catch (error) {
    console.log(error);
    return responseHandler.response(res, 500, "internal server error");
  }
};

exports.viewStauts = async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user.userId;
  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return responseHandler.response(res, 404, "status not found");
    }
    if (!status.viewers.includes(userId)) {
      status.viewers.push(userId);
      await status.save();

      const updateStatus = await Status.findById(statusId)
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture");
      //emit socket event
      if (req.io && req.socketUserMap) {
        //broadcast viewer update to all users
        const statusOwnerSocketId = req.socketUserMap.get(
          status?.user?._id.String(),
        );
        if (statusOwnerSocketId) {
          const viewData = {
            statusId,
            viewerId: userId,
            totalViewers: updateStatus.viewers.length,
            viewers: updateStatus.viewers,
          };

          req.io.to(statusOwnerSocketId).emit("status_viewed", viewData);
        } else {
          console.log("status owner not connected");
        }
      }
    } else {
      console.log("user already viewed the status");
    }

    return responseHandler.response(
      res,
      200,
      "status viewed successfully",
      updateStatus,
    );
  } catch (error) {
    console.log(error);
    return responseHandler.response(res, 500, "internal server error");
  }
};

exports.deleteStatus = async (req, res) => {
  const { statusId } = req.params;
  const userId = req.user.userId;
  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return responseHandler.response(res, 404, "status not found");
    }
    if (status.user.toSting() !== userId) {
      return responseHandler.response(
        res,
        403,
        "you are not authorized to delete this status",
      );
    }
    await status.deleteOne();
    //emit socket event
    if (req.io && req.socketUserMap) {
      for (const [connectingUserId, socketId] of req.socketUserMap) {
        if (connectingUserId != userId) {
          req.io.to(socketId).emit("status_deleted", { statusId });
        }
      }
    }

    return responseHandler.response(
      res,
      200,
      "status deleted successfully",
      status,
    );
  } catch (error) {
    console.log(error);
    return responseHandler.response(res, 500, "internal server error");
  }
};
