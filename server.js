const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// File used to save chat messages
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "messages.json");

// Create the data folder if it does not exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load saved messages when the server starts
let messages = [];

try {
  if (fs.existsSync(DATA_FILE)) {
    const savedData = JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8")
    );

    if (Array.isArray(savedData)) {
      messages = savedData;
    }
  }
} catch (error) {
  console.error("Could not load saved messages:", error.message);
}

function saveMessages() {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(messages, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Could not save messages:", error.message);
  }
}

// Serve website files from the public folder
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  let username = "";

  socket.on("join-chat", (name) => {
    if (typeof name !== "string") return;

    name = name.trim().replace(/\s+/g, " ").slice(0, 24);

    if (!name) return;

    username = name;

    // Send previous messages to the user
    socket.emit("chat-history", messages);

    // Notify everyone that a user joined
    io.emit("system-message", `${username} joined the chat.`);
  });

  socket.on("send-message", (text) => {
    if (!username || typeof text !== "string") return;

    text = text.trim().slice(0, 1000);

    if (!text) return;

    const message = {
      username: username,
      text: text,
      time: new Date().toISOString()
    };

    // Save the new message in memory
    messages.push(message);

    // Keep the latest 500 messages
    if (messages.length > 500) {
      messages = messages.slice(-500);
    }

    // Save messages to the JSON file
    saveMessages();

    // Send the message to all connected users
    io.emit("new-message", message);
  });

  socket.on("disconnect", () => {
    if (username) {
      io.emit("system-message", `${username} left the chat.`);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`TechSoft Group Chat running on port ${PORT}`);
  console.log("Saved messages will be loaded automatically.");
});