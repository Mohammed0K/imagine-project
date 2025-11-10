console.log("✅ guides.js loaded");

// ✅ تحميل المرشدين الموافق عليهم والمُتاحين فقط
(async function () {
  const grid = document.getElementById("guidesGrid");

// ✅ أول ما تفتح الصفحة السكلتون موجود
// لا نلمسهم

const { data: guides, error } = await supabaseClient
  .from("guides")
  .select("id, full_name, city, languages, avatar_url, bio, receiving_requests, status")
  .eq("status", "approved")
  .eq("receiving_requests", true);

// ✅ بعد ما تجينا البيانات نحذف السكلتون
grid.innerHTML = "";


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
    // 🟢 حساب متوسط التقييم مباشرة من جدول reviews
    let avgRating = null;
    let ratingHTML = '';

    const { data: ratings, error: rErr } = await supabaseClient
      .from("reviews")
      .select("rating")
      .eq("guide_id", g.id);

    if (!rErr && ratings && ratings.length > 0) {
      const sum = ratings.reduce((total, r) => total + (r.rating || 0), 0);
      avgRating = (sum / ratings.length).toFixed(1);
      ratingHTML = `
        <div class="rating">
          <span class="star-icon">⭐</span>
          <span class="rating-value">${avgRating}</span>
          <span class="reviews-count" onclick="openReviewsModal('${g.id}', ${avgRating}, ${ratings.length})">
            (${ratings.length})
          </span>

        </div>
      `;
    } else {
      ratingHTML = `
  <div class="rating">
    <span class="badge-new">NEW</span>
  </div>
`;

    }

   // ✅ خريطة اللغات → اختصارات
const languageMap = {
  "Arabic": "AR",
  "English": "EN",
  "French": "FR",
  "Spanish": "ES",
  "German": "DE",
  "Chinese": "ZH",
  "Japanese": "JA",
  "Russian": "RU",
  "Italian": "IT",
  "Hindi": "HI"
};

// ✅ تحويل اللغات لقائمة اختصارات
const langs = Array.isArray(g.languages)
  ? g.languages.map(l => languageMap[l] || l)
  : [languageMap[g.languages] || g.languages];

// ✅ تكوين HTML للـ Tags
const languagesHTML = langs
  .map(code => `<span class="lang-tag">${code}</span>`)
  .join("");


    const img = g.avatar_url || "../assets/images/default.png";

    const card = document.createElement("div");
    card.className = "guide-card";
    card.innerHTML = `
      <img 
        src="${img}" 
        alt="${g.full_name || "Guide"}"
        style="filter: brightness(1.05) contrast(1.1) saturate(1.1);"
        loading="lazy"
        onerror="this.src='../assets/images/default.png'"
      />
      <div class="guide-card-content">
        <h3>${g.full_name || "Guide"}</h3>
        <div class="languages">${languagesHTML}</div>


        ${ratingHTML}
        <p class="bio">${g.bio ? g.bio.substring(0, 80) + "..." : "No bio available."}</p>
        <button class="book-btn" onclick="openPlacesModal('${g.id}', '${g.full_name}')">
          View Coverage
        </button>
      </div>
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
  document.body.style.overflow = "hidden";
// ✅ عرض سكلتون عند فتح المودال
list.innerHTML = `
  <div class="place-card skeleton-place">
    <div class="skeleton-img"></div>
    <div class="skeleton-text1"></div>
    <div class="skeleton-text2"></div>
    <div class="skeleton-btn"></div>
  </div>
  <div class="place-card skeleton-place">
    <div class="skeleton-img"></div>
    <div class="skeleton-text1"></div>
    <div class="skeleton-text2"></div>
    <div class="skeleton-btn"></div>
  </div>
  <div class="place-card skeleton-place">
    <div class="skeleton-img"></div>
    <div class="skeleton-text1"></div>
    <div class="skeleton-text2"></div>
    <div class="skeleton-btn"></div>
  </div>
`;

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
        Book Now
      </button>
    `;
    list.appendChild(card);
  });
}

// ✅ إغلاق المودال
document.getElementById("closePlacesModal")?.addEventListener("click", () => {
  document.getElementById("placesModal").classList.add("hidden");
  document.body.style.overflow = "";
});

// إغلاق المودال بالضغط على الخلفية
document.getElementById("placesModal")?.addEventListener("click", (e) => {
  if (e.target.id === "placesModal") {
    document.getElementById("placesModal").classList.add("hidden");
    document.body.style.overflow = "";
  }
});

// إغلاق المودال بالضغط على ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("placesModal");
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }
});

// ✅ الانتقال إلى صفحة التفاصيل
function goToGuideDetails(guideId, placeId) {
  window.location.href = `../guides/guide-details.html?guide_id=${guideId}&place_id=${placeId}`;
}