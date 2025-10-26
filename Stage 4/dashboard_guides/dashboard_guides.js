// frontend/dashboard_guides/dashboard_guides.js
console.log("✅ Guide Dashboard JS Loaded");

// ✅ التحقق الذكي لحالة المرشد
async function getCurrentGuide() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  // 🔸 لا يوجد مستخدم في Supabase Auth
  if (!user || error) {
    alert("⚠️ لم يتم العثور على حساب. الرجاء التسجيل أولاً.");
    window.location.href = "../register_guides/register_guides.html";
    return null;
  }

  // 🔸 المستخدم موجود، نبحث عنه في جدول guides
  const { data: guide, error: guideError } = await supabaseClient
    .from("guides")
    .select("status")
    .eq("id", user.id)
    .single();

  if (guideError) {
    console.error("Error fetching guide:", guideError);
  }

  // 🔸 المرشد لم يُسجّل بعد في جدول guides
  if (!guide) {
    alert("⚠️ لم يتم العثور على ملف مرشد مرتبط بهذا الحساب. الرجاء التسجيل أولاً.");
    window.location.href = "../register_guides/register_guides.html";
    return null;
  }

  // 🔸 المرشد موجود لكن ينتظر الموافقة
  if (guide.status === "pending") {
    alert("⏳ حسابك قيد المراجعة من قبل الأدمن.");
    window.location.href = "../guides/pending.html";
    return null;
  }

  // 🔸 المرشد مرفوض
  if (guide.status === "rejected") {
    alert("❌ تم رفض طلبك. الرجاء التواصل مع الإدارة أو التسجيل مجددًا.");
    window.location.href = "../register_guides/register_guides.html";
    return null;
  }

  // 🔸 المرشد مقبول، نرجعه ليكمل التحميل الطبيعي
  return user;
}


// ✅ تحميل بيانات المرشد وكل الأقسام
async function loadGuideInfo() {
  const user = await getCurrentGuide();
  if (!user) return;

  // جلب صف المرشد من جدول guides
  const { data: guide, error } = await supabaseClient
    .from("guides")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !guide) {
    alert("⚠️ Your guide profile was not found. Redirecting...");
    return (window.location.href = "../home/home.html");
  }

  if (guide.status !== "approved") {
    alert("⏳ Your account is still pending approval.");
    return (window.location.href = "../pending/pending.html");
  }

  // ✅ تعبئة البيانات العامة في الصفحة
  document.getElementById("guide-name").textContent =
    guide.full_name || user.email || "Guide";

  // ✅ تعبئة بيانات الفورم تلقائيًا
  document.getElementById("profile-name").value = guide.full_name || "";
  document.getElementById("profile-email").value = user.email || "";
  document.getElementById("profile-age").value = guide.age || "";
  document.getElementById("profile-license").value =
    guide.license_number || "";
  document.getElementById("profile-city").value = guide.city || "";
  document.getElementById("profile-bio").value = guide.bio || "";
  document.getElementById("profile-languages").value = Array.isArray(
    guide.languages
  )
    ? guide.languages.join(", ")
    : "";

  const avatarEl = document.getElementById("profile-avatar");
  avatarEl.src = guide.avatar_url || "../assets/images/default.png";

  // ✅ تحميل الطلبات
  await loadRequests(guide.id);

  // ✅ تحديث حالة استقبال الطلبات
  updatePauseBtn(guide.receiving_requests);

  // ✅ حساب متوسط التقييم
  try {
    const { data: reviews, error: revErr } = await supabaseClient
      .from("reviews")
      .select("rating")
      .eq("guide_id", guide.id);

    if (revErr) throw revErr;

    const avg =
      reviews && reviews.length
        ? (
            reviews.reduce((a, b) => a + Number(b.rating || 0), 0) /
            reviews.length
          ).toFixed(1)
        : "—";
    document.querySelector(
      "#section-overview .card:nth-child(2) p"
    ).textContent = avg;
  } catch (err) {
    console.error("❌ Failed to load rating:", err.message);
  }

  console.log("✅ Guide data loaded successfully");
}

// ✅ تشغيل / إيقاف استقبال الطلبات
const pauseBtn = document.getElementById("pauseBtn");
pauseBtn?.addEventListener("click", async () => {
  const user = await getCurrentGuide();
  const paused = pauseBtn.classList.contains("active");
  const newState = !paused;

  await supabaseClient
    .from("guides")
    .update({ receiving_requests: newState })
    .eq("id", user.id);

  updatePauseBtn(newState);
  showToast(newState ? "✅ Now receiving requests" : "🛑 Requests paused");
});

function updatePauseBtn(active) {
  if (active) {
    pauseBtn.classList.add("active");
    pauseBtn.classList.remove("paused");
    pauseBtn.textContent = "Receiving Requests";
  } else {
    pauseBtn.classList.add("paused");
    pauseBtn.classList.remove("active");
    pauseBtn.textContent = "Paused";
  }
}

// ✅ تحميل الطلبات الحالية
async function loadRequests(guideId) {
  const { data, error } = await supabaseClient
    .from("bookings")
    .select(`id,status,start_at,profiles(full_name,email)`)
    .eq("guide_id", guideId);

  if (error) return console.error(error);

  document.getElementById("active-count").textContent = data.filter(
    (b) => b.status === "pending"
  ).length;

  const container = document.getElementById("requests-list");
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = `<p class="text-gray-500">No requests.</p>`;
    return;
  }

  data.forEach((b) => {
    container.innerHTML += `
      <div class="card flex justify-between items-center mb-3">
        <div>
          <p><strong>${b.profiles?.full_name || "User"}</strong></p>
          <p>${new Date(b.start_at).toLocaleDateString()}</p>
          <p>Status: ${b.status}</p>
        </div>
        <div class="flex gap-3">
          ${
            b.status === "pending"
              ? `<button class="btn-accept" onclick="approveReq('${b.id}')">Accept</button>
                 <button class="btn-reject" onclick="rejectReq('${b.id}')">Reject</button>`
              : ""
          }
          ${
            b.status === "approved"
              ? `<button class="btn-done" onclick="completeReq('${b.id}')">Mark as Completed</button>`
              : ""
          }
        </div>
      </div>
    `;
  });
}

// ✅ إدارة حالة الطلب
async function approveReq(id) {
  await supabaseClient.from("bookings").update({ status: "approved" }).eq("id", id);
  showToast("✅ Request approved");
  loadGuideInfo();
}
async function rejectReq(id) {
  await supabaseClient.from("bookings").update({ status: "canceled" }).eq("id", id);
  showToast("❌ Request rejected");
  loadGuideInfo();
}
async function completeReq(id) {
  await supabaseClient.from("bookings").update({ status: "completed" }).eq("id", id);
  showToast("⭐ Booking completed — user can now review!");
  loadGuideInfo();
}

// ✅ تحديث شامل لملف المرشد (name, age, license, bio, city, languages)
document.getElementById("profileForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = await getCurrentGuide();

  const full_name = document.getElementById("profile-name").value.trim();
  const age = parseInt(document.getElementById("profile-age").value);
  const license_number = document.getElementById("profile-license").value.trim();
  const city = document.getElementById("profile-city").value.trim();
  const bio = document.getElementById("profile-bio").value.trim();
  const languagesRaw = document.getElementById("profile-languages").value.trim();
  const languages = languagesRaw
    ? languagesRaw.split(",").map((l) => l.trim())
    : [];

  const { error } = await supabaseClient
    .from("guides")
    .update({
      full_name,
      age: isNaN(age) ? null : age,
      license_number,
      city,
      bio,
      languages,
    })
    .eq("id", user.id);

  if (error) {
    alert("❌ Failed to save profile changes");
    console.error(error);
  } else {
    alert("✅ Profile updated successfully");
    loadGuideInfo();
  }
});

// ✅ تحميل صورة جديدة للمرشد
const avatarInput = document.getElementById("avatarInput");
avatarInput?.addEventListener("change", async () => {
  const file = avatarInput.files?.[0];
  if (!file) return;
  const user = await getCurrentGuide();
  const path = `guides/${user.id}-${Date.now()}`;

  const { error: uploadErr } = await supabaseClient.storage
    .from("guides")
    .upload(path, file, { upsert: true });

  if (uploadErr) {
    alert("❌ Upload failed");
    console.error(uploadErr);
    return;
  }

  const { data: pub } = supabaseClient.storage
    .from("guides")
    .getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { error: updateErr } = await supabaseClient
    .from("guides")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateErr) {
    alert("❌ Failed to save avatar");
    console.error(updateErr);
    return;
  }

  document.getElementById("profile-avatar").src = publicUrl;
  alert("✅ Avatar updated!");
});

// ✅ زر حذف الحساب (اختياري)
document.getElementById("deleteAccountBtn")?.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete your account?")) return;
  const user = await getCurrentGuide();
  await supabaseClient.from("guides").delete().eq("id", user.id);
  await supabaseClient.auth.signOut();
  alert("Account deleted.");
  window.location.href = "../home/home.html";
});

// ✅ تسجيل الخروج
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "../home/home.html";
});

// ✅ Toast إشعارات سريعة
function showToast(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  div.className = "toast";
  document.body.appendChild(div);
  setTimeout(() => (div.style.opacity = 0), 1500);
  setTimeout(() => div.remove(), 2000);
}

// ✅ التحكم في التبويبات الجانبية
document.querySelectorAll(".side-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".side-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document
      .querySelectorAll("main section")
      .forEach((sec) => (sec.style.display = "none"));
    const targetId = btn.getAttribute("data-target");
    const targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.style.display = "block";

    document.getElementById("section-title").textContent =
      btn.textContent.trim();
  });
});

// ✅ عرض القسم الأول افتراضيًا
document.querySelectorAll("main section").forEach((sec, i) => {
  sec.style.display = i === 0 ? "block" : "none";
});

// ✅ بدء التحميل
loadGuideInfo();
