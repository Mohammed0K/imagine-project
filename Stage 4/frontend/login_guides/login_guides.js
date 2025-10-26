// ✅ Tourist Guide Login via Supabase
document.getElementById("guideLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("⚠️ Please enter both email and password.");
    return;
  }

  try {
    // ✅ Sign in using Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      alert("❌ Invalid email or password, or account not found. Please register first.");
      return (window.location.href = "../register_guides/register_guides.html");
    }

    const user = data.user;

    // ✅ Check the guide’s status in the database
    const { data: guide, error: guideError } = await supabaseClient
      .from("guides")
      .select("status")
      .eq("id", user.id)
      .single();

    if (guideError || !guide) {
      console.error("⚠️ No guide profile found for this user.");
      await supabaseClient.auth.signOut();
      return (window.location.href = "../register_guides/register_guides.html");
    }

    // 🕒 Pending approval
    if (guide.status === "pending") {
      alert("⏳ Your account is still pending admin approval. You will be logged out for now.");
      await supabaseClient.auth.signOut();
      return (window.location.href = "../guides/pending.html");
    }

    // ❌ Rejected account
    if (guide.status === "rejected") {
      alert("❌ Your application has been rejected. Please register again.");
      await supabaseClient.auth.signOut();
      return (window.location.href = "../register_guides/register_guides.html");
    }

    // ✅ Approved → Redirect to dashboard
    alert("✅ Login successful! Welcome to your guide dashboard.");
    window.location.href = "../dashboard_guides/dashboard_guides.html";

  } catch (err) {
    console.error("Unexpected error:", err);
    alert("❌ Something went wrong. Please try again later.");
  }
});
