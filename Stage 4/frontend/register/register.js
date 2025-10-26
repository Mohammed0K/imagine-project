// ✅ Tourist Registration with Instant Login + Safe ENUM + Profile Sync
console.log("✅ register.js LOADED");

const form = document.getElementById("registerForm");
if (!form) {
  console.error("❌ registerForm not found");
}

const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  // ✅ Validations
  if (password !== confirm) {
    alert("❌ Passwords do not match!");
    return;
  }
  if (password.length < 8) {
    alert("❌ Password must be at least 8 characters.");
    return;
  }

  submitBtn.disabled = true;
  console.log("🔄 Registering user...");

  try {
    // ✅ Signup Request
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          // ✅ role will be assigned by DB DEFAULT ENUM (no send!)
        }
      }
    });

    if (error) {
      console.error("❌ Registration Error:", error.message);
      alert("❌ " + error.message);
      submitBtn.disabled = false;
      return;
    }

    const user = data?.user;
    console.log("✅ User registered:", user);

    if (!user) {
      alert("✅ Account created — please login!");
      window.location.href = "../login/login.html";
      return;
    }

    // ✅ Wait for session (email confirmations OFF ✅)
    let session = null;
    for (let i = 0; i < 10 && !session; i++) {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      session = sessionData?.session;
      if (!session) await new Promise((r) => setTimeout(r, 300));
    }

    console.log("✅ Session:", session);

    // ✅ Profile Sync (No ENUM role → DB default applies)
    const { data: existingProfile } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

      
    if (!existingProfile) {
      console.log("🆕 Creating profile...");
      const { error: profileErr } = await supabaseClient.from("profiles").insert({
        id: user.id,
        full_name: name,
        email: user.email
        // ❌ DO NOT send role here → DB DEFAULT ENUM handles it ✅
      });

      if (profileErr) console.error("⚠️ Profile Insert Failed:", profileErr.message);
    }

    alert("🎉 Welcome! Registration Completed ✅");

    // ✅ Redirection Logic
    const redirect = localStorage.getItem("redirectAfterLogin");
    if (redirect) {
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = redirect;
    } else {
      window.location.href = "../home/home.html";
    }

  } catch (err) {
    console.error("⚠️ Unexpected Error:", err);
    alert("Something went wrong.");
  }

  submitBtn.disabled = false;
});
