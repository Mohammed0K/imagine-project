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
    alert("Unauthorized! Please login again.");
    return (window.location.href = "../dashboard/login_admin.html");
  }

  const { data: profile } = await supabaseClient
    .from("profiles_view")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    alert("Admins only!");
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
          <button class="text-green-600" onclick="approveGuide('${g.id}')">✅ Approve</button>
          <button class="text-red-600" onclick="rejectGuide('${g.id}')">❌ Reject</button>
        </td>
      </tr>
    `;
  });
}
async function approveGuide(guideId) {
  await supabaseClient.from("guides").update({ status: "approved" }).eq("id", guideId);
  await supabaseClient.from("profiles").update({ role: "guide" }).eq("id", guideId);
  alert("✅ Guide Approved!");
  loadDashboardCounts();
  loadPendingGuides();
}
async function rejectGuide(guideId) {
  await supabaseClient.from("guides").update({ status: "rejected" }).eq("id", guideId);
  alert("❌ Guide Rejected!");
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
        <td>${g.receiving_requests ? "✅ Yes" : "❌ No"}</td>
        <td>
          <button class="text-red-600" onclick="deleteGuideAccount('${g.id}')">🗑️ Delete</button>
        </td>
      </tr>
    `;
  });
}
async function deleteGuideAccount(id) {
  if (!confirm("Delete this guide?")) return;
  await supabaseClient.from("guides").delete().eq("id", id);
  await supabaseClient.from("profiles").delete().eq("id", id);
  alert("✅ Deleted successfully");
  loadAllGuides();
  loadDashboardCounts();
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



async function loadPlaces() {
  const tbody = document.getElementById("places-table");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  const { data, error } = await supabaseClient
    .from("places")
    .select("id, title, city, description, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error loading places:", error.message);
    tbody.innerHTML = `<tr><td colspan="5">Error loading places.</td></tr>`;
    return;
  }

  if (!data || !data.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-gray-500">No places found</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  data.forEach((p) => {
    tbody.innerHTML += `
      <tr>
        <td>${p.title || "—"}</td>
        <td>${p.city || "—"}</td>
        <td>${(p.description || "").substring(0, 80)}...</td>
        <td><img src="${p.image_url}" alt="${p.title}" class="w-20 h-16 object-cover rounded border" /></td>
        <td>
          <button onclick="deletePlace('${p.id}', '${p.image_url}')" class="text-red-600 hover:underline">🗑️ Delete</button>
        </td>
      </tr>
    `;
  });
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
document.getElementById("confirmDeleteBtn")?.addEventListener("click", async () => {
  const { id, img } = placeToDelete;
  if (!id) return;

  try {
    // حذف الصورة من التخزين
    if (img) {
      const fileName = img.split("/").pop();
      await supabaseClient.storage.from("places").remove([`places/${fileName}`]);
    }

    // حذف السجل من قاعدة البيانات
    await supabaseClient.from("places").delete().eq("id", id);

    // إغلاق المودال
    const modal = document.getElementById("deleteModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");

    // إعادة تحميل الأماكن
    await loadPlaces();
    await loadDashboardCounts();

    // إشعار بسيط بعد النجاح
    const toast = document.createElement("div");
    toast.textContent = "✅ Place deleted successfully";
    toast.className =
      "fixed bottom-5 right-5 bg-[#7a9163] text-white px-4 py-2 rounded-lg shadow-md animate-fadeIn";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);

  } catch (error) {
    console.error("❌ Error deleting place:", error);
    alert("❌ Failed to delete place.");
  } finally {
    placeToDelete = { id: null, img: null };
  }
});


// إضافة مكان جديد (مراعاة place-tag)
// إضافة مكان جديد (مراعاة place-tag)
document.getElementById("addPlaceForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("place-title").value.trim();
  const city  = document.getElementById("place-tag").value.trim(); // ← مطابق للـ HTML
  const desc  = document.getElementById("place-desc").value.trim();
  const file  = document.getElementById("place-image").files[0];
  if (!title || !city || !desc || !file) return alert("❌ Please fill all fields");

  const cleaned = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const path = `places/${Date.now()}_${cleaned}`;

  const { error: upErr } = await supabaseClient.storage.from("places").upload(path, file);
  if (upErr) return alert("❌ Upload failed: " + upErr.message);

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

  if (insertPlaceErr) return alert("❌ Failed to add place: " + insertPlaceErr.message);

  // ✅ 3️⃣ اربط المكان بالـ tag في place_tags
  if (tagId && newPlace?.id) {
    const { error: linkErr } = await supabaseClient
      .from("place_tags")
      .insert({ place_id: newPlace.id, tag_id: tagId });

    if (linkErr) console.warn("⚠️ Linking place_tag failed:", linkErr);
  }

  alert("✅ Added successfully");
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

  // نجلب حقول أساسية + IDs ثم نجيب الإيميلات بخطوة منفصلة لو احتجنا
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("id, status, start_at, admin_note, guide_id, customer_id, guides(full_name), places(title,city)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan='9'>Error loading requests</td></tr>`;
    return;
  }

  if (!data?.length) {
    tbody.innerHTML = `<tr><td colspan='9' class='text-gray-500'>No requests</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  data.forEach((b) => {
    tbody.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.guides?.full_name || "Guide"}</td>
        <td><!-- Customer (hidden here) --></td>
        <td>${b.places?.title || "—"}</td>
        <td>${b.places?.city || "—"}</td>
        <td>${fmtDate(b.start_at)}</td>
        <td>${b.status}</td>
        <td>${b.admin_note || "—"}</td>
        <td class="text-center">
          ${
            b.status === "pending"
              ? `<button onclick="updateBooking('${b.id}','approved')" class="text-green-600">Approve</button>
                 <button onclick="updateBooking('${b.id}','canceled')" class="text-red-600">Reject</button>`
              : "—"
          }
        </td>
      </tr>
    `;
  });
}
async function updateBooking(id, status) {
  const { error } = await supabaseClient.from("bookings").update({ status }).eq("id", id);
  if (error) return alert("❌ " + error.message);
  alert(`✅ Booking ${status}`);
  loadRequests();
  loadDashboardCounts();
}

// -----------------------
// 5) Completed Bookings (مع الإيميلات + المكان)
// -----------------------
async function loadCompletedBookings() {
  const tbody = document.getElementById("completed-table");
  if (!tbody) return;
  tbody.innerHTML = "<tr><td colspan='10'>Loading...</td></tr>";

  // نجلب الأساسيات + IDs
  const { data, error } = await supabaseClient
    .from("bookings")
    .select("id, start_at, guide_id, customer_id, places(title,city), guides(full_name), profiles!bookings_customer_id_fkey(full_name), reviews(rating,comment)")
    .eq("status", "completed")
    .order("start_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan='10'>Error loading</td></tr>`;
    return;
  }
  if (!data?.length) {
    tbody.innerHTML = `<tr><td colspan='10' class='text-gray-500'>No completed bookings</td></tr>`;
    return;
  }

  // اجلب إيميلات المرشدين والعملاء بخطوة واحدة من profiles
  const ids = unique([
    ...data.map(b => b.guide_id),
    ...data.map(b => b.customer_id),
  ]);
  const { data: profs } = await supabaseClient
    .from("profiles_view")
    .select("id,email,full_name")
    .in("id", ids);

  const emailById = {};
  profs?.forEach(p => { emailById[p.id] = p.email; });

  tbody.innerHTML = "";
  data.forEach((b) => {
    const rev = Array.isArray(b.reviews) ? b.reviews[0] : null;
    tbody.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td>${b.guides?.full_name || "Guide"}</td>
        <td>${emailById[b.guide_id] || "—"}</td>
        <td>${b.profiles?.full_name || "Customer"}</td>
        <td>${emailById[b.customer_id] || "—"}</td>
        <td>${b.places?.title || "—"}</td>
        <td>${b.places?.city || "—"}</td>
        <td>${fmtDate(b.start_at)}</td>
        <td>${rev ? `${rev.rating}⭐` : "—"}</td>
        <td>${rev?.comment || "—"}</td>
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

    alert("✅ Customer deleted successfully from Auth & Database.");
    await loadAllCustomers();
    await loadDashboardCounts();
  } catch (err) {
    console.error("❌ Failed to delete:", err.message);
    alert("❌ Error deleting customer: " + err.message);
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
  if (!city) return alert("❌ Please enter a valid city name.");

  // تحقق من وجودها مسبقًا
  const { data: existing } = await supabaseClient
    .from("tags")
    .select("id")
    .eq("name", city)
    .maybeSingle();

  if (existing) {
    alert("⚠️ This city already exists!");
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
    return alert("❌ Error: " + error.message);
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

  alert(`✅ City "${city}" added successfully!`);
});



// -----------------------
// 8) Logout
// -----------------------
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "../dashboard/login_admin.html";
});
