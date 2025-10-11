const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginError = document.getElementById("login-error");
const signupError = document.getElementById("signup-error");
const showSignupLink = document.getElementById("show-signup");
const showLoginLink = document.getElementById("show-login");
const authModal = document.getElementById("auth-modal");

const chatContainer = document.querySelector(".chat-container");
const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const typingSpan = document.getElementById("typing");

const avatarPreview = document.getElementById("signup-avatar-preview");
const shuffleAvatarBtn = document.getElementById("shuffle-avatar");
const avatarInput = signupForm.querySelector("input[name='avatar']");

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
  "https://i.pravatar.cc/150?img=10"
];

let currentAvatarIdx = 0;
function setSignupAvatar(idx) {
  avatarPreview.src = AVATAR_URLS[idx];
  avatarInput.value = AVATAR_URLS[idx];
  currentAvatarIdx = idx;
}
setSignupAvatar(0);

shuffleAvatarBtn.onclick = () => {
  let idx;
  do {
    idx = Math.floor(Math.random() * AVATAR_URLS.length);
  } while (idx === currentAvatarIdx);
  setSignupAvatar(idx);
};

let socket;
let currentUser = null;

showSignupLink.onclick = () => {
  loginForm.style.display = "none";
  signupForm.style.display = "flex";
  clearErrors();
};
showLoginLink.onclick = () => {
  signupForm.style.display = "none";
  loginForm.style.display = "flex";
  clearErrors();
};

function clearErrors() {
  loginError.textContent = "";
  signupError.textContent = "";
}

async function apiPost(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function login(username, password) {
  const res = await apiPost("/api/signin", { username, password });
  if (res.error) {
    loginError.textContent = res.error;
    return false;
  }
  localStorage.setItem("token", res.token);
  currentUser = { username: res.username, avatar: res.avatar || AVATAR_URLS[0] };
  return true;
}

async function signup(username, password, avatar) {
  const res = await apiPost("/api/signup", { username, password, avatar });
  if (res.error) {
    signupError.textContent = res.error;
    return false;
  }
  return true;
}

function initSocket(token) {
  socket = io({ auth: { token } });

  socket.on("connect_error", (err) => {
    alert("Socket auth failed: " + err.message);
    logout();
  });

  authModal.style.display = "none";
  chatContainer.style.display = "flex";

  socket.on("chat-history", (messages) => {
    chatBox.innerHTML = "";
    messages.forEach((msg) =>
      addMessage(msg.user, msg.message, msg.user === currentUser.username, msg.timestamp, msg.avatar)
    );
  });

socket.on("chat-message", async (data) => {
  const msg = new Message({
    user: socket.username,
    avatar: socket.avatar,
    message: data,
    timestamp: new Date(),
  });
  await msg.save();

  // Send to all except sender
  socket.broadcast.emit("chat-message", {
    user: socket.username,
    avatar: socket.avatar,
    message: data,
    timestamp: msg.timestamp,
  });
});


  socket.on("user-joined", (msg) => addSystemMessage(msg));
  socket.on("user-left", (msg) => addSystemMessage(msg));
  socket.on("typing", (user) => {
    typingSpan.textContent = `${user} is typing...`;
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => (typingSpan.textContent = ""), 2000);
  });

  socket.on("kicked", (msg) => {
    alert(msg);
    logout();
  });
}

function addMessage(user, message, self, timestamp, avatarUrl) {
  const div = document.createElement("div");
  div.classList.add("message", self ? "self" : "other");
  const timeString = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  div.innerHTML = `
    <img class="avatar-img" src="${avatarUrl || AVATAR_URLS[0]}" alt="${user}" />
    <div class="text">
      <div class="user">${user} <span class="timestamp">${timeString}</span></div>
      <div>${escapeHtml(message)}</div>
    </div>
  `;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addSystemMessage(msg) {
  const div = document.createElement("div");
  div.className = "system-msg";
  div.textContent = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;

  // Add immediately for UI responsiveness
  addMessage(currentUser.username, message, true, new Date(), currentUser.avatar);

  // Emit to server
  socket.emit("chat-message", message);

  messageInput.value = "";
});



messageInput.addEventListener("input", () => {
  socket.emit("typing");
});

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  clearErrors();
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value;
  if (await login(username, password)) {
    initSocket(localStorage.getItem("token"));
  }
};

signupForm.onsubmit = async (e) => {
  e.preventDefault();
  clearErrors();
  const username = signupForm.username.value.trim();
  const password = signupForm.password.value;
  const avatar = avatarInput.value;
  if (await signup(username, password, avatar)) {
    signupError.textContent = "Signup successful. Please sign in.";
    showLoginLink.click();
  }
};

window.onload = async () => {
  // const token = localStorage.getItem("token");
  // if (token) {
  //   try {
  //     const payload = JSON.parse(atob(token.split('.')[1]));
  //     currentUser = { username: payload.username, avatar: payload.avatar || AVATAR_URLS[0] };
  //     initSocket(token);
  //   } catch (err) {
  //     localStorage.removeItem("token");
  //   }
  // }

  window.onload = () => {
  // Always require sign-in: clear stored token
  localStorage.removeItem("token");
  // The auth modal will display since user is not logged in
};

};

function logout() {
  localStorage.removeItem("token");
  location.reload();
}
