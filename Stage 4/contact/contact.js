document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  // مؤقتًا نعرض رسالة نجاح
  alert(`✅ Thank you, ${name}! Your message has been sent.`);
  document.getElementById("contactForm").reset();
});
