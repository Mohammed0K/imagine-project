// ✅ Unified Navbar with Smart Loading (no flicker)
document.addEventListener("DOMContentLoaded", async () => {
  const navbarContainer = document.getElementById("navbar");
  if (!navbarContainer) return;

  try {
    // Load Navbar HTML
    const res = await fetch("../shared/navbar.html");
    const html = await res.text();
    navbarContainer.innerHTML = html;

    // Load Navbar CSS
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "../shared/navbar.css";
    document.head.appendChild(cssLink);

    // Add offset class
    document.body.classList.add("has-navbar");

    const authBtn = document.getElementById("auth-btn");
    const avatar = document.getElementById("user-avatar");

    // Hide both buttons while loading (prevent flicker)
    authBtn.style.visibility = "hidden";
    avatar.style.visibility = "hidden";

    // Highlight current page
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach((link) => {
      const linkPage = link.getAttribute("href").split("/").pop();
      if (linkPage === currentPage) link.classList.add("active");
    });

    // Wait for Supabase session restoration
    const { data: sessionData } = await supabaseClient.auth.getSession();
    let user = sessionData?.session?.user;

    if (!user) {
      // Try again after short delay (sometimes session takes time)
      await new Promise((r) => setTimeout(r, 500));
      const { data: retry } = await supabaseClient.auth.getSession();
      user = retry?.session?.user;
    }

        // ⛔️ إذا المستخدم في صفحة login.html لا نعمل أي إعادة توجيه
    if (window.location.pathname.includes("login.html")) {
      return; // نوقف هنا تمامًا
    }


    // ✅ IF LOGGED IN
    if (user) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("avatar_url, role")
        .eq("id", user.id)
        .single();

      avatar.src = profile?.avatar_url || "../assets/images/default.png";
      avatar.style.visibility = "visible";
      avatar.classList.remove("hidden");

      authBtn.textContent = "Logout";
      authBtn.classList.remove("btn-login");
      authBtn.classList.add("btn-logout");
      authBtn.style.visibility = "visible";

      authBtn.onclick = async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "../home/home.html";
      };

      // Guide pending logic
      let guide = null;
try {
  const { data, error } = await supabaseClient
    .from("guides")
    .select("status")
    .eq("id", user.id)
    .maybeSingle();

  // بعض أنواع الأخطاء (مثل 406) تعتبر Not Acceptable فقط وليست فشل فعلي
  if (error && error.code !== "PGRST116" && error.message !== "406 Not Acceptable") {
    console.warn("Guide check failed:", error.message);
  } else {
    guide = data;
  }
} catch (err) {
  console.warn("Guide check exception:", err.message);
}


      if (guide?.status === "pending") {
        await supabaseClient.auth.signOut();
        avatar.style.display = "none";
        authBtn.style.display = "none";
        window.location.href = "../guides/pending.html";
        return;
      }

      avatar.addEventListener("click", () => {
        if (profile?.role === "admin")
          window.location.href = "../dashboard/dashboard.html";
        else if (profile?.role === "guide")
          window.location.href = "../dashboard_guides/dashboard_guides.html";
        else window.location.href = "../user/profile.html";
      });
    }

    // ❌ IF LOGGED OUT
    else {
      avatar.classList.add("hidden");
      authBtn.textContent = "Login";
      authBtn.classList.remove("btn-logout");
      authBtn.classList.add("btn-login");
      authBtn.style.visibility = "visible";

      authBtn.onclick = () => {
        window.location.href = "../login/login.html";
      };
    }
  } catch (err) {
    console.error("❌ Navbar load failed:", err);
  }
});
