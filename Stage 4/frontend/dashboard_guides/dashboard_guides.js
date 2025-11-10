console.log("✅ dashboard_guides.js loaded");

// Comment Modal Functions
function showCommentModal(comment) {
  const modal = document.getElementById("commentModal");
  const text = document.getElementById("commentText");
  text.innerHTML = comment || "No comment provided.";
  modal.classList.remove("hidden");
}

// Close Comment Modal
function closeCommentModal() {
  document.getElementById("commentModal").classList.add("hidden");
}

// Check Guide Access and Load Initial Data 
async function checkGuideAccess() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return (window.location.href = "../login/login.html");

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "guide") {
    showToast("Access denied!");
    return (window.location.href = "../home/home.html");
  }

  await loadGuideProfile(user.id);
  await loadTags(user.id);
  await loadLanguages(user.id);
  await loadGuideOverview(user.id);
  await loadRequests(user.id);
}
checkGuideAccess();

// Load Guide Profile Data
async function loadGuideProfile(guideId) {
  const { data, error } = await supabaseClient
    .from("guides")
    .select("*")
    .eq("id", guideId)
    .single();

  if (error) return;

  document.getElementById("fullName").value = data.full_name || "";
  document.getElementById("age").value = data.age || "";
  document.getElementById("licenseNumber").value = data.license_number || "";
  document.getElementById("bio").value = data.bio || "";
  // ✅ Phone
  if (document.getElementById("phone")) {
    document.getElementById("phone").value = data.phone || "";
  }

  const btn = document.getElementById("statusToggleBtn");
  if (data.receiving_requests) {
    btn.textContent = " Online";
    btn.classList.remove("paused");
    btn.classList.add("active");
  } else {
    btn.textContent = " Offline";
    btn.classList.remove("active");
    btn.classList.add("paused");
  }
}

// Toggle Guide Availability Status
async function toggleStatus() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const btn = document.getElementById("statusToggleBtn");
  const isActive = btn.classList.contains("active");

  if (!isActive) {
    const { data: guide, error } = await supabaseClient
      .from("guides")
      .select("full_name, bio, languages")
      .eq("id", user.id)
      .single();

    if (error) return;

    const nameOK = guide.full_name && guide.full_name.trim() !== "";
    const bioOK = guide.bio && guide.bio.trim() !== "";
    const langsOK = Array.isArray(guide.languages) && guide.languages.length > 0;

    const { count: regionsCount, error: rErr } = await supabaseClient
      .from("guide_tags")
      .select("*", { count: "exact", head: true })
      .eq("guide_id", user.id);

    const regionsOK = !rErr && regionsCount > 0;

    if (!nameOK || !bioOK || !langsOK || !regionsOK) {
      showToast("Please complete your profile before going online.", "error");
      return;
    }
  }

  const newState = !isActive;
  const { error: updateErr } = await supabaseClient
    .from("guides")
    .update({ receiving_requests: newState })
    .eq("id", user.id);

  if (updateErr) return;

  if (newState) {
    btn.textContent = " Online";
    btn.classList.remove("paused");
    btn.classList.add("active");
  } else {
    btn.textContent = " Offline";
    btn.classList.remove("active");
    btn.classList.add("paused");
  }
}

// Load Tags (Regions) for Guide  
async function loadTags(guideId) {
  const container = document.getElementById("regionsContainer");
  if (!container) return;
  container.innerHTML = "";

  const { data: allTags } = await supabaseClient
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: guideTags } = await supabaseClient
    .from("guide_tags")
    .select("tag_id")
    .eq("guide_id", guideId);

  const selectedIds = (guideTags?.map((t) => String(t.tag_id))) || [];

  container.innerHTML = "";
  allTags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = tag.name;
    btn.dataset.id = String(tag.id);
    btn.className = selectedIds.includes(String(tag.id))
      ? "region-btn active"
      : "region-btn";
    btn.addEventListener("click", () => btn.classList.toggle("active"));
    container.appendChild(btn);
  });
}

// Load Languages for Guide
async function loadLanguages(guideId) {
  const container = document.getElementById("languagesContainer");
  if (!container) return;
  container.innerHTML = "";

  const allLanguages = [
    "Arabic", "English", "French", "Spanish", "German",
    "Chinese", "Japanese", "Russian", "Italian", "Hindi"
  ];

  const { data } = await supabaseClient
    .from("guides")
    .select("languages")
    .eq("id", guideId)
    .single();

  const selected = data.languages || [];

  allLanguages.forEach((lang) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = lang;
    btn.dataset.value = lang;
    btn.className = selected.includes(lang)
      ? "lang-btn active"
      : "lang-btn";
    btn.addEventListener("click", () => btn.classList.toggle("active"));
    container.appendChild(btn);
  });
}

// Save Selected Regions
async function saveSelectedRegions(guideId) {
  const selected = Array.from(document.querySelectorAll(".region-btn.active")).map(
    (b) => b.dataset.id
  );
  await supabaseClient.from("guide_tags").delete().eq("guide_id", guideId);
  if (selected.length > 0) {
    const rows = selected.map((tag_id) => ({ guide_id: guideId, tag_id }));
    await supabaseClient.from("guide_tags").insert(rows);
  }
}

// Profile Form Submission
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const saveBtn = e.target.querySelector("button[type='submit']");
  const originalText = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<i class="fa fa-spinner fa-spin mr-2"></i> Saving...`;

  const { data: { user } } = await supabaseClient.auth.getUser();

  const full_name = document.getElementById("fullName").value.trim();
  const age = parseInt(document.getElementById("age").value);
  const license_number = document.getElementById("licenseNumber").value.trim();
  const bio = document.getElementById("bio").value.trim();
  const phone = (document.getElementById("phone")?.value || "").trim(); // ✅ جديد

  const selectedLangs = Array.from(document.querySelectorAll(".lang-btn.active"))
    .map((b) => b.dataset.value);

  const licenseFile = document.getElementById("licenseFile").files[0];
  let license_url = null;
  if (licenseFile) {
    const cleanedName = licenseFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const path = `licenses/${Date.now()}_${cleanedName}`;
    const { error: uploadErr } = await supabaseClient.storage
      .from("guides")
      .upload(path, licenseFile, { upsert: true });
    if (!uploadErr) {
      const { data: publicUrl } = supabaseClient.storage.from("guides").getPublicUrl(path);
      license_url = publicUrl.publicUrl;
    }
  }

 const avatarFile = document.getElementById("avatarFile").files[0];
let avatar_url = undefined; // 👈 لاحظ: لا نضع null

if (avatarFile) {
  const cleanedName = avatarFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const path = `guides/${Date.now()}_${cleanedName}`;

  const { error: uploadAvatarErr } = await supabaseClient.storage
    .from("guides")
    .upload(path, avatarFile, { upsert: true });

  if (!uploadAvatarErr) {
    const { data: avatarPublic } = supabaseClient.storage.from("guides").getPublicUrl(path);
    avatar_url = avatarPublic.publicUrl; // 👈 فقط هنا نحدده
  }
}

const updateData = {
  full_name,
  age: isNaN(age) ? null : age,
  license_number,
  bio,
  languages: selectedLangs,
  phone,
};

// إذا رفع صورة → نضيفها
if (avatar_url !== undefined) {
  updateData.avatar_url = avatar_url;
}

// إذا رفع رخصة → نضيفها
if (license_url !== null) {
  updateData.license_url = license_url;
}

await supabaseClient
  .from("guides")
  .update(updateData)
  .eq("id", user.id);


  await saveSelectedRegions(user.id);

  saveBtn.disabled = false;
  saveBtn.textContent = originalText;

  if (error) {
    showToast("Failed to update profile!", "error");
    console.error(error);
  } else {
    showToast("Profile updated successfully!", "success");
  }
});

// Load Guide Overview
async function loadGuideOverview(guideId) {
  const overview = document.getElementById("overview-cards");
  overview.innerHTML = `<p>Loading...</p>`;
  const { data: bookings } = await supabaseClient
    .from("bookings")
    .select("id, status")
    .eq("guide_id", guideId);

  const counts = {
    pending: bookings.filter(b => b.status === "pending").length,
    approved: bookings.filter(b => b.status === "approved").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  const { data: reviews } = await supabaseClient
    .from("reviews")
    .select("rating, comment, booking_id")
    .in("booking_id", bookings.map(b => b.id));

  let avg = 0;
  if (reviews.length > 0)
    avg = (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1);

  const { count: regionCount } = await supabaseClient
    .from("guide_tags")
    .select("*", { count: "exact", head: true })
    .eq("guide_id", guideId);

  overview.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card"><h3>Pending</h3><p>${counts.pending}</p></div>
      <div class="card"><h3>Approved</h3><p>${counts.approved}</p></div>
      <div class="card"><h3>Completed</h3><p>${counts.completed}</p></div>
    </div>
    <div class="stats-box mt-6">
      <h3> Average Rating</h3>
      <p class="count-number">${avg || "—"}</p>
    </div>
    <div class="stats-box mt-6">
      <h3> Regions Covered</h3>
      <p class="count-number">${regionCount || 0}</p>
    </div>
  `;
}

// Load Booking Requests
async function loadRequests(guideId) {
  const container = document.getElementById("requestsList");
  container.innerHTML = "<p>Loading...</p>";

  const { data, error } = await supabaseClient
    .from("bookings")
    .select(`
      id,
      status,
      start_at,
      num_guests,
      language,
      admin_note,
      profiles(full_name, phone, email),
      places(title, city, image_url)
    `)
    .eq("guide_id", guideId)
    .in("status", ["pending", "paused"])
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = `<p class="text-red-600">Failed to load requests.</p>`;
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-gray-500">No booking requests yet.</p>`;
    return;
  }

  container.innerHTML = "";

  data.forEach((b) => {
    const isPaused = b.status === "paused";
    const dateTime = new Date(b.start_at);
    const dateStr = dateTime.toLocaleDateString();
    const timeStr = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const card = document.createElement("div");
    card.className = isPaused ? "request-card paused-card" : "request-card";

    card.innerHTML = `
      <div class="request-img-wrap">
        <img src="${b.places?.image_url || '../assets/placeholder.jpg'}" class="request-card-img" />
      </div>

      <div class="request-info">
        <h3>${b.places?.title}</h3>
        <p class="request-sub"><i class="fa-solid fa-location-dot"></i> ${b.places?.city} · ${dateStr}</p>

        <div class="request-details">
          <p><strong>Tourist:</strong> ${b.profiles?.full_name}</p>
          <p><strong>Phone:</strong> ${b.profiles?.phone}</p>
          <p><strong>Guests:</strong> ${b.num_guests}</p>
          <p><strong>Language:</strong> ${b.language}</p>
          <p><strong>Time:</strong> ${timeStr}</p>

          ${b.admin_note ? `<p class="admin-note"><i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(b.admin_note)}</p>` : ""}
        </div>

        <div class="request-actions">
          ${
            isPaused
              ? `<div class="paused-note"><i class="fa-solid fa-pause-circle"></i> Paused by Admin</div>`
              : `
                <button class="btn-approve" onclick="updateBooking('${b.id}','approved')">
                  <i class="fa-solid fa-check"></i> Approve
                </button>
                <button class="btn-reject" onclick="updateBooking('${b.id}','rejected')">
                  <i class="fa-solid fa-xmark"></i> Reject
                </button>
              `
          }
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}


// ✅ Update Booking Status (ويشمل التحديث بعد إكمال الطلب)
async function updateBooking(bookingId, newStatus) {
  try {

    const { data: current, error: checkErr } = await supabaseClient
      .from("bookings")
      .select("status, admin_note")
      .eq("id", bookingId)
      .single();

    if (checkErr || !current) {
      showToast("❌ Failed to check booking status.", "error");
      return;
    }

    if (current.status === "paused") {
      showToast("🚫 This booking is paused by admin.", "error");
      return;
    }

    const { error } = await supabaseClient
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      console.error(error);
      showToast("❌ Failed to update booking.", "error");
      return;
    }

    showToast(
      newStatus === "completed"
        ? "✅ Trip marked as completed!"
        : newStatus === "approved"
        ? "✅ Booking approved!"
        : "❌ Booking rejected!",
      newStatus === "rejected" ? "error" : "success"
    );

    // ✅ تحديث القوائم مباشرة بدون ريفرش
    const { data: { user } } = await supabaseClient.auth.getUser();
    await loadGuideOverview(user.id);
    await loadRequests(user.id);
    await loadApprovedBookings(user.id);
    await loadCompletedTrips(user.id);

  } catch (err) {
    console.error(err);
    showToast("❌ Unexpected error.", "error");
  }
}


// ✅ Complete Booking (مع التحقق من أن الطلب غير موقوف)
async function markAsCompleted(bookingId) {
  if (!confirm("Mark this trip as completed?")) return;

  try {
    const { data: current, error: checkErr } = await supabaseClient
      .from("bookings")
      .select("status, admin_note")
      .eq("id", bookingId)
      .single();

    if (checkErr || !current) {
      showToast("❌ Failed to check booking status.", "error");
      return;
    }

    if (current.status === "paused") {
      showToast("🚫 This booking is paused by admin.", "error");
      return;
    }

    const { error } = await supabaseClient
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", bookingId);

    if (error) {
      console.error(error);
      showToast("❌ Failed to mark as completed.", "error");
      return;
    }

    showToast("✅ Trip marked as completed!", "success");
    const { data: { user } } = await supabaseClient.auth.getUser();
    loadApprovedBookings(user.id);
    loadGuideOverview(user.id);
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    showToast("❌ Unexpected error occurred.", "error");
  }
}

// ✅ Load Approved Bookings (موحّدة نفس Booking Requests تماماً)
async function loadApprovedBookings(guideId) {
  const container = document.getElementById("approvedList");
  container.innerHTML = "<p>Loading...</p>";

  const { data, error } = await supabaseClient
    .from("bookings")
    .select(`
      id,
      status,
      start_at,
      num_guests,
      language,
      admin_note,
      profiles(full_name, phone, email),
      places(title, city, image_url)
    `)
    .eq("guide_id", guideId)
    .eq("status", "approved")
    .order("start_at", { ascending: false });

  if (error) {
    container.innerHTML = `<p class="text-red-600">Error loading approved bookings.</p>`;
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-gray-500">No approved bookings yet.</p>`;
    return;
  }

  container.innerHTML = "";

  data.forEach((b) => {
    const date = new Date(b.start_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const card = document.createElement("div");
    card.className = "request-card";

    card.innerHTML = `
      <div class="request-img-wrap">
        <img src="${b.places?.image_url || '../assets/placeholder.jpg'}"
             class="request-card-img"
             alt="${b.places?.title || 'Place'}" />

        <!-- ✅ Badge نفس Requests -->
        <span class="request-status status-approved">Approved</span>
      </div>

      <div class="request-info">
        <h3>${b.places?.title || "Unknown Place"}</h3>
        <p class="request-sub">
          <i class="fa-solid fa-location-dot"></i>
          ${b.places?.city || "—"} · ${dateStr}
        </p>

        <!-- ✅ نفس توزيع المعلومات تماماً -->
        <div class="request-details">
          <p><strong>Tourist:</strong> ${b.profiles?.full_name || "—"}</p>
          <p><strong>Phone:</strong> ${b.profiles?.phone || "—"}</p>
          <p><strong>Guests:</strong> ${b.num_guests || 1}</p>
          <p><strong>Language:</strong> ${b.language || "—"}</p>
          <p><strong>Time:</strong> ${timeStr}</p>
          ${b.admin_note ? `<p class="admin-note">${escapeHtml(b.admin_note)}</p>` : ""}
        </div>

        <div class="request-actions">
          <!-- ✅ زر إنهاء الرحلة -->
          <button class="btn-approve" onclick="updateBooking('${b.id}', 'completed')">
            <i class="fa-solid fa-check-circle"></i> Mark as Completed
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}



// ✅ Load Completed Trips
async function loadCompletedTrips(guideId) {
  const tbody = document.getElementById("completedTripsBody");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <span>Loading...</span>
        </div>
      </td>
    </tr>
  `;

  const { data, error } = await supabaseClient
    .from("bookings")
    .select(`
      id,
      start_at,
      num_guests,
      language,
      profiles(full_name, phone),
      places(title, city, image_url),
      reviews(rating, comment)
    `)
    .eq("guide_id", guideId)
    .eq("status", "completed")
    .order("start_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="7" class="error">Failed to load completed trips.</td></tr>`;
    return;
  }

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">No completed trips yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  data.forEach((b) => {
    const rating = b.reviews?.rating ? `${b.reviews.rating}/5` : "—";
    const comment = b.reviews?.comment ? escapeHtml(b.reviews.comment) : "—";

    tbody.insertAdjacentHTML(
      "beforeend",
      `
      <tr>
        <td>${b.places?.title || "—"}</td>
        <td>${b.places?.city || "—"}</td>
        <td>${new Date(b.start_at).toLocaleDateString()}</td>
        <td>${b.profiles?.full_name || "—"}</td>
        <td>${b.num_guests || 1}</td>
        <td>${rating}</td>
        <td>
          ${
            comment !== "—"
              ? `<button class="comment-btn" onclick="showCommentModal('${comment}')">
                   <i class="fa-solid fa-comment"></i> View
                 </button>`
              : "—"
          }
        </td>
      </tr>
      `
    );
  });
}




// helper to sanitize comment
function escapeHtml(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}

// ✅ Navigation between side tabs (للتبديل بين الأقسام)
document.querySelectorAll(".side-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    document.querySelectorAll(".side-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll("section[id^='section-']").forEach((sec) => (sec.style.display = "none"));

    const target = btn.getAttribute("data-target");
    const section = document.getElementById(target);
    if (section) section.style.display = "block";

    const titleEl = document.getElementById("section-title");
    if (titleEl) titleEl.textContent = btn.innerText.trim();

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return (window.location.href = "../login/login_guides.html");

    switch (target) {
      case "section-overview":
        await loadGuideOverview(user.id);
        break;
      case "section-profile":
        await loadGuideProfile(user.id);
        await loadTags(user.id);
        await loadLanguages(user.id);
        break;
      case "section-requests":
        await loadRequests(user.id);
        break;
      case "section-approved":
        await loadApprovedBookings(user.id);
        break;
      case "section-completed":
        await loadCompletedTrips(user.id);
        break;
    }
  });
});

