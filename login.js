const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const loginError = document.getElementById("loginError");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = usernameInput.value
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24);

  if (!username) {
    loginError.textContent = "Please enter your display name.";
    usernameInput.focus();
    return;
  }

  try {
    sessionStorage.setItem("techsoftUsername", username);
    window.location.href = "chat.html";
  } catch (error) {
    loginError.textContent =
      "Your browser could not save your name. Please enable session storage.";
  }
});

usernameInput.addEventListener("input", () => {
  loginError.textContent = "";
});