const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    profilePicture: { type: String }, // Add this line
    bio: { type: String }, // You might want to add this as well if it's not already included
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);