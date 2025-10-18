// ==================== CHECK LOGIN ====================
if (!localStorage.getItem("guideLoggedIn")) {
  window.location.href = "../guides/login_guides.html";
}

// ==================== HEADER INFO ====================
const guideName = document.getElementById("guide-name");
const guideEmail = localStorage.getItem("guideEmail");
guideName.textContent = guideEmail || "Guide";

// ==================== LOGOUT ====================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("guideLoggedIn");
  localStorage.removeItem("guideEmail");
  localStorage.removeItem("guideName");
  localStorage.removeItem("guideAge");
  localStorage.removeItem("guideLicense");
  localStorage.removeItem("guideStatus");
  window.location.href = "../home/home.html";
});

// ==================== SIDEBAR NAVIGATION ====================
const sideButtons = document.querySelectorAll(".side-btn");
const sections = document.querySelectorAll("main section");
const sectionTitle = document.getElementById("section-title");

sideButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // إلغاء تفعيل الكل
    sideButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // إخفاء كل الأقسام
    sections.forEach((sec) => sec.classList.add("hidden"));

    // إظهار القسم المطلوب
    const target = btn.getAttribute("data-target");
    document.getElementById(target).classList.remove("hidden");

    // تغيير العنوان في الأعلى
    sectionTitle.textContent = btn.textContent.trim();
  });
});

// ==================== STATUS (Pause / Resume Requests) ====================
window.addEventListener("DOMContentLoaded", () => {
  const pauseBtn = document.getElementById("pauseBtn");
  if (!pauseBtn) return;

  // تحميل الحالة السابقة (من localStorage)
  const currentStatus = localStorage.getItem("guideStatus") || "active";

  if (currentStatus === "paused") {
    pauseBtn.classList.remove("active");
    pauseBtn.classList.add("paused");
    pauseBtn.textContent = "Paused";
  } else {
    pauseBtn.classList.remove("paused");
    pauseBtn.classList.add("active");
    pauseBtn.textContent = "Receiving Requests";
  }

  // عند الضغط على الزر
  pauseBtn.addEventListener("click", () => {
    if (pauseBtn.classList.contains("active")) {
      pauseBtn.classList.remove("active");
      pauseBtn.classList.add("paused");
      pauseBtn.textContent = "Paused";
      localStorage.setItem("guideStatus", "paused");
      showToast("🟠 Requests are now paused");
    } else {
      pauseBtn.classList.remove("paused");
      pauseBtn.classList.add("active");
      pauseBtn.textContent = "Receiving Requests";
      localStorage.setItem("guideStatus", "active");
      showToast("🟢 Now receiving requests");
    }
  });
});

// ==================== PROFILE SECTION ====================
const profileForm = document.getElementById("profileForm");
const nameField = document.getElementById("profile-name");
const emailField = document.getElementById("profile-email");
const ageField = document.getElementById("profile-age");
const licenseField = document.getElementById("profile-license");

// تحميل البيانات عند الدخول للصفحة
window.addEventListener("DOMContentLoaded", () => {
  nameField.value = localStorage.getItem("guideName") || "";
  emailField.value = localStorage.getItem("guideEmail") || "";
  ageField.value = localStorage.getItem("guideAge") || "";
  licenseField.value = localStorage.getItem("guideLicense") || "";
});

// حفظ التعديلات
if (profileForm) {
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    localStorage.setItem("guideName", nameField.value);
    localStorage.setItem("guideEmail", emailField.value);
    localStorage.setItem("guideAge", ageField.value);
    localStorage.setItem("guideLicense", licenseField.value);

    showToast("✅ Profile updated successfully!");
  });
}

// حذف الحساب
const deleteBtn = document.getElementById("deleteAccountBtn");
if (deleteBtn) {
  deleteBtn.addEventListener("click", () => {
    if (confirm("⚠️ Are you sure you want to delete your account?")) {
      localStorage.removeItem("guideLoggedIn");
      localStorage.removeItem("guideEmail");
      localStorage.removeItem("guideName");
      localStorage.removeItem("guideAge");
      localStorage.removeItem("guideLicense");
      localStorage.removeItem("guideStatus");
      showToast("🗑️ Account deleted. Redirecting...");
      setTimeout(() => {
        window.location.href = "../home/home.html";
      }, 1500);
    }
  });
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#556b2f";
  toast.style.color = "#fff";
  toast.style.padding = "10px 16px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "0.95rem";
  toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
  toast.style.zIndex = "9999";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.5s ease";
  }, 1500);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}
