document.addEventListener("DOMContentLoaded", () => {
  const form =
    document.getElementById("registerForm") ||
    document.querySelector('form[action*="register"], form');

  if (!form) return;

  const pick = (sel) => document.querySelector(sel);

  const nameEl =
    pick('#name') ||
    pick('#fullName') ||
    pick('input[name="name"]') ||
    pick('input[name="full_name"]') ||
    pick('input[placeholder*="Full Name" i]');

  const emailEl =
    pick('#email') ||
    pick('input[type="email"][name="email"]') ||
    pick('input[name="user[email]"]') ||
    pick('input[placeholder*="Email" i]');

  const pwdEl =
    pick('#password') ||
    pick('input[type="password"][name="password"]') ||
    pick('input[name="pass"]');

  const confirmEl =
    pick('#confirm') ||
    pick('input[name="confirm"]') ||
    pick('input[name="password2"]') ||
    pick('input[name="confirm_password"]') ||
    pick('input[placeholder*="Confirm" i]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (nameEl?.value || "").trim();
    const email = (emailEl?.value || "").trim();
    const password = pwdEl?.value || "";
    const confirm = confirmEl?.value || "";

    if (!name || !email || !password || !confirm) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    const username = (name ? name.replace(/\s+/g, "_") : email.split("@")[0]).toLowerCase();
    const payload = { username, email, password };

    try {
      const res = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const firstField = data && typeof data === "object" ? Object.keys(data)[0] : null;
        const firstMsg = firstField ? (Array.isArray(data[firstField]) ? data[firstField][0] : String(data[firstField])) : null;
        const msg = firstMsg || data.detail || res.statusText;
        alert("Register failed: " + msg);
        return;
      }

      alert("Account created successfully. Please sign in.");
      window.location.href = "/login";
    } catch {
      alert("Network error. Please try again.");
    }
  });
});
