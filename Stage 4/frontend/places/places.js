console.log("✅ Places.js Loaded");

function formatDescription(text, placeId) {
  if (!text) return "No description available.";

  const words = text.split(/\s+/);
  const preview = words.slice(20, 40).join(" ");
  const hasMore = words.length > 40;

  if (!hasMore) return preview;

  return `
    ${preview}
    <span 
      class="read-more"
      onclick="event.preventDefault(); event.stopPropagation(); openPlaceOverlay('${placeId}'); return false;"
    >
      read more
    </span>
  `;
}



// ===============================
// ✅ تحميل الأماكن
// ===============================
// ✅ تحميل الأماكن
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

  // ✅ نمرّ على كل مكان ونبني الكارد
  places.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    // 👇 عند الضغط على الكارد نفسه: افتح تفاصيل المكان
    card.addEventListener("click", () => openPlaceOverlay(p.id));
    card.addEventListener("keydown", (e) => { if (e.key === "Enter") openPlaceOverlay(p.id); });

    // ✅ الكارد نفسه
    card.innerHTML = `
      <img src="${p.image_url}" alt="${p.title}" />
      <div class="p-4">
        <h3 class="text-[#4f6033] text-lg font-semibold">${p.title}</h3>
        <p class="text-gray-500 text-sm mb-3">${p.city}</p>
        <p class="place-desc-preview text-gray-700 text-sm mb-4">
          ${formatDescription(p.description || "", p.id)}
        </p>


        <!-- ✅ الزر الجديد: يعرض المرشدين فقط -->
        <button
          class="bg-[#7a9163] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#6b8358] transition"
          onclick="event.stopPropagation(); openGuidesModal('${p.id}', '${p.title}')">
          View Guides
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}


// ===============================
// ✅ نافذة المرشدين (كما كانت)
// ===============================
async function openGuidesModal(placeId, placeTitle) {
  const modal = document.getElementById("guides-modal");
  const list = document.getElementById("guides-list");
  const title = document.getElementById("modalPlaceTitle");

  title.textContent = `Available Guides for ${placeTitle}`;
  modal.classList.remove("hidden");
  list.innerHTML = "<p>Loading guides...</p>";

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

  const guideIds = [...new Set(guideTags.map(gt => gt.guide_id))];

  const { data: guidesRaw, error: gErr } = await supabaseClient
    .from("guides")
    .select("id, full_name, city, avatar_url, languages, bio, receiving_requests, status")
    .in("id", guideIds)
    .eq("status", "approved")
    .eq("receiving_requests", true);

  if (gErr) {
    console.error(gErr);
    list.innerHTML = "<p class='text-red-600'>Failed to load guides.</p>";
    return;
  }
  if (!guidesRaw?.length) {
    list.innerHTML = "<p>No available guides for this region.</p>";
    return;
  }

  const guideIdsArr = guidesRaw.map(g => g.id);
  const { data: reviews } = await supabaseClient
    .from("reviews")
    .select("guide_id, rating")
    .in("guide_id", guideIdsArr);

  const avgRatings = {};
  if (reviews && reviews.length) {
    reviews.forEach(r => {
      if (!avgRatings[r.guide_id]) avgRatings[r.guide_id] = [];
      avgRatings[r.guide_id].push(r.rating);
    });
    Object.keys(avgRatings).forEach(id => {
      const arr = avgRatings[id];
      avgRatings[id] = arr.reduce((a, b) => a + b, 0) / arr.length;
    });
  }

  list.innerHTML = "";
  guidesRaw.forEach((g) => {
    const card = document.createElement("div");
    card.className = "guide-card";

    const langs = (g.languages && g.languages.length) ? g.languages.join(", ") : "—";
    const rating = avgRatings[g.id] ? avgRatings[g.id].toFixed(1) : "—";
    const stars = rating !== "—" ? "⭐ " + rating : "⭐ —";

    card.innerHTML = `
      <div class="guide-photo" style="background-image: url('${g.avatar_url || "../assets/images/default.png"}');"></div>
      <div class="guide-name">${escapeHtml(g.full_name)}</div>
      <div class="guide-city">${escapeHtml(g.city || "________________")}</div>
        ${rating !== "—" 
      ? `<div class="rating-row"><i class="fa-solid fa-star"></i><span>${rating}</span></div>` 
      : `<span class="badge-new">New</span>`}
          <div class="guide-langs"><b>Languages:</b> ${escapeHtml(langs)}</div>
         
          <p class="guide-bio text-gray-600 text-sm mt-2">${g.bio ? escapeHtml(g.bio.substring(0, 100)) + "..." : "No bio available."}</p>
          <button class="book-btn mt-3" onclick="goToGuideDetails('${g.id}','${placeId}')">Book Now</button>
        `;
    list.appendChild(card);
  });
}

document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("guides-modal").classList.add("hidden");
});

async function openPlaceOverlay(placeId) {
  const overlay = document.getElementById("place-overlay");
  const heroImg = document.getElementById("placeHeroImg");
  const titleEl = document.getElementById("placeTitle");
  const countryEl = document.getElementById("placeCountry");
  const descEl = document.getElementById("placeDesc");
  const infoGrid = document.getElementById("placeInfoGrid");
  const gallery = document.getElementById("placeGallery");

  // ✅ حفظ موضع الصفحة قبل إظهار الـ overlay
  const scrollY = window.scrollY;
  document.body.dataset.scrollY = scrollY; // نخزّنه مؤقتًا
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflowY = "hidden";

  // ✅ تجهيز overlay للعرض (دائمًا من البداية)
  overlay.scrollTop = 0;

  // اجلب بيانات المكان
  const { data: place, error } = await supabaseClient
    .from("places")
    .select("id, title, city, description, image_url, gallery_urls")
    .eq("id", placeId)
    .single();

  if (error || !place) {
    console.error(error);
    return;
  }

  // تعبئة البيانات
  heroImg.src = place.image_url || "../assets/images/default.png";
  heroImg.alt = place.title || "Place photo";
  titleEl.textContent = place.title || "—";
  countryEl.textContent = place.city ? `${place.city}, Saudi Arabia` : "Saudi Arabia";
  descEl.innerHTML = place.description || "—";

  // بطاقات المعلومات
  infoGrid.innerHTML = "";
  let tagNames = [];
  const { data: placeTags } = await supabaseClient
    .from("place_tags")
    .select("tag_id")
    .eq("place_id", placeId);

  if (placeTags?.length) {
    const ids = placeTags.map(t => t.tag_id);
    const { data: tagsData } = await supabaseClient
      .from("tags")
      .select("id, name")
      .in("id", ids);
    if (tagsData?.length) tagNames = tagsData.map(t => t.name).slice(0, 3);
  }

  const defaultHeads = ["Highlights", "Top Sights", "Good to Know"];
  (tagNames.length ? tagNames : defaultHeads).forEach((h) => {
    const item = document.createElement("div");
    item.className = "place-info-item";
    item.innerHTML = `
      <h4>${escapeHtml(h)}</h4>
      <p>Discover ${escapeHtml(place.title)} through <em>${escapeHtml(h.toLowerCase())}</em> and more.</p>
    `;
    infoGrid.appendChild(item);
  });

  // معرض الصور
  gallery.innerHTML = "";
  const thumbs = (place.gallery_urls && place.gallery_urls.length)
    ? place.gallery_urls.slice(0, 6)
    : (place.image_url ? [place.image_url] : []);

  thumbs.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    img.alt = place.title || "photo";
    img.className = "place-thumb";
    img.addEventListener("click", () => openLightbox(url));
    gallery.appendChild(img);
  });

  // Explore More
  const moreGrid = document.getElementById("placeMoreGrid");
  const moreSection = document.getElementById("placeMore");
  moreGrid.innerHTML = "<p>Loading...</p>";

  const { data: morePlaces, error: moreErr } = await supabaseClient
    .from("places")
    .select("id, title, city, image_url")
    .neq("id", placeId)
    .limit(6);

  if (moreErr) {
    console.error(moreErr);
    moreGrid.innerHTML = "<p>Failed to load more destinations.</p>";
  } else if (!morePlaces?.length) {
    moreSection.style.display = "none";
  } else {
    const random3 = morePlaces.sort(() => 0.5 - Math.random()).slice(0, 3);
    moreGrid.innerHTML = "";
    random3.forEach((p) => {
      const card = document.createElement("div");
      card.className = "place-more-card";
      card.innerHTML = `
        <img src="${p.image_url || "../assets/images/default.png"}" alt="${p.title}" />
        <h4>${p.title}</h4>
      `;
      card.addEventListener("click", () => openPlaceOverlay(p.id));
      moreGrid.appendChild(card);
    });
  }

  // ✅ تأكيد تصفير تمرير overlay بعد تعبئة الصور
  requestAnimationFrame(() => overlay.scrollTo(0, 0));

  // ✅ أظهر الـ overlay بدون اهتزاز أو انتقال الصفحة
  overlay.classList.remove("hidden");
}



function closePlaceOverlay() {
  const overlay = document.getElementById("place-overlay");
  overlay.classList.add("hidden");
  overlay.scrollTop = 0;

  // ✅ أرجع الصفحة لموضعها السابق بالضبط
  const scrollY = parseInt(document.body.dataset.scrollY || "0");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflowY = "";
  window.scrollTo(0, scrollY);
}



document.getElementById("placeCloseBtn").addEventListener("click", closePlaceOverlay);
document.getElementById("placeOverlayBackdrop").addEventListener("click", closePlaceOverlay);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePlaceOverlay();
    closeLightbox();
  }
});

// ===============================
// ✅ Lightbox للصور
// ===============================
function openLightbox(src) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  img.src = src;
  lb.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  const lb = document.getElementById("lightbox");
  lb.classList.add("hidden");
  document.body.style.overflow = "";
}
document.getElementById("lightboxBackdrop").addEventListener("click", closeLightbox);
document.getElementById("lightboxClose").addEventListener("click", closeLightbox);

// ===============================
// ✅ مساعدات
// ===============================
function goToGuideDetails(guideId, placeId) {
  window.location.href = `../guides/guide-details.html?guide_id=${guideId}&place_id=${placeId}`;
}
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"'`=\/]/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;","/":"&#47;","`":"&#96;","=":"&#61;"
  }[s]));
}

// بدء التشغيل
loadPlaces();
