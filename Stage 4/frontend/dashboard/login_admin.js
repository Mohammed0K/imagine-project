console.log("✅ login_admin.js LOADED");

document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showToast("⚠️ Please fill in all fields", "error");
    return;
  }

  // ✅ تسجيل الدخول من Supabase Auth
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    showToast("❌ Invalid email or password.", "error");
    console.error(error);
    return;
  }

  // ✅ التحقق من أن المستخدم أدمن
  const { data: profile, error: profileErr } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileErr) {
    showToast("⚠️ Error checking admin role", "error");
    console.error(profileErr);
    return;
  }

  if (profile.role !== "admin") {
    showToast("🚫 Access denied. Admins only.", "error");
    await supabaseClient.auth.signOut();
    return;
  }

  showToast("✅ Operation completed successfully", "success");
  window.location.href = "../dashboard/dashboard.html";
});
