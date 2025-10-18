document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (document.getElementById("name")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const message = (document.getElementById("message")?.value || "").trim();
    if (!name || !email || !message) { alert("Please fill in all fields."); return; }
    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Failed to send message: " + (err.detail || res.statusText));
        return;
      }
      alert("Thanks! Your message has been sent.");
      form.reset();
    } catch { alert("Network error. Please try again."); }
  });
});