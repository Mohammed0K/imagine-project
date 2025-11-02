console.log("✅ register.js LOADED");

const form = document.getElementById("registerForm");
const submitBtn = form?.querySelector('button[type="submit"]');

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = document.getElementById("phone").value.trim();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if (password !== confirm) return showToast("❌ Passwords do not match!", "error");
  if (password.length < 8) return showToast("❌ Password must be at least 8 characters.", "error");

  submitBtn.disabled = true;

  try {
    // ✅ 1) إنشاء المستخدم وتخزين الاسم بشكل صحيح
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role: "customer" } },
    });
    if (error) throw error;

    const user = data?.user;

    // ✅ 2) إنشاء أو تحديث صف الـ profile
    if (user) {
      const { error: upsertErr } = await supabaseClient
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: name,
            role: "customer",
            phone: phone,
          },
          { onConflict: "id" }
        );
      if (upsertErr) console.warn("⚠️ profiles upsert:", upsertErr.message);

      // ✅ 3) تحديث بيانات المستخدم في metadata (اختياري)
      await supabaseClient.auth.updateUser({
        data: { full_name: name, role: "customer" },
      });
    }

    showToast("✅ Operation completed successfully", "success");
    window.location.href = "../home/home.html";
  } catch (err) {
    console.error("❌ Registration error:", err);
    showToast("❌ " + (err?.message || "Registration failed"), "error");
  } finally {
    submitBtn.disabled = false;
  }
});
