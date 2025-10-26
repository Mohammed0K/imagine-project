console.log("✅ login.js LOADED");

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("❌ Please enter your email and password.");
    return;
  }

  // ✅ تسجيل الدخول عبر Supabase
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Login Error:", error.message);
    alert("❌ " + error.message);
    return;
  }

  const user = data.user;
  console.log("✅ Logged In:", user.email);

  // ✅ نتحقق من هل المستخدم مرشد سياحي
  const { data: guideRow, error: guideError } = await supabaseClient
    .from("guides")
    .select("status")
    .eq("id", user.id)
    .maybeSingle();

  if (guideRow) {
    // 💡 المستخدم فعلاً مرشد سياحي
    alert("⚠️ This account belongs to a Tour Guide.\nPlease log in through the guide login page instead.");
    await supabaseClient.auth.signOut();
    return;
  }

  // ✅ لو مو مرشد → يروح للصفحة الرئيسية أو لوحة المستخدم
  alert("✅ Welcome back!");
  window.location.href = "../home/home.html";
});
