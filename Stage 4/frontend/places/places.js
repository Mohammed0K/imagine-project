console.log("✅ Places.js Loaded");

// ===============================
// ✅ تحميل الأماكن
// ===============================
async function loadPlaces() {
  const container = document.getElementById("places-container");
  container.innerHTML = "<p>Loading places...</p>";

  const { data: places, error } = await supabaseClient
    .from("places")
    .select("id, title, city, description, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = "<p class='text-red-600'>Failed to load places.</p>";
    return;
  }

  if (!places?.length) {
    container.innerHTML = "<p>No places found.</p>";
    return;
  }

  container.innerHTML = "";
  places.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.image_url || "../assets/images/default.png"}" alt="${p.title}" />
      <div class="card-content">
        <h3>${p.title}</h3>
        <small>${p.city || "—"}</small>
        <p>${(p.description || "").substring(0, 90)}...</p>
        <button class="btn" onclick="openGuidesModal('${p.id}', '${p.title}')">
          View Guides
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ===============================
// ✅ فتح نافذة المرشدين (مطابقة عبر tags) مع عرض اللغات والصور
// ===============================
async function openGuidesModal(placeId, placeTitle) {
  const modal = document.getElementById("guides-modal");
  const list = document.getElementById("guides-list");
  const title = document.getElementById("modalPlaceTitle");

  title.textContent = `Available Guides for ${placeTitle}`;
  modal.classList.remove("hidden");
  list.innerHTML = "<p>Loading guides...</p>";

  // 1️⃣ اجلب كل الـ tags لهذا المكان
  const { data: placeTags, error: ptErr } = await supabaseClient
    .from("place_tags")
    .select("tag_id")
    .eq("place_id", placeId);

  if (ptErr) {
    console.error(ptErr);
    list.innerHTML = "<p class='text-red-600'>Failed to load place tags.</p>";
    return;
  }

  if (!placeTags?.length) {
    list.innerHTML = "<p>No tags linked for this place yet.</p>";
    return;
  }

  const tagIds = placeTags.map(t => t.tag_id);

  // 2️⃣ ابحث عن المرشدين اللي يغطون نفس tags
  const { data: guideTags, error: gtErr } = await supabaseClient
    .from("guide_tags")
    .select("guide_id, tag_id")
    .in("tag_id", tagIds);

  if (gtErr) {
    console.error(gtErr);
    list.innerHTML = "<p class='text-red-600'>Failed to load guide tags.</p>";
    return;
  }

  if (!guideTags?.length) {
    list.innerHTML = "<p>No guides match this place’s regions.</p>";
    return;
  }

  const guideIds = [...new Set(guideTags.map(gt => gt.guide_id))]; // إزالة التكرارات

  // 3️⃣ اجلب بيانات المرشدين مع اللغات والصورة
  const { data: guides, error: gErr } = await supabaseClient
    .from("guides")
    .select("id, full_name, city, rating, avatar_url, languages, bio, receiving_requests, status")
    .in("id", guideIds)
    .eq("status", "approved")
    .eq("receiving_requests", true);

  if (gErr) {
    console.error(gErr);
    list.innerHTML = "<p class='text-red-600'>Failed to load guides.</p>";
    return;
  }

  if (!guides?.length) {
    list.innerHTML = "<p>No available guides for this region.</p>";
    return;
  }

  // 4️⃣ عرض النتائج بشكل منسق مع اللغات والصورة
  list.innerHTML = "";
  guides.forEach((g) => {
    const card = document.createElement("div");
    card.className = "guide-card";

    const langs = (g.languages && g.languages.length)
      ? g.languages.join(", ")
      : "—";

    card.innerHTML = `
      <img src="${g.avatar_url || "../assets/images/default.png"}" alt="${g.full_name}" />
      <div class="guide-name">${g.full_name}</div>
      <div class="guide-city">${g.city || "—"}</div>
      <div class="guide-langs"><b>Languages:</b> ${langs}</div>
      <div class="rating">⭐ ${g.rating ? Number(g.rating).toFixed(1) : "—"}</div>
      <button class="book-btn" onclick="goToGuideDetails('${g.id}','${placeId}')"> Book Now </button>

    `;
    list.appendChild(card);
  });
}


// ===============================
// ✅ إغلاق المودال
// ===============================
document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("guides-modal").classList.add("hidden");
});

// ===============================
// ✅ إنشاء حجز جديد
// ===============================
async function bookGuide(guideId, placeId) {
  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth.user) {
    alert("Please login first to book.");
    return;
  }

  const start_at = prompt("Enter date (YYYY-MM-DD):");
  if (!start_at) return;

  const { error } = await supabaseClient.from("bookings").insert([
    {
      customer_id: auth.user.id,
      guide_id: guideId,
      place_id: placeId,
      start_at,
      status: "pending",
    },
  ]);

  if (error) {
    console.error(error);
    alert("❌ Booking failed");
  } else {
    alert("✅ Booking sent to guide for approval!");
    document.getElementById("guides-modal").classList.add("hidden");
  }
}
function goToGuideDetails(guideId, placeId) {
  window.location.href = `../guides/guide-details.html?guide_id=${guideId}&place_id=${placeId}`;
}

// بدء التشغيل
loadPlaces();
