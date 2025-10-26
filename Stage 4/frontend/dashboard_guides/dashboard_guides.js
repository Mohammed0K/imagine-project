console.log("✅ dashboard_guides.js loaded");

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 5000);
}

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
    showToast("Access denied!"); // success or "error"
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
      showToast("Please complete your profile before going online.", "error"); // success or "error"
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
    btn.type = "button"; // prevent form submit
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
    btn.type = "button"; // prevent form submit
    btn.textContent = lang;
    btn.dataset.value = lang;
    btn.className = selected.includes(lang)
      ? "lang-btn active"
      : "lang-btn";
    btn.addEventListener("click", () => btn.classList.toggle("active"));
    container.appendChild(btn);
  });
}

// Save Selected Regions and informaions for Guide  
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
  let avatar_url = null;
  if (avatarFile) {
    const cleanedName = avatarFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const path = `guides/${Date.now()}_${cleanedName}`;
    const { error: uploadAvatarErr } = await supabaseClient.storage
      .from("guides")
      .upload(path, avatarFile, { upsert: true });
    if (!uploadAvatarErr) {
      const { data: avatarPublic } = supabaseClient.storage.from("guides").getPublicUrl(path);
      avatar_url = avatarPublic.publicUrl;
    }
  }

  const { error } = await supabaseClient
    .from("guides")
    .update({
      full_name,
      age: isNaN(age) ? null : age,
      license_number,
      license_url,
      avatar_url,
      bio,
      languages: selectedLangs,
    })
    .eq("id", user.id);

  await saveSelectedRegions(user.id);

  saveBtn.disabled = false;
  saveBtn.textContent = originalText;

  if (error) {
    showToast("Failed to update profile!", "error"); // success or "error"

    console.error(error);
  } else {
    showToast("Profile updated successfully!", "success"); // success or "error"

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
      <h3>⭐ Average Rating</h3>
      <p class="count-number">${avg || "—"}</p>
    </div>
    <div class="stats-box mt-6">
      <h3>🏙️ Regions Covered</h3>
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
      profiles(full_name),
      places(title)
    `)
    .eq("guide_id", guideId)
    .eq("status", "pending") // ✅ نعرض فقط الحجوزات المعلقة
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error loading requests:", error);
    container.innerHTML = `<p class="text-red-600">Failed to load requests.</p>`;
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-gray-500">No booking requests yet.</p>`;
    return;
  }

  container.innerHTML = "";

  data.forEach((b) => {
    const card = document.createElement("div");
    card.className =
      "border border-gray-300 rounded-lg p-4 bg-white flex justify-between items-center mb-3";
    card.setAttribute("data-id", b.id);

    card.innerHTML = `
      <div>
        <p class="font-semibold text-[#556b2f]">${b.profiles?.full_name || "Unknown Tourist"}</p>
        <p class="text-sm text-gray-600">Place: ${b.places?.title || "—"}</p>
        <p class="text-sm">Guests: ${b.num_guests || 1}</p>
        <p class="text-sm">Date: ${new Date(b.start_at).toLocaleDateString()}</p>
      </div>
      <div class="flex gap-3">
        <button onclick="updateBooking('${b.id}','approved')" class="text-green-600 hover:text-green-800">
          <i class="fa-solid fa-check"></i> Approve
        </button>
        <button onclick="updateBooking('${b.id}','rejected')" class="text-red-600 hover:text-red-800">
          <i class="fa-solid fa-xmark"></i> Reject
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Update Booking Status
async function updateBooking(bookingId, newStatus) {
  const { error } = await supabaseClient
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    showToast("❌ Failed to update booking.", "error"); // second parmeter= success or "error"

    return;
  }

  const card = document.querySelector(`[data-id='${bookingId}']`);
  if (card) card.remove();

  showToast(`✅ Booking ${newStatus === "approved" ? "approved" : "rejected"} successfully!`, "success");

  const { data: { user } } = await supabaseClient.auth.getUser();
  loadGuideOverview(user.id);
}

// Navigation Buttons Event Listeners
document.querySelectorAll(".side-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    document.querySelectorAll(".side-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll("section[id^='section-']").forEach((s) => (s.style.display = "none"));

    const target = btn.getAttribute("data-target");
    const section = document.getElementById(target);
    if (section) section.style.display = "block";

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return window.location.href = "../login/login_guides.html";

    // Show loader overlay
    let loader = document.createElement("div");
    loader.className = "loading-spinner";
    loader.innerHTML = `<div class="spinner"></div><span>Loading...</span>`;
    section.appendChild(loader);

    try {
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
    } catch (err) {
      console.error(err);
      showToast("Failed to load data.", "error");
    } finally {
      loader.remove(); // Remove spinner when done
    }
  });
});

// ✅ Load Approved Bookings
async function loadApprovedBookings(guideId) {
  const container = document.getElementById("approvedList");
  container.innerHTML = "<p>Loading...</p>";

  const { data, error } = await supabaseClient
    .from("bookings")
    .select("id, start_at, profiles(full_name), places(title), status")
    .eq("guide_id", guideId)
    .eq("status", "approved")
    .order("start_at", { ascending: false });

  if (error) {
    container.innerHTML = `<p class="text-red-600">Error loading bookings.</p>`;
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p class="text-gray-500">No approved bookings yet.</p>`;
    return;
  }

  container.innerHTML = "";
  data.forEach((b) => {
    const card = document.createElement("div");
   card.className = `
  w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-5 
  hover:shadow-lg transition-shadow duration-200
`;
    card.innerHTML = `
      <div>
        <p class="font-semibold text-[#556b2f]">${b.profiles?.full_name || "Unknown Tourist"}</p>
        <p class="text-sm text-gray-600">Place: ${b.places?.title || "—"}</p>
        <p class="text-sm">Date: ${new Date(b.start_at).toLocaleDateString()}</p>
      </div>
      <div class="flex gap-3">
        <button onclick="markAsCompleted('${b.id}')" class="text-blue-600 hover:text-blue-800">
          <i class="fa-solid fa-flag-checkered"></i> Mark as Completed
        </button>
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
      profiles(full_name, email),
      places(title, city),
      reviews(rating, comment)
    `)
    .eq("guide_id", guideId)
    .eq("status", "completed")
    .order("start_at", { ascending: false });

  if (error) {
    console.error("❌ Error loading completed trips:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="error">Failed to load completed trips.</td>
      </tr>
    `;
    showToast("Failed to load data.", "error");
    return;
  }

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty">No completed trips yet.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  data.forEach((trip) => {
    const review = trip.reviews?.[0];
    const rating = review?.rating
      ? "⭐".repeat(review.rating) + ` (${review.rating}/5)`
      : "—";
    const comment = review?.comment || "No comment";

    const touristName = trip.profiles?.full_name || "—";
    const touristEmail = trip.profiles?.email || "—";

    tbody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>${trip.places?.title || "—"}</td>
          <td>${trip.places?.city || "—"}</td>
          <td>${new Date(trip.start_at).toLocaleDateString()}</td>
          <td>${touristName}</td>
          <td>${trip.num_guests || 1}</td>
          <td>${rating}</td>
          <td>
            <button class="comment-btn" onclick="showCommentModal('${escapeHtml(comment)}')">
              <i class="fa-solid fa-comment"></i> View
            </button>
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

// Complete Booking
async function markAsCompleted(bookingId) {
  if (!confirm("Mark this trip as completed?")) return;

  const { error } = await supabaseClient
    .from("bookings")
    .update({ status: "completed" })
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    showToast("❌ Failed to mark as completed.", "error"); //success or "error"

    return;
  }

  showToast("✅ Trip marked as completed!", "success"); // or "error"
  const { data: { user } } = await supabaseClient.auth.getUser();
  loadApprovedBookings(user.id);
  loadGuideOverview(user.id); // لتحديث الإحصائيات
}

// Logout Button Event Listener
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "../login/login_guides.html";
});
