// ✅ Tourist Registration with Active Session Redirect
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

  // Validation
  if (password !== confirm) {
    alert("❌ Passwords do not match!");
    return;
  }
  if (password.length < 8) {
    alert("❌ Password must be at least 8 characters.");
    return;
  }

  submitBtn.disabled = true;

  try {
    // Create account
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: "customer", // keep matching DB role
        },
      },
    });

    submitBtn.disabled = false;

    if (error) {
      console.error("❌ Registration error:", error.message);
      alert("❌ " + error.message);
      return;
    }

    console.log("✅ User registered:", data);

    // ✅ Sync user info to 'profiles' table after registration
if (data?.user) {
  const { user } = data;

  // نحاول نحدّث السجل لو موجود فعلاً
  const { error: updateErr } = await supabaseClient
    .from("profiles")
    .update({
      full_name: name || null,
      email: user.email,
      role: "customer",
    })
    .eq("id", user.id);

  // لو السجل ما كان موجود (جديد كلياً)، ننشئه
  if (updateErr) {
    console.warn("⚠️ Could not update profile, inserting instead:", updateErr.message);
    await supabaseClient.from("profiles").insert({
      id: user.id,
      full_name: name || null,
      email: user.email,
      role: "customer",
    });
  }
}


    // Wait briefly for Supabase to create the session
    let tries = 0;
    let session = null;
    while (!session && tries < 10) {
      const { data: sessionData } = await supabaseClient.auth.getSession();
      session = sessionData?.session;
      if (!session) await new Promise((r) => setTimeout(r, 300));
      tries++;
    }

    if (session) {
      alert("🎉 Welcome to Imagine! You are now logged in.");
    } else {
      alert("✅ Account created successfully!");
    }

    // 🔹 بعد التسجيل (أو الدخول التلقائي بعد التسجيل)
    const redirect = localStorage.getItem("redirectAfterLogin");
    if (redirect) {
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = redirect;
    } else {
      window.location.href = "../home/home.html";
    }

  } catch (err) {
    console.error("⚠️ Unexpected error:", err);
    alert("Something went wrong during registration.");
    submitBtn.disabled = false;
  }
});
