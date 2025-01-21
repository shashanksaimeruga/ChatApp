const Messages = require("../models/messageModal");
const CryptoJS = require('crypto-js');
const multer = require('multer');
const path = require('path');

const encryptMessage = (message, key) => {
  return CryptoJS.AES.encrypt(message, key).toString();
};

const decryptMessage = (ciphertext, key) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

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

exports.getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const encryptionKey = process.env.ENCRYPTION_KEY;

    const messages = await Messages.find({
      users: userId,
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => ({
      ...msg._doc,
      content: msg.message.text ? decryptMessage(msg.message.text, encryptionKey) : '',
      mediaUrl: msg.message.mediaUrl,
      mediaType: msg.message.mediaType,
    }));
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

exports.addMessage = async (req, res, next) => {
  try {
    console.log("Received message data:", req.body);
    const { from, to, content, isGroupChat, groupName } = req.body;

    if (!from) {
      return res.status(400).json({ error: 'Sender ID is required' });
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedMessage = encryptMessage(content, encryptionKey);

    console.log("Creating message with data:", {
      message: { text: encryptedMessage },
      users: isGroupChat ? to : [from, to],
      sender: from,
      isGroupChat,
      groupName: isGroupChat ? groupName : undefined,
    });

    const data = await Messages.create({
      message: { text: encryptedMessage },
      users: isGroupChat ? to : [from, to],
      sender: from,
      isGroupChat,
      groupName: isGroupChat ? groupName : undefined,
    });

    if (data) {
      console.log("Message created successfully:", data);
      return res.json({ msg: "Message added successfully.", data });
    } else {
      console.log("Failed to create message");
      return res.status(500).json({ error: "Failed to add message to the database" });
    }
  } catch (ex) {
    console.error("Error in addMessage:", ex);
    next(ex);
  }
};
exports.addMediaMessage = async (req, res, next) => {
  try {
    console.log("Received media message data:", req.body);
    const { from, to, isGroupChat } = req.body;

    if (!from) {
      return res.status(400).json({ error: 'Sender ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;
    const messageData = {
      text: encryptMessage(req.file.originalname, encryptionKey),
      mediaUrl: `/uploads/${req.file.filename}`,
      mediaType: req.file.mimetype
    };

    console.log("Creating media message with data:", {
      message: messageData,
      users: isGroupChat === 'true' ? JSON.parse(to) : [from, to],
      sender: from,
      isGroupChat: isGroupChat === 'true',
    });

    const data = await Messages.create({
      message: messageData,
      users: isGroupChat === 'true' ? JSON.parse(to) : [from, to],
      sender: from,
      isGroupChat: isGroupChat === 'true',
    });

    if (data) {
      console.log("Media message created successfully:", data);
      return res.json({ msg: "Media message added successfully.", data });
    } else {
      console.log("Failed to create media message");
      return res.status(500).json({ error: "Failed to add media message to the database" });
    }
  } catch (ex) {
    console.error("Error in addMediaMessage:", ex);
    next(ex);
  }
};