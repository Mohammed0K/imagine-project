console.log("✅ Dashboard.js LOADED");

// ✅ Check admin session
async function checkAdminAccess() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    alert("Unauthorized!");
    return (window.location.href = "../login/login.html");
  }

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    alert("Admins only!");
    return (window.location.href = "../home/home.html");
  }

  console.log("✅ Admin Verified");
  await loadAdminProfile();
  await loadDashboardCounts();
  await loadPendingGuides();
}
checkAdminAccess();

// ✅ 1) Load Admin Profile Info (fix name + avatar)
async function loadAdminProfile() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // اسم الأدمن
  document.getElementById("admin-name").textContent =
    profile?.full_name || user.email || "Admin";

  // صورة الأدمن (أو افتراضية)
  const avatarEl = document.getElementById("admin-avatar");
  const avatarUrl = profile?.avatar_url || "../assets/images/default.png";
  avatarEl.src = avatarUrl;
}

// ✅ 2) Dashboard Counts (بدون تغيير جوهري)
async function loadDashboardCounts() {
  const counters = {
    guides: document.getElementById("count-guides"),
    pending: document.getElementById("count-pending"),
    places: document.getElementById("count-places"),
    bookings: document.getElementById("count-bookings"),
    reviews: document.getElementById("count-reviews"),
  };

  const fetchCount = async (table, filter) => {
    const query = supabaseClient.from(table).select("*", { count: "exact", head: true });
    if (filter) query.eq(...filter);
    const { count } = await query;
    return count || 0;
  };

  counters.guides.textContent = await fetchCount("guides", ["status", "approved"]);
  counters.pending.textContent = await fetchCount("guides", ["status", "pending"]);
  counters.places.textContent = await fetchCount("places");
  counters.bookings.textContent = await fetchCount("bookings");
  counters.reviews.textContent = await fetchCount("reviews");
}

// ✅ 3) Pending Guides (كما لديك)
async function loadPendingGuides() {
  const tbody = document.getElementById("pending-guides-body");
  tbody.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("guides")
    .select("*")
    .eq("status", "pending");

  if (error) return console.error(error);

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-gray-500">No pending guides</td></tr>`;
    return;
  }

  data.forEach((g) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3">${g.full_name || "Unknown"}</td>
      <td class="p-3">
        <a href="${g.license_url}" target="_blank" class="text-blue-600 underline">View</a>
      </td>
      <td class="p-3 flex gap-3">
        <button class="text-green-600" onclick="approveGuide('${g.id}')">✅ Approve</button>
        <button class="text-red-600" onclick="rejectGuide('${g.id}')">❌ Reject</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function approveGuide(guideId) {
  const { error: err1 } = await supabaseClient
    .from("guides")
    .update({ status: "approved" })
    .eq("id", guideId);

  const { error: err2 } = await supabaseClient
    .from("profiles")
    .update({ role: "guide" })
    .eq("id", guideId);

  if (err1 || err2) return alert("❌ Failed approving guide");

  alert("✅ Guide Approved!");
  loadDashboardCounts();
  loadPendingGuides();
}

async function rejectGuide(guideId) {
  const { error } = await supabaseClient
    .from("guides")
    .update({ status: "rejected" })
    .eq("id", guideId);

  if (error) return alert("❌ Failed rejecting");

  alert("✅ Guide Rejected!");
  loadDashboardCounts();
  loadPendingGuides();
}

// ✅ Sidebar Toggle Logic (كما لديك)
document.querySelectorAll(".side-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".side-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll("section").forEach((sec) => (sec.style.display = "none"));
    const target = btn.getAttribute("data-target");
    document.getElementById(target).style.display = "block";
    document.getElementById("section-title").textContent = btn.textContent.trim();

    // ✅ تحميل القسم الجديد إذا فتح الأدمن "All Guides"
    if (target === "section-all-guides") loadAllGuides();
  })
);

// ✅ عرض جميع المرشدين (المسجلين)
async function loadAllGuides() {
  const tbody = document.getElementById("all-guides-body");
  tbody.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("guides")
    .select("id, full_name, city, status");

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-red-500">Failed to load guides.</td></tr>`;
    return;
  }

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-3 text-center text-gray-500">No guides found.</td></tr>`;
    return;
  }

  data.forEach((g) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3">${g.full_name || "Unknown"}</td>
      <td class="p-3">${g.city || "—"}</td>
      <td class="p-3">${g.status || "—"}</td>
      <td class="p-3 flex gap-3">
        <button class="text-red-600 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition"
          onclick="deleteGuideAccount('${g.id}')">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ✅ حذف حساب المرشد
async function deleteGuideAccount(guideId) {
  if (!confirm("Are you sure you want to delete this guide account?")) return;

  const { error: err1 } = await supabaseClient.from("guides").delete().eq("id", guideId);
  const { error: err2 } = await supabaseClient.from("profiles").delete().eq("id", guideId);

  if (err1 || err2) {
    alert("❌ Failed to delete guide account");
    console.error(err1 || err2);
    return;
  }

  alert("✅ Guide account deleted successfully");
  loadAllGuides();
  loadDashboardCounts();
}

// ✅ تحميل جميع الأماكن
async function loadPlaces() {
  const tbody = document.getElementById("places-table");
  tbody.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("places")
    .select("id, title, city, description, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed loading places:", error.message);
    tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-500">Error loading places.</td></tr>`;
    return;
  }

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">No places yet.</td></tr>`;
    return;
  }

  data.forEach((p) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3">${p.title}</td>
      <td class="p-3">${p.city}</td>
      <td class="p-3">${p.description.substring(0, 80)}...</td>
      <td class="p-3">
        <img src="${p.image_url}" alt="${p.title}" class="w-20 h-16 rounded object-cover border" />
      </td>
      <td class="p-3">
        <button 
          class="text-red-600 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition"
          onclick="deletePlace('${p.id}', '${p.image_url}')">
          🗑️ Delete
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}


// ✅ إضافة مكان جديد
document.getElementById("addPlaceForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("place-title").value.trim();
  const city = document.getElementById("place-city").value.trim();
  const desc = document.getElementById("place-desc").value.trim();
  const file = document.getElementById("place-image").files[0];

  if (!title || !city || !desc || !file) {
    alert("❌ Please fill all fields");
    return;
  }

  const cleanedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const path = `places/${Date.now()}_${cleanedFileName}`;

  // ✅ رفع الصورة إلى bucket "places"
  const { error: uploadErr } = await supabaseClient.storage
    .from("places")
    .upload(path, file, { upsert: true });

  if (uploadErr) {
    alert("❌ Image upload failed: " + uploadErr.message);
    return;
  }

  const { data: publicData } = supabaseClient.storage.from("places").getPublicUrl(path);
  const imageUrl = publicData.publicUrl;

  // ✅ إدخال السجل في جدول places
  const { error: insertErr } = await supabaseClient
    .from("places")
    .insert({ title, city, description: desc, image_url: imageUrl });

  if (insertErr) {
    alert("❌ Failed adding place: " + insertErr.message);
    return;
  }

  alert("✅ Place added successfully!");
  e.target.reset();
  loadPlaces();
});

// ✅ حذف المكان من Supabase (الجدول + الصورة)
async function deletePlace(placeId, imageUrl) {
  if (!confirm("Are you sure you want to delete this place?")) return;

  try {
    // 1️⃣ حذف الصورة من الـ bucket
    if (imageUrl) {
      const fileName = imageUrl.split("/").pop(); // استخراج اسم الملف
      const { error: delErr } = await supabaseClient.storage
        .from("places")
        .remove([`places/${fileName}`]);

      if (delErr) console.warn("⚠️ Image deletion error:", delErr.message);
    }

    // 2️⃣ حذف السجل من جدول places
    const { error } = await supabaseClient.from("places").delete().eq("id", placeId);
    if (error) {
      alert("❌ Failed deleting place from database");
      console.error(error.message);
      return;
    }

    alert("✅ Place deleted successfully!");
    loadPlaces();
    loadDashboardCounts();
  } catch (err) {
    console.error("❌ Delete error:", err.message);
  }
}


// ✅ تحميل الأماكن عند فتح التبويب
document.querySelectorAll(".side-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    if (target === "section-places") loadPlaces();
  })
);


// ✅ Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "../login/login.html";
});
