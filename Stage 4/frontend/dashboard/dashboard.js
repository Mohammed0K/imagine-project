// =======================
// ✅ Admin Dashboard Full Script (Supabase) — FINAL
// =======================
console.log("✅ Dashboard.js LOADED");

// -----------------------
// Helpers
// -----------------------
function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(); } catch { return "—"; }
}
function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

// -----------------------
// 0) تحقق جلسة الأدمن + تهيئة أولية
// -----------------------
async function checkAdminAccess() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    showToast("❌ Unauthorized! Please login again.", "error");

    return (window.location.href = "../dashboard/login_admin.html");
  }

  const { data: profile } = await supabaseClient
    .from("profiles_view")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    showToast("❌ Admins only!", "error");

    return (window.location.href = "../home/home.html");
  }

  // (اختياري) عرض اسم/أفاتار الأدمن إذا كانت عناصرهما موجودة
  const adminNameEl = document.getElementById("admin-name");
  const adminAvatarEl = document.getElementById("admin-avatar");
  if (adminNameEl) adminNameEl.textContent = profile.full_name || user.email;
  if (adminAvatarEl) adminAvatarEl.src = profile.avatar_url || "../assets/images/default.png";

  console.log("✅ Admin verified");

  populateCities();          // تعبئة قائمة المدن في نموذج الأماكن
  await loadDashboardCounts();
  await loadPendingGuides();
  await loadPlaces();
}
checkAdminAccess();

// -----------------------
// 1) Overview - العدادات العامة
// -----------------------
async function loadDashboardCounts() {
  const counters = {
    guides:     document.getElementById("count-guides"),
    pending:    document.getElementById("count-pending"),
    customers:  document.getElementById("count-customers"),
    places:     document.getElementById("count-places"),
    bookings:   document.getElementById("count-bookings"),
    reviews:    document.getElementById("count-reviews"),
  };

  const fetchCount = async (table, filter) => {
    let q = supabaseClient.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(...filter);
    const { count } = await q;
    return count || 0;
  };

  if (counters.guides)    counters.guides.textContent    = await fetchCount("guides",   ["status","approved"]);
  if (counters.pending)   counters.pending.textContent   = await fetchCount("guides",   ["status","pending"]);
  if (counters.customers) counters.customers.textContent = await fetchCount("profiles", ["role","customer"]);
  if (counters.places)    counters.places.textContent    = await fetchCount("places");
  if (counters.bookings)  counters.bookings.textContent  = await fetchCount("bookings");
  if (counters.reviews)   counters.reviews.textContent   = await fetchCount("reviews");
}

// -----------------------
// 2) إدارة المرشدين (Pending + All Guides)
// -----------------------
async function loadPendingGuides() {
  const tbody = document.getElementById("pending-guides-body");
  if (!tbody) return; // لو ما عندك جدول pending في الواجهة، تجاهل
  tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

  const { data, error } = await supabaseClient
    .from("guides")
    .select("*")
    .eq("status", "pending");

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="3">Error loading pending guides.</td></tr>`;
    return;
  }

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-gray-500">No pending guides</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  data.forEach((g) => {
    tbody.innerHTML += `
      <tr>
        <td>${g.full_name || "Unknown"}</td>
        <td><a href="${g.license_url || "#"}" target="_blank" class="text-blue-600 underline">View</a></td>
        <td>
          <button class="text-green-600" onclick="approveGuide('${g.id}')">Approve</button>
          <button class="text-red-600" onclick="rejectGuide('${g.id}')">Reject</button>
        </td>
      </tr>
    `;
  });
}
async function approveGuide(guideId) {
  await supabaseClient.from("guides").update({ status: "approved" }).eq("id", guideId);
  await supabaseClient.from("profiles").update({ role: "guide" }).eq("id", guideId);
  showToast("✅ Operation completed successfully", "success");
  loadDashboardCounts();
  loadPendingGuides();
}
async function rejectGuide(guideId) {
  await supabaseClient.from("guides").update({ status: "rejected" }).eq("id", guideId);
  showToast("❌ Guide Rejected!", "error");

  loadDashboardCounts();
  loadPendingGuides();
}

// All Guides (مع الإيميل + الـ availability)
async function loadAllGuides() {
  const tbody = document.getElementById("all-guides-body");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  // 1) اجلب بيانات المرشدين
  const { data: guides, error } = await supabaseClient
    .from("guides")
    .select("id, full_name, status, receiving_requests");
  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan='5'>Error loading guides.</td></tr>`;
    return;
  }
  if (!guides?.length) {
    tbody.innerHTML = `<tr><td colspan='5' class='text-gray-500'>No guides found</td></tr>`;
    return;
  }

  // 2) اجلب إيميلاتهم من profiles بخطوة واحدة
  const ids = unique(guides.map(g => g.id));
  const { data: profs } = await supabaseClient
    .from("profiles_view")
    .select("id,email")
    .in("id", ids);

  const emailById = {};
  profs?.forEach(p => { emailById[p.id] = p.email; });

  // 3) اعرض
  tbody.innerHTML = "";
  guides.forEach((g) => {
    tbody.innerHTML += `
      <tr>
        <td>${g.full_name || "Unknown"}</td>
        <td>${emailById[g.id] || "—"}</td>
        <td>${g.status || "—"}</td>
        <td>${g.receiving_requests ? "Yes" : "No"}</td>
        <td>
          <button class="text-red-600" onclick="deleteGuideAccount('${g.id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

// helper بسيط ينفّذ الدالة إذا كانت معرّفة
function runIfFn(fn, ...args) {
  if (typeof fn === "function") {
    try { return fn(...args); } catch (e) { console.warn(e); }
  }
  return Promise.resolve();
}

async function deleteGuideAccount(guideId) {
  try {
    const res = await fetch(
      "https://rvrjfzetjguhxoizuchx.supabase.co/functions/v1/delete-guide",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: guideId })
      }
    );

    const result = await res.json();

    if (!res.ok) {
      // ❌ إذا API فشل - نعرض الخطأ فقط
      showToast("❌ Failed to delete guide", "error");
      return;
    }

    // ✅ نجاح فعلي
    showToast("✅ Guide deleted successfully");

    // نحدّث القائمة فقط بعد نجاح مؤكد
    await loadPendingGuides();
    await loadAllGuides();

  } catch (err) {
    // ❌ إذا الإنترنت أو fetch نفسه فيه مشكلة
    showToast("❌ Network error while deleting guide", "error");
  }
}





// ✅ تعبئة المدن من قاعدة البيانات فقط (tags)
async function populateCities() {
  const select = document.getElementById("place-tag");
  if (!select) return;

  // تنظيف القائمة
  select.innerHTML = '<option value="">Select a city</option>';

  // اجلب المدن من جدول tags
  const { data: tags, error } = await supabaseClient
    .from("tags")
    .select("name")
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Error loading tags:", error.message);
    return;
  }

  if (!tags?.length) {
    console.warn("⚠️ No cities found in tags table");
    return;
  }

  tags.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.name;
    opt.textContent = t.name;
    select.appendChild(opt);
  });
}


// ✅ تحميل الأماكن (Places) في لوحة الأدمن
async function loadPlaces() {
  const tableBody = document.getElementById("placesTableBody");
  tableBody.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

  try {
    const { data: places, error } = await supabaseClient
      .from("places")
      .select("id, title, city, description, image_url, created_at");

    if (error) throw error;

    if (!places || !places.length) {
      tableBody.innerHTML = "<tr><td colspan='6'>No places found.</td></tr>";
      return;
    }

    tableBody.innerHTML = "";
    places.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="py-2 px-4 border-b text-center">${p.title}</td>
        <td class="py-2 px-4 border-b text-center">${p.city || "-"}</td>
        <td class="py-2 px-4 border-b text-center">${p.description || "-"}</td>
        <td class="py-2 px-4 border-b text-center">
          ${
            p.image_url
              ? `<img src="${p.image_url}" class="w-20 h-14 object-cover rounded-md mx-auto" />`
              : "-"
          }
        </td>
        <td class="py-2 px-4 border-b text-center">
          ${new Date(p.created_at).toLocaleDateString()}
        </td>
        <td class="py-2 px-4 border-b text-center">
          <button onclick="deletePlace('${p.id}')"
            class="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition">
            Delete
          </button>
          <button onclick="openGalleryModal('${p.id}', '${p.title}')"
            class="ml-2 px-3 py-1 rounded bg-[#d0b1f1] text-white hover:bg-[#b694e0] transition">
            Manage Gallery
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Error loading places:", err.message);
    tableBody.innerHTML = "<tr><td colspan='6'>Error loading places.</td></tr>";
  }
}



// 🗑️ Custom Delete Modal for Places
let placeToDelete = { id: null, img: null };

async function deletePlace(id, img) {
  placeToDelete = { id, img };
  const modal = document.getElementById("deleteModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// عند الضغط على Cancel
document.getElementById("cancelDeleteBtn")?.addEventListener("click", () => {
  const modal = document.getElementById("deleteModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  placeToDelete = { id: null, img: null };
});

// عند تأكيد الحذف
// ✅ دالة مساعده لاستخراج المفتاح الصحيح من URL الصورة
function getStorageKeyFromPublicUrl(url) {
  try {
    const u = new URL(url);
    const p = decodeURIComponent(u.pathname);
    const idx = p.indexOf("/object/public/places/");
    if (idx === -1) return null;
    return p.substring(idx + "/object/public/places/".length);
  } catch {
    return null;
  }
}

document.getElementById("confirmDeleteBtn")?.addEventListener("click", async () => {
  const { id, img } = placeToDelete;
  if (!id) return;

  try {
    // 🗑️ حذف الصورة من التخزين (في حال وُجدت)
    const key = img ? getStorageKeyFromPublicUrl(img) : null;
    if (key) {
      const { error: rmErr } = await supabaseClient.storage.from("places").remove([key]);
      if (rmErr) console.warn("Storage remove warning:", rmErr.message);
    }

    // 🗃️ حذف السجل من قاعدة البيانات
    const { error: dbErr } = await supabaseClient.from("places").delete().eq("id", id);
    if (dbErr) throw dbErr;

    // إغلاق المودال وتحديث الجداول
    const modal = document.getElementById("deleteModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");

    await loadPlaces();
    await loadDashboardCounts();

    showToast("✅ Place deleted successfully", "success");
  } catch (error) {
    console.error("❌ Error deleting place:", error);
    showToast("❌ Failed to delete place.", "error");
  } finally {
    placeToDelete = { id: null, img: null };
  }
});


// إضافة مكان جديد (مراعاة place-tag)
document.getElementById("addPlaceForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("place-title").value.trim();
  const city  = document.getElementById("place-tag").value.trim(); // ← مطابق للـ HTML
  const desc  = document.getElementById("place-description").innerHTML.trim();
  const file  = document.getElementById("place-image").files[0];
  if (!title || !city || !desc || !file) return showToast("❌ Please fill all fields", "error");

  // upload image first to Supabase Storage
  const cleaned = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const path = `places/${Date.now()}_${cleaned}`;

  const { error: upErr } = await supabaseClient.storage.from("places").upload(path, file);
  if (upErr) return showToast("❌ Upload Failed", "error");
;

  const { data: pub } = supabaseClient.storage.from("places").getPublicUrl(path);
  const imageUrl = pub.publicUrl;

  // ✅ 1️⃣ تحقق من وجود المدينة في جدول tags
  let tagId;
  const { data: existingTag, error: tagErr } = await supabaseClient
    .from("tags")
    .select("id")
    .eq("name", city)
    .maybeSingle();

  if (tagErr) {
    console.error("⚠️ Tag check error:", tagErr);
  }

  if (existingTag) {
    tagId = existingTag.id;
  } else {
    const { data: newTag, error: insertTagErr } = await supabaseClient
      .from("tags")
      .insert({ name: city })
      .select()
      .single();
    if (insertTagErr) {
      console.error("⚠️ Failed to create tag:", insertTagErr);
    } else {
      tagId = newTag.id;
    }
  }

  // ✅ 2️⃣ أضف المكان الجديد
  const { data: newPlace, error: insertPlaceErr } = await supabaseClient
    .from("places")
    .insert({ title, city, description: desc, image_url: imageUrl })
    .select()
    .single();

  if (insertPlaceErr) return showToast("❌ Failed to add place:" + insertPlaceErr.message, "error");

  // ✅ 3️⃣ اربط المكان بالـ tag في place_tags
  if (tagId && newPlace?.id) {
    const { error: linkErr } = await supabaseClient
      .from("place_tags")
      .insert({ place_id: newPlace.id, tag_id: tagId });

    if (linkErr) console.warn("⚠️ Linking place_tag failed:", linkErr);
  }

  showToast("✅ Operation completed successfully", "success");
  e.target.reset();
  loadPlaces();
  loadDashboardCounts();
});


// -----------------------
// 4) Requests - إدارة الحجوزات (مع Place/City/Admin Note)
// -----------------------
async function loadRequests() {
  const tbody = document.getElementById("requests-table");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='9'>Loading...</td></tr>";

  const { data, error } = await supabaseClient
    .from("bookings")
    .select(`
      id, status, start_at, admin_note,
      guides(full_name),
      profiles!bookings_customer_id_fkey(full_name),
      places(title, city)
    `)
    .not("status", "eq", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan='9'>Error loading requests</td></tr>`;
    return;
  }

  if (!data?.length) {
    tbody.innerHTML = `<tr><td colspan='9' class='text-gray-500'>No current bookings</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  data.forEach((b) => {
    const color =
      b.status === "paused" ? "text-yellow-600" :
      b.status === "canceled" ? "text-red-600" :
      b.status === "approved" ? "text-green-600" : "text-gray-600";

    tbody.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.guides?.full_name || "Guide"}</td>
        <td>${b.profiles?.full_name || "Customer"}</td>
        <td>${b.places?.title || "—"}</td>
        <td>${b.places?.city || "—"}</td>
        <td>${fmtDate(b.start_at)}</td>
        <td class="${color} font-semibold">${b.status}</td>
        <td class="text-center relative">
          <div class="inline-block text-left">
            <button class="px-3 py-1 bg-[#556b2f] text-white rounded hover:bg-[#445623]" onclick="toggleDropdown(this)">Actions ⌄</button>
            <div class="hidden absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-50">
              ${
                b.status !== "paused"
                  ? `<button class="block px-4 py-2 hover:bg-gray-100 w-full text-left" onclick="openNoteModal('${b.id}','paused')">🟡 Pause</button>`
                  : `<button class="block px-4 py-2 hover:bg-gray-100 w-full text-left" onclick="openNoteModal('${b.id}','approved')">🟢 Resume</button>`
              }
              <button class="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600" onclick="openNoteModal('${b.id}','canceled')">❌ Cancel</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  });
}

// ✅ نسخة محسّنة لإدارة القوائم المنسدلة Actions
function toggleDropdown(btn) {
  const dropdown = btn.nextElementSibling;

  // أولًا: أخفي جميع القوائم المفتوحة
  document.querySelectorAll("td .absolute").forEach(el => {
    if (el !== dropdown) el.classList.add("hidden");
  });

  // ثانيًا: أبدّل القائمة الحالية فقط
  dropdown.classList.toggle("hidden");

  // ثالثًا: إذا فتحت القائمة، فعل مستمع للنقر خارجها
  if (!dropdown.classList.contains("hidden")) {
    const closeHandler = (e) => {
      if (!dropdown.contains(e.target) && e.target !== btn) {
        dropdown.classList.add("hidden");
        document.removeEventListener("click", closeHandler);
      }
    };
    setTimeout(() => document.addEventListener("click", closeHandler), 0);
  }
}


let selectedBookingId = null;
let selectedAction = null;

function openNoteModal(id, action) {
  selectedBookingId = id;
  selectedAction = action;
  document.getElementById("noteModal").classList.remove("hidden");
  document.getElementById("noteModal").classList.add("flex");
}

document.getElementById("cancelNoteBtn").addEventListener("click", () => {
  document.getElementById("noteModal").classList.add("hidden");
  document.getElementById("noteModal").classList.remove("flex");
  selectedBookingId = null;
  selectedAction = null;
});

document.getElementById("confirmNoteBtn").addEventListener("click", async () => {
  const note = document.getElementById("adminNoteInput").value.trim();
  if (!note) return showToast("⚠️ Please enter a note", "error");

  let updateData = { admin_note: note };

// 🟡 إذا كانت العملية Pause → احفظ الحالة السابقة قبل التبديل
if (selectedAction === "paused") {
  const { data: current } = await supabaseClient
    .from("bookings")
    .select("status")
    .eq("id", selectedBookingId)
    .single();
  updateData = {
    ...updateData,
    previous_status: current.status,
    status: "paused",
  };
}

// 🟢 إذا كانت العملية Resume → ارجع الحالة الأصلية من previous_status
else if (selectedAction === "approved") {
  const { data: current } = await supabaseClient
    .from("bookings")
    .select("previous_status")
    .eq("id", selectedBookingId)
    .single();
  updateData = {
    ...updateData,
    status: current.previous_status || "approved",
    previous_status: null,
  };
}

// ❌ إذا كانت Cancel عادي ما يحتاج
else {
  updateData.status = selectedAction;
}

// تنفيذ التحديث
const { error } = await supabaseClient
  .from("bookings")
  .update(updateData)
  .eq("id", selectedBookingId);


  document.getElementById("noteModal").classList.add("hidden");
  document.getElementById("noteModal").classList.remove("flex");
  document.getElementById("adminNoteInput").value = "";

  if (error) {
    console.error(error);
    return showToast("❌ Failed to update booking.", "error");
  }

  showToast(`✅ Booking ${selectedAction}`, "success");
  loadRequests();
  loadDashboardCounts();
});



// update booking status
async function updateBooking(id, status) {
  const { error } = await supabaseClient.from("bookings").update({ status }).eq("id", id);
  if (error) return showToast("❌ " + error.message, "error");
  showToast("✅ Operation completed successfully", "success");
  loadRequests();
  loadDashboardCounts();
}

// -----------------------
// 5) Completed Bookings (مع الإيميلات + المكان)
// -----------------------
// -----------------------
// ✅ Completed Bookings (يعرض التقييم والتعليق من جدول reviews مباشرة)
// -----------------------
async function loadCompletedBookings() {
  const tbody = document.getElementById("completed-table");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='10'>Loading...</td></tr>";

  // 1️⃣ اجلب الحجوزات المنتهية
  const { data: bookings, error } = await supabaseClient
    .from("bookings")
    .select(`
      id, start_at, guide_id, customer_id,
      places(title,city),
      guides(full_name),
      profiles!bookings_customer_id_fkey(full_name)
    `)
    .eq("status", "completed")
    .order("start_at", { ascending: false });

  if (error) {
    console.error("❌ Error loading completed bookings:", error.message);
    tbody.innerHTML = `<tr><td colspan='10'>Error loading data</td></tr>`;
    return;
  }

  if (!bookings?.length) {
    tbody.innerHTML = `<tr><td colspan='10' class='text-gray-500'>No completed bookings</td></tr>`;
    return;
  }

  // 2️⃣ اجلب الإيميلات للمرشدين والعملاء
  const ids = unique([
    ...bookings.map(b => b.guide_id),
    ...bookings.map(b => b.customer_id),
  ]);
  const { data: profs } = await supabaseClient
    .from("profiles_view")
    .select("id,email,full_name")
    .in("id", ids);

  const emailById = {};
  profs?.forEach(p => { emailById[p.id] = p.email; });

// 3️⃣ اجلب تقييم كل حجز واسم العميل من جداول أخرى
for (const b of bookings) {
  // 🟢 اجلب التقييم
  const { data: review, error: rErr } = await supabaseClient
    .from("reviews")
    .select("rating, comment")
    .eq("booking_id", b.id)
    .maybeSingle();
  b.review = review || null;

  // 🟢 اجلب اسم العميل
  const { data: customerProfile } = await supabaseClient
    .from("profiles_view")
    .select("full_name")
    .eq("id", b.customer_id)
    .maybeSingle();
  b.customer_name = customerProfile?.full_name || "Customer";
}


  // 4️⃣ عرض النتائج في الجدول
  tbody.innerHTML = "";
  bookings.forEach((b) => {
    tbody.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.guides?.full_name || "Guide"}</td>
        <td>${emailById[b.guide_id] || "—"}</td>
        <td>${b.customer_name}</td>
        <td>${emailById[b.customer_id] || "—"}</td>
        <td>${b.places?.title || "—"}</td>
        <td>${b.places?.city || "—"}</td>
        <td>${fmtDate(b.start_at)}</td>
        <td>${b.review ? `${b.review.rating}⭐` : "—"}</td>
        <td>${b.review?.comment || "—"}</td>
      </tr>
    `;
  });
}


// -----------------------
// 6) All Customers (مع Joined)
// -----------------------
async function loadAllCustomers() {
  const tbody = document.getElementById("all-customers-body");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

  // ✅ اجلب العملاء فقط من جدول profiles
  const { data: customers, error } = await supabaseClient
    .from("profiles_view")
    .select("id, full_name, email, role, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error loading customers:", error);
    tbody.innerHTML = `<tr><td colspan='4'>Error loading customers</td></tr>`;
    return;
  }

  if (!customers?.length) {
    tbody.innerHTML = `<tr><td colspan='4' class='text-gray-500'>No customers found</td></tr>`;
    return;
  }


  tbody.innerHTML = "";
  customers.forEach((c) => {
    const email = c.email || "—";
    const name = c.full_name?.trim() || "(Unnamed Customer)";
    const date = c.created_at ? fmtDate(c.created_at) : "—";

    tbody.innerHTML += `
      <tr>
        <td class="w-1/3">${name}</td>
        <td class="w-1/3">${email}</td>
        <td class="w-1/3">${date}</td>
        <td class="text-center">
          <button class="text-red-600 hover:underline" onclick="deleteCustomer('${c.id}')">
            <i class="fa-solid fa-trash-can mr-1"></i> Delete
          </button>
        </td>
      </tr>
    `;
  });
}




// 6) Delete Customer (from both Database + Auth)
async function deleteCustomer(id) {
  const confirmDelete = confirm("⚠️ This will permanently delete this customer and all related data. Continue?");
  if (!confirmDelete) return;

  try {
    const res = await fetch("https://rvrjfzetjguhxoizuchx.supabase.co/functions/v1/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const result = await res.json();
    if (!res.ok || result.error) throw new Error(result.error || "Unknown error");

    showToast("✅ Operation completed successfully", "success");
    await loadAllCustomers();
    await loadDashboardCounts();
  } catch (err) {
    console.error("❌ Failed to delete:", err.message);
    showToast("❌ Error deleting customer: " + err.message, "error");
  }
}

// -----------------------
// 7) Sidebar Navigation (Fixed)
// -----------------------
document.querySelectorAll(".side-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".side-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // أخفِ جميع أقسام المحتوى فقط، وليس كل الـ sections في الصفحة
    document.querySelectorAll("main > section > section").forEach((sec) => {
      sec.style.display = "none";
    });

    const target = btn.getAttribute("data-target");
    const sec = document.getElementById(target);
    if (sec) sec.style.display = "block";

    // حدّث العنوان
    const title = document.getElementById("section-title");
    if (title) title.textContent = btn.textContent.trim();

    // تحميل ديناميكي حسب القسم
    if (target === "section-dashboard")        loadDashboardCounts();
    if (target === "section-places")           loadPlaces();
    if (target === "section-requests")         loadRequests();
    if (target === "section-completed")        loadCompletedBookings();
    if (target === "section-all-guides")       loadAllGuides();
    if (target === "section-all-customers")    loadAllCustomers();
    if (target === "section-contact-messages") loadContactMessages();

  })
);

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => loadDashboardCounts(), 500);
});

// -----------------------
// Add New City Button (adds to 'tags' table and updates select)
// -----------------------
const cityModal = document.getElementById("cityModal");
const newCityInput = document.getElementById("newCityInput");
const saveCityBtn = document.getElementById("saveCityBtn");
const cancelCityBtn = document.getElementById("cancelCityBtn");

// فتح المودال
document.getElementById("addCityBtn")?.addEventListener("click", () => {
  newCityInput.value = "";
  cityModal.classList.remove("hidden");
  cityModal.classList.add("flex");
  newCityInput.focus();
});

// إلغاء
cancelCityBtn?.addEventListener("click", () => {
  cityModal.classList.add("hidden");
  cityModal.classList.remove("flex");
});

// حفظ المدينة الجديدة
saveCityBtn?.addEventListener("click", async () => {
  const city = newCityInput.value.trim();
  if (!city) return showToast("❌ Please enter a valid city name.", "error");

  // تحقق من وجودها مسبقًا
  const { data: existing } = await supabaseClient
    .from("tags")
    .select("id")
    .eq("name", city)
    .maybeSingle();

  if (existing) {
    showToast("⚠️ This city already exists!", "error");
    return;
  }

  // أضفها إلى قاعدة البيانات
  const { data: newTag, error } = await supabaseClient
    .from("tags")
    .insert({ name: city })
    .select()
    .single();

  if (error) {
    console.error("❌ Failed to add city:", error.message);
    return showToast("❌ Error: " + error.message, "error");
  }

  // أضفها مباشرة إلى القائمة المنسدلة
  const select = document.getElementById("place-tag");
  if (select) {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    select.appendChild(opt);
    select.value = city;
  }

  // أغلق المودال
  cityModal.classList.add("hidden");
  cityModal.classList.remove("flex");

  showToast("✅ Operation completed successfully", "success");
});



// -----------------------
// 8) Logout
// -----------------------
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "../dashboard/login_admin.html";
});


// ============================
// ✅ Gallery Management System
// ============================

let currentPlaceId = null;
let currentGallery = [];

// ✅ فتح المودال وتحميل الصور الحالية
async function openGalleryModal(placeId, placeTitle) {
  currentPlaceId = placeId;
  document.getElementById("galleryModal").classList.remove("hidden");
  document.getElementById("galleryModalTitle").textContent = `Manage Gallery for ${placeTitle}`;
  await loadGalleryPreview();
}

// ✅ إغلاق المودال
function closeGalleryModal() {
  document.getElementById("galleryModal").classList.add("hidden");
  currentPlaceId = null;
  currentGallery = [];
  document.getElementById("galleryPreview").innerHTML = "";
}

// ✅ تحميل الصور الموجودة للمكان
async function loadGalleryPreview() {
  const { data, error } = await supabaseClient
    .from("places")
    .select("gallery_urls")
    .eq("id", currentPlaceId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  currentGallery = data.gallery_urls || [];
  const preview = document.getElementById("galleryPreview");
  preview.innerHTML = currentGallery.length
    ? currentGallery
        .map(
          (url) => `
        <div class="relative">
          <img src="${url}" class="rounded-lg shadow-md w-full h-32 object-cover">
          <button onclick="removeGalleryImage('${url}')" class="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">X</button>
        </div>
      `
        )
        .join("")
    : "<p class='text-gray-500 col-span-3'>No gallery images yet.</p>";
}

// ✅ رفع صور جديدة وتحديث العمود في Supabase
async function uploadGalleryImages() {
  const files = document.getElementById("galleryInput").files;
  if (!files.length) return alert("Please select images first.");

  for (let file of files) {
    const filePath = `${currentPlaceId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabaseClient.storage
      .from("places-gallery")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      continue;
    }

    const { data: publicUrl } = supabaseClient.storage
      .from("places-gallery")
      .getPublicUrl(filePath);

    currentGallery.push(publicUrl.publicUrl);
  }

  await supabaseClient
    .from("places")
    .update({ gallery_urls: currentGallery })
    .eq("id", currentPlaceId);

  document.getElementById("galleryInput").value = "";
  await loadGalleryPreview();
}

// ✅ حذف صورة من المعرض
async function removeGalleryImage(url) {
  currentGallery = currentGallery.filter((u) => u !== url);
  await supabaseClient
    .from("places")
    .update({ gallery_urls: currentGallery })
    .eq("id", currentPlaceId);
  await loadGalleryPreview();
}

// أدوات تنسيق النص في خانة Description + إدراج الصور داخل المقالة مع اختيار الحجم
async function formatDesc(cmd) {
  if (cmd === "addImage") {
    // افتح اختيار صورة
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // 🪣 نرفع الصورة إلى places-gallery في Supabase
        const filePath = `inline-images/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabaseClient.storage
          .from("places-gallery")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // ✅ نجلب الرابط العام للصورة
        const { data: publicUrl } = supabaseClient.storage
          .from("places-gallery")
          .getPublicUrl(filePath);

        const imageUrl = publicUrl.publicUrl;

        // ✅ نطلب من المستخدم اختيار الحجم
        const size = prompt(
          "Select image size:\nsmall = 150px\nmedium = 300px\nfull = 100%",
          "medium"
        );

        let widthValue;
        if (size === "small") widthValue = "150px";
        else if (size === "full") widthValue = "100%";
        else widthValue = "300px"; // الافتراضي medium

        // ✅ نضيف الصورة داخل المحرر في المكان الحالي مع عرض مخصص
        const imgHTML = `<img src="${imageUrl}" style="width:${widthValue}; border-radius:10px; margin:10px 0; display:block;">`;
        document.execCommand("insertHTML", false, imgHTML);
      } catch (err) {
        console.error("❌ Image upload failed:", err.message);
        alert("Image upload failed. Please try again.");
      }
    };
    input.click();
  } else {
    // باقي الأدوات العادية (Bold / Italic / Underline / List)
    document.execCommand(cmd, false, null);
  }
}


// ✅ معاينة المكان بالكامل (محاكي لصفحة places)
function previewPlace() {
  const title = document.getElementById("place-title")?.value.trim() || "Untitled Place";
  const city = document.getElementById("place-tag")?.value.trim() || "";
  const desc = document.getElementById("place-description")?.innerHTML || "<em>No description yet...</em>";
  const image = document.getElementById("place-image")?.files[0];

  const previewModal = document.getElementById("previewModal");
  const previewTitle = document.getElementById("previewTitle");
  const previewCity = document.getElementById("previewCity");
  const previewDescription = document.getElementById("previewDescription");
  const previewImage = document.getElementById("previewImage");

  // تعبئة البيانات
  previewTitle.textContent = title;
  previewCity.textContent = city;
  previewDescription.innerHTML = desc;

  // الصورة الرئيسية
  if (image) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.style.backgroundImage = `url('${e.target.result}')`;
    };
    reader.readAsDataURL(image);
  } else {
    previewImage.style.backgroundImage = "url('../assets/images/default.png')";
  }

  previewModal.classList.remove("hidden");
}

async function loadContactMessages() {
  const tbody = document.getElementById("contactTableBody");
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error loading contact messages:", error);
    return;
  }

  tbody.innerHTML = data.length
    ? data
        .map(
          (msg) => `
      <tr class="border-b">
        <td class="p-3">${msg.full_name}</td>
        <td class="p-3">${msg.email}</td>
        <td class="p-3">${msg.message}</td>
        <td class="p-3">${new Date(msg.created_at).toLocaleString()}</td>
      </tr>
    `
        )
        .join("")
    : `<tr><td colspan="4" class="p-4 text-center text-gray-500">No messages yet.</td></tr>`;
}



// ✅ إغلاق المودال + دعم الضغط بالخلفية أو ESC
function closePreview() {
  const modal = document.getElementById("previewModal");
  if (modal) modal.classList.add("hidden");
}

// ✅ أغلق المعاينة عند الضغط على الخلفية
document.getElementById("previewModal")?.addEventListener("click", (e) => {
  if (e.target.id === "previewModal") closePreview();
});

// ✅ أغلق المعاينة بزر ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePreview();
});


