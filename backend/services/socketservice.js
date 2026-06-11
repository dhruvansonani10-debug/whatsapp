const { Server } = require("socket.io");
const User = require("../models/User");
const Message = require("../models/Message.js");

const onlineUsers = new Map();
//const typingUsers = new Map();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log("user connected : ", socket.id);
    let userId = null;

    socket.on("user_connected", async (connectingUserId) => {
      try {
        userId = connectingUserId;
        onlineUsers.set(userId, socket.id);
        socket.join(userId);

        //update user status
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        //notify this user online to all user
        io.emit("user_status", { userId, isOnline: true });
      } catch (error) {
        console.log("error in user connected : ", error);
      }

      //return online status of request user

      socket.on("get_user_status", async (requestedUserId, callback) => {
        const isOnline = onlineUsers.has(requestedUserId);
        callback({
          userId: requestedUserId,
          isOnline,
          lastSeen: isOnline ? new Date() : null,
        });
      });
    });

    //forward mmessage to receiver if online
    socket.on("send_message", async (message) => {
      try {
        const receiverSocketId = onlineUsers.get(message.receiver?._id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }
      } catch (error) {
        console.log("error in send_message : ", error);
        socket.emit("message_error", {
          messageId: message._id,
          error: "Failed to send message",
        });
      }
    });

    //update message as read and notify to sender
    socket.on("message_read", async ({ messageId, senderId }) => {
      try {
        await Message.updateMany(
          { _id: messageId },
          { $set: { messageStatus: "read" } },
        );
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          messageIds.forEach((messageId) => {
            io.to(senderSocketId).emit("message_read", {
              messageId,
              messageStatus: "read",
            });
          });
        }
      } catch (error) {
        console.log("error in message read : ", error);
      }
    });

    //handle typing start event and auto stop after 3s
    socket.on("typing_start", ({ conversationId, receiverId }) => {
      if (!userId || !conversationId || !receiverId) return;

      if (!typingUsers.has(userId)) typingUsers.set(userId, {});

      const userTyping = typingUsers.get(userId);

      userTyping[conversationId] = true;

      //clear any existin timeout
      if (userTyping[`${conversationId}_timeout`]) {
        clearTimeout(userTyping[`${conversationId}_timeout`]);
      }

      //set 3s timeout
      userTyping[`${conversationId}_timeout`] = setTimeout(() => {
        userTyping[conversationId] = false;
        socket
          .to(receiverSocketId)
          .emit("user_typing", { userId, conversationId, isTyping: false });
      }, 3000);

      //notify receiver
      socket
        .to(receiverId)
        .emit("user_typing", { userId, conversationId, isTyping: true });
    });

    //handle typing stop event

    socket.on("typing_stop", ({ conversationId, receiverId }) => {
      if (!userId || !conversationId || !receiverId) return;

      if (!typingUsers.has(userId)) {
        const userTyping = typingUsers.get(userId);

        userTyping[conversationId] = false;
      }

      //clear any existin timeout
      if (userTyping[`${conversationId}_timeout`]) {
        clearTimeout(userTyping[`${conversationId}_timeout`]);
        delete userTyping[`${conversationId}_timeout`];
      }

      //notify receiver
      socket
        .to(receiverId)
        .emit("user_typing", { userId, conversationId, isTyping: false });
    });

    //add or update reaction on message
    socket.on(
      "add_reaction",
      async ({ messageId, userId, reactionUserId, emoji }) => {
        try {
          const message = await Message.findById(messageId);
          if (!message) {
            return socket.emit("reaction_error", {
              messageId,
              error: "Message not found",
            });
          }
          const exitingIndex = message.reactions.findIndex(
            (r) => r.user.toString() === reactionUserId,
          );
          if (exitingIndex > -1) {
            const exiting = message.reactions[exitingIndex];
            if (exiting.emoji == emoji) {
              message.reactions.splice(exitingIndex, 1);
            } else {
              message.reaction[exitingIndex].emoji = emoji;
            }
          } else {
            message.reactions.push({ user: reactionUserId, emoji });
          }
          await message.save();
          const populatedMessage = await Message.findById(messageId)
            .populate("sender", "username profilePicture")
            .populate("receiver", "username profilePicture")
            .populate("reactions.user", "username");

          const reactionUpdated = {
            messageId,
            reactions: populatedMessage.reactions,
          };

          const senderSocket = onlineUSers.get(
            populatedMessage.sender._id.toString(),
          );
          const receiverSocket = onlineUsers.get(
            populatedMessage.receiver._id.toString(),
          );

          if (senderSocket) {
            io.to(senderSocket).emit("reaction_updated", reactionUpdated);
          }
          if (receiverSocket) {
            io.to(receiverSocket).emit("reaction_updated", reactionUpdated);
          }
        } catch (error) {
          console.log("error in reaction : ", error);
        }
      },
    );

    //handle discoonection and mark user offline

    const handleDisconnect = async () => {
      if (userId) return;
      try {
        onlineUsers.delete(userId);

        //clear all typing timeout
        if (typingUsers.has(userId)) {
          const userTyping = typingUsers.get(userId);
          Object.keys(userTyping).forEach((key) => {
            if (key.endsWith("_timeout")) {
              clearTimeout(userTyping[key]);
            }
          });
          typingUsers.delete(userId);
        }

        //update last seen
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        io.emit("user_status", {
          userId,
          isOnline: false,
          lastSeen: new Date(),
        });

        socket.leave(userId);
        console.log("user disconnected : ", userId);
      } catch (error) {
        console.log("error in disconnect : ", error);
      }
    };
    //disconnect event
    socket.on("disconnect", handleDisconnected);
  });

  //attach the online user map to the socket server for external user
  io.socketUserMap = onlineUsers;

  return io;
};

module.exports = initializeSocket;
