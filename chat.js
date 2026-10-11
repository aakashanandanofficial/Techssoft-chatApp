const username = sessionStorage.getItem("techsoftUsername");

if (!username || !username.trim()) {
  window.location.replace("index.html");
} else {
  startChat(username);
}

function startChat(username) {
  const socket = io();

  const messages = document.getElementById("messages");
  const emptyState = document.getElementById("emptyState");
  const messageForm = document.getElementById("messageForm");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const logoutButton = document.getElementById("logoutButton");
  const profileName = document.getElementById("profileName");
  const profileAvatar = document.getElementById("profileAvatar");

  profileName.textContent = username;
  profileAvatar.textContent = username.charAt(0).toUpperCase();

  let joined = false;

  socket.on("connect", () => {
    joined = true;
    sendButton.disabled = false;
    socket.emit("join-chat", username);
  });

  socket.on("disconnect", () => {
    joined = false;
    sendButton.disabled = true;
    showSystemMessage("Connection lost. Reconnecting...");
  });

  socket.on("connect_error", () => {
    showSystemMessage("Unable to connect to the chat server.");
  });

  socket.on("chat-history", (history) => {
    if (!Array.isArray(history)) return;

    history.forEach((message) => {
      if (
        message &&
        typeof message.username === "string" &&
        typeof message.text === "string"
      ) {
        showMessage(message);
      }
    });
  });

  socket.on("system-message", (text) => {
    if (typeof text === "string") {
      showSystemMessage(text);
    }
  });

  socket.on("new-message", (message) => {
    if (
      message &&
      typeof message.username === "string" &&
      typeof message.text === "string"
    ) {
      showMessage(message);
    }
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text || !joined) return;

    socket.emit("send-message", text.slice(0, 1000));
    messageInput.value = "";
    messageInput.focus();
  });

  logoutButton.addEventListener("click", () => {
    socket.disconnect();
    sessionStorage.removeItem("techsoftUsername");
    window.location.href = "index.html";
  });

  function showMessage(message) {
    emptyState?.remove();

    const row = document.createElement("article");
    row.className = "message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = message.username.charAt(0).toUpperCase();

    const content = document.createElement("div");
    content.className = "message-content";

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const name = document.createElement("span");
    name.className = "message-name";
    name.textContent = message.username;

    const time = document.createElement("time");
    time.className = "message-time";

    const date = message.time ? new Date(message.time) : new Date();

    time.dateTime = Number.isNaN(date.getTime())
      ? new Date().toISOString()
      : date.toISOString();

    time.textContent = Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });

    const text = document.createElement("div");
    text.className = "message-text";
    text.textContent = message.text;

    meta.append(name, time);
    content.append(meta, text);
    row.append(avatar, content);
    messages.appendChild(row);

    messages.scrollTop = messages.scrollHeight;
  }

  function showSystemMessage(text) {
    const notice = document.createElement("div");
    notice.className = "system-message";
    notice.textContent = text;

    messages.appendChild(notice);
    messages.scrollTop = messages.scrollHeight;
  }

  sendButton.disabled = true;
}