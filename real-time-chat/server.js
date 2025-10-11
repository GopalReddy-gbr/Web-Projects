require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: String,
});
const messageSchema = new mongoose.Schema({
  user: String,
  avatar: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

const AVATAR_URLS = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=6",
  "https://i.pravatar.cc/150?img=7",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=10",
];

// Signup API
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password, avatar } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required." });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." });
    }
    const hash = await bcrypt.hash(password, 10);
    const avatarUrl = avatar && avatar.trim() ? avatar : AVATAR_URLS[Math.floor(Math.random() * AVATAR_URLS.length)];
    const user = new User({ username, password: hash, avatar: avatarUrl });
    await user.save();
    res.status(201).json({ msg: "User created!", avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// Signin API
app.post('/api/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required." });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign({ username, avatar: user.avatar }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// Delete user (admin use)
app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const deleted = await User.findOneAndDelete({ username });
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: `User ${username} deleted.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// Admin kick user (only kicks if online)
const onlineUsers = new Map();

app.post('/api/kick', (req, res) => {
  const { username } = req.body;
  const targetSocket = onlineUsers.get(username);
  if (targetSocket) {
    targetSocket.emit("kicked", "You have been removed by admin.");
    targetSocket.disconnect(true);
    onlineUsers.delete(username);
    res.json({ message: `${username} has been kicked.` });
  } else {
    res.status(404).json({ error: "User not online" });
  }
});


// Chat history API
app.get('/api/history', async (req, res) => {
  try {
    const msgs = await Message.find().sort({ timestamp: 1 }).limit(30);
    res.json(msgs);
  } catch {
    res.status(500).json({ error: "Failed to load chat history." });
  }
});

// Socket.io auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.username = decoded.username;
    socket.avatar = decoded.avatar;
    next();
  });
});

// Socket.io event handlers
io.on("connection", async (socket) => {
  onlineUsers.set(socket.username, socket);

  const recentMessages = await Message.find().sort({ timestamp: 1 }).limit(30);
  socket.emit("chat-history", recentMessages);
  socket.broadcast.emit("user-joined", `${socket.username} joined the chat`);

  socket.on("chat-message", async (data) => {
    const msg = new Message({
      user: socket.username,
      avatar: socket.avatar,
      message: data,
      timestamp: new Date(),
    });
    await msg.save();
    io.emit("chat-message", {
      user: socket.username,
      avatar: socket.avatar,
      message: data,
      timestamp: msg.timestamp,
    });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", socket.username);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.username);
    io.emit("user-left", `${socket.username} left the chat`);
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true,
}).then(() => {
  console.log("✅ MongoDB connected");
  server.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT || 3000}`);
  });
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});
