console.log("✅ guides.js loaded");

// ✅ تحميل المرشدين الموافق عليهم والمُتاحين فقط
(async function () {
  const grid = document.getElementById("guidesGrid");

  const { data: guides, error } = await supabaseClient
    .from("guides")
    .select("id, full_name, city, languages, avatar_url, bio, receiving_requests, status")
    .eq("status", "approved")
    .eq("receiving_requests", true);

  if (error) {
    console.error("❌ Failed to load guides:", error);
    grid.innerHTML = `<p class="error">Failed to load guides.</p>`;
    return;
  }

  if (!guides?.length) {
    grid.innerHTML = `<p class="empty">No guides available yet.</p>`;
    return;
  }

  // ✅ إنشاء البطاقات
  for (const g of guides) {
    // 🟢 حساب التقييم من جدول reviews عبر bookings
  // 🟢 حساب متوسط التقييم مباشرة من جدول reviews
let avgRating = "—";

const { data: ratings, error: rErr } = await supabaseClient
  .from("reviews")
  .select("rating")
  .eq("guide_id", g.id);

if (!rErr && ratings && ratings.length > 0) {
  const sum = ratings.reduce((total, r) => total + (r.rating || 0), 0);
  avgRating = (sum / ratings.length).toFixed(1);
}

    

    const langs = Array.isArray(g.languages)
      ? g.languages.join(", ")
      : g.languages || "—";
    const img = g.avatar_url || "../assets/images/default.png";

    const card = document.createElement("div");
    card.className = "guide-card";
    card.innerHTML = `
      <img src="${img}" alt="${g.full_name || "Guide"}" />
      <h3>${g.full_name || "Guide"}</h3>
      <div class="region">${g.city || "—"}</div>
      <div class="languages">Languages: ${langs}</div>
      <div class="rating">⭐ ${avgRating}</div>
      <p class="bio text-gray-600 text-sm mt-2">${g.bio ? g.bio.substring(0, 100) + "..." : "No bio available."}</p>
      <button class="book-btn" onclick="openPlacesModal('${g.id}', '${g.full_name}')">
        View Coverage
      </button>
    `;
    grid.appendChild(card);
  }
})();

// ✅ فتح مودال الأماكن الخاصة بالمرشد
async function openPlacesModal(guideId, guideName) {
  const modal = document.getElementById("placesModal");
  const list = document.getElementById("placesList");
  const title = document.getElementById("modalGuideTitle");

  if (!modal || !list || !title) {
    console.error("❌ Modal elements not found in DOM.");
    return;
  }

  title.textContent = `Places covered by ${guideName}`;
  modal.classList.remove("hidden");
  list.innerHTML = "<p>Loading places...</p>";

  // 🟢 اجلب جميع التاجات المرتبطة بالمرشد
  const { data: guideTags, error: gErr } = await supabaseClient
    .from("guide_tags")
    .select("tag_id")
    .eq("guide_id", guideId);

  if (gErr || !guideTags?.length) {
    list.innerHTML = "<p class='text-gray-600'>No regions linked to this guide yet.</p>";
    return;
  }

  const tagIds = guideTags.map((t) => t.tag_id);

  // 🟢 جلب الأماكن التي تحمل نفس التاجات
  const { data: placeTags, error: pErr } = await supabaseClient
    .from("place_tags")
    .select("place_id")
    .in("tag_id", tagIds);

  if (pErr || !placeTags?.length) {
    list.innerHTML = "<p>No matching places found.</p>";
    return;
  }

  const placeIds = [...new Set(placeTags.map((p) => p.place_id))];

  // 🟢 جلب بيانات الأماكن
  const { data: places, error: placeErr } = await supabaseClient
    .from("places")
    .select("id, title, city, image_url, description")
    .in("id", placeIds);

  if (placeErr || !places?.length) {
    list.innerHTML = "<p>No available places for this guide.</p>";
    return;
  }

  // 🟢 عرض الأماكن داخل المودال
  list.innerHTML = "";
  places.forEach((p) => {
    const card = document.createElement("div");
card.className = "place-card";

card.innerHTML = `
  <img src="${p.image_url || "../assets/images/default.png"}" alt="${p.title}" />
  <div class="place-name">${p.title}</div>
  <div class="place-city">${p.city || "—"}</div>
  <button class="book-btn" onclick="goToGuideDetails('${guideId}','${p.id}')">
    Go to Details
  </button>
`;
    list.appendChild(card);
  });
}

// ✅ إغلاق المودال
document.getElementById("closePlacesModal")?.addEventListener("click", () => {
  document.getElementById("placesModal").classList.add("hidden");
});

// ✅ الانتقال إلى صفحة التفاصيل
function goToGuideDetails(guideId, placeId) {
  window.location.href = `../guides/guide-details.html?guide_id=${guideId}&place_id=${placeId}`;
}
