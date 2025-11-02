document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    showToast("⚠️ Please fill in all fields.", "error");
    return;
  }

  // ✅ حفظ البيانات في Supabase
  const { error } = await supabaseClient
    .from("contact_messages")
    .insert([{ full_name: name, email, message }]);

  if (error) {
    showToast("❌ Failed to send message, try again.", "error");
    console.error(error);
    return;
  }

  showToast("✅ Message sent successfully!", "success");
  document.getElementById("contactForm").reset();
});
