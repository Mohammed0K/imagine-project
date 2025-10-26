console.log("✅ login_admin.js LOADED");

document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("⚠️ Please fill in all fields");
    return;
  }

  // ✅ تسجيل الدخول من Supabase Auth
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    alert("❌ Invalid email or password.");
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
    alert("⚠️ Error checking admin role");
    console.error(profileErr);
    return;
  }

  if (profile.role !== "admin") {
    alert("🚫 Access denied. Admins only.");
    await supabaseClient.auth.signOut();
    return;
  }

  alert("✅ Welcome, Admin!");
  window.location.href = "../dashboard/dashboard.html";
});
