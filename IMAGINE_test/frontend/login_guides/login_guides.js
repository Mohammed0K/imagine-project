document.getElementById("guideLoginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // مؤقتاً تحقق بسيط (بدون backend)
  if (email && password) {
    // نحفظ حالة الدخول في localStorage مؤقتاً
    localStorage.setItem("guideLoggedIn", "true");
    localStorage.setItem("guideEmail", email);

    // تحويل إلى لوحة التحكم
    window.location.href = "../dashboard_guides/dashboard_guides.html";
  } else {
    alert("Please enter both email and password.");
  }
});
