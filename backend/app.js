const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const http = require("http");
const socketIo = require("socket.io");
const multer = require('multer');
require('dotenv').config();
const messageRoutes = require("./routes/messages");
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const chatRoutes = require("./routes/messages");

const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.MONGO_URI).then((response) => {
    console.log('Connected to the database successfully.');
}).catch(error => {
    console.log('Unable to connect to the database.', error);
});

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/ping", (_req, res) => {
  return res.json({ msg: "Ping Successful" });
});

app.use("/api/messages", messageRoutes);
// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/api", chatRoutes);

const PORT = process.env.PORT || 4500;
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true
  }
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  console.log(`A user connected: ${socket.id}`);

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User added: ${userId}`);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      io.to(sendUserSocket).emit("msg-recieve", data.msg);
      console.log(`Message sent to user ${data.to}`);
    }
  });

  socket.on("disconnect", () => {
    for (const [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
