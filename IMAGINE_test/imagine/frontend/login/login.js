document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    // مثال بسيط بدون backend
    if (email === "test@imagine.com" && password === "1234") {
      alert("Welcome back, traveler ✨");
      window.location.href = "../home/home.html";
    } else {
      alert("Invalid credentials. Try again!");
    }
  });
});
