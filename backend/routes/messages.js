const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { addMessage, getMessages,addMediaMessage } = require("../contollers/messageController");
const { getAllChats, createOrAccessChat, createGroupChat,getAllGroups } = require("../contollers/chatController");
const authenticateUser = require('../middleware/auth');


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  });
  
  const upload = multer({ storage: storage });
  
  router.post("/", addMessage);
  router.post("/media", upload.single('file'), addMediaMessage);
  router.get("/:userId", getMessages);
router.get("/chats", authenticateUser, getAllChats);
router.post("/chat", authenticateUser, createOrAccessChat);
router.post("/groups", authenticateUser, upload.single('profilePicture'), createGroupChat);
router.get('/all', authenticateUser, getAllGroups);
module.exports = router;
