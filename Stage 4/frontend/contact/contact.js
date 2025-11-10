// contact.js

const form = document.getElementById("contactForm");
const sendBtn = document.getElementById("sendBtn");
const btnText = sendBtn?.querySelector(".btn-text");

function setLoading(state) {
  if (!sendBtn) return;
  sendBtn.classList.toggle("loading", state);
  sendBtn.disabled = state;
  if (btnText) btnText.textContent = state ? "Sending..." : "Send Message";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // honeypot (bots often fill hidden fields)
  const hp = document.getElementById("website")?.value || "";
  if (hp.trim().length > 0) return; // silently drop

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  // Basic validations
  if (!name || !email || !message) {
    showToast("⚠️ Please fill in all fields.", "error");
    return;
  }
  if (name.length < 2 || name.length > 80) {
    showToast("⚠️ Name length must be 2–80 characters.", "error");
    return;
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk || email.length > 120) {
    showToast("⚠️ Please enter a valid email.", "error");
    return;
  }
  if (message.length < 10) {
    showToast("⚠️ Message is too short.", "error");
    return;
  }
  if (message.length > 1000) {
    showToast("⚠️ Message is too long (max 1000).", "error");
    return;
  }

  setLoading(true);

  try {
    // Prevent double submit by disabling the button
    const { error } = await supabaseClient
      .from("contact_messages")
      .insert([{ full_name: name, email, message }]);

    if (error) {
      console.error(error);
      showToast("❌ Failed to send message, try again.", "error");
      return;
    }

    showToast("✅ Message sent successfully!", "success");
    form.reset();
  } catch (err) {
    console.error(err);
    showToast("❌ Network error. Please try later.", "error");
  } finally {
    setLoading(false);
  }
});
