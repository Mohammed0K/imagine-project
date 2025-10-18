document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (document.getElementById("email")?.value || "").trim();
    const password = document.getElementById("password")?.value || "";

    if (!email || !password) {
      alert("Please provide email and password.");
      return;
    }

    const payload = { email, password };

    try {
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const firstField = data && typeof data === "object" ? Object.keys(data)[0] : null;
        const firstMsg = firstField ? (Array.isArray(data[firstField]) ? data[firstField][0] : String(data[firstField])) : null;
        const msg = firstMsg || data.detail || res.statusText;
        alert("Login failed: " + msg);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "/dashboard";
    } catch {
      alert("Network error. Please try again.");
    }
  });
});
