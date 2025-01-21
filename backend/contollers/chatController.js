const Chat = require('../models/chatModal');

exports.getAllChats = async (req, res, next) => {
    try {
      const chats = await Chat.find({
        users: req.user._id,
        $expr: { $gt: [{ $size: "$users" }, 1] }
      })
        .populate('users', 'username profilePicture')
        .sort({ updatedAt: -1 });
      res.json(chats);
    } catch (error) {
      next(error);
    }
  };

exports.createOrAccessChat = async (req, res, next) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: "UserId param not sent with request" });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    }).populate('users', '-password');

    if (chat) {
      res.json(chat);
    } else {
      const newChat = await Chat.create({
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      });

      const fullChat = await Chat.findOne({ _id: newChat._id }).populate('users', '-password');
      res.status(201).json(fullChat);
    }
  } catch (error) {
    next(error);
  }
};
exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await Chat.find({
      isGroupChat: true,
      users: req.user._id
    })
    .populate('users', 'username profilePicture')
    .populate('groupAdmin', 'username profilePicture')
    .sort({ updatedAt: -1 });

    console.log('Groups found:', groups);  // For debugging
    res.json(groups);
  } catch (error) {
    console.error('Error in getAllGroups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createGroupChat = async (req, res, next) => {
  const { name, members, bio } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  if (!name || !members || members.length < 2) {
    return res.status(400).json({ error: "Please provide a name and at least 2 members" });
  }

  try {
    const groupChat = await Chat.create({
      chatName: name,
      isGroupChat: true,
      users: [...members, req.user._id],
      groupAdmin: req.user._id,
      bio: bio,
      profilePicture: profilePicture
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', 'username profilePicture')
      .populate('groupAdmin', 'username profilePicture');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};