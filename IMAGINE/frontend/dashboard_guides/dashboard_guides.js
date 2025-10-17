// ===== إعدادات عامة =====
const API_BASE = "http://127.0.0.1:8000/api"; // غيّرها حسب الـ backend

// ===== عناصر DOM =====
const sectionTitle = document.getElementById("section-title");
const sections = document.querySelectorAll("main section");
const sideButtons = document.querySelectorAll(".side-btn");

// ===== التنقل بين الأقسام =====
sideButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    sideButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    sections.forEach((sec) => sec.classList.add("hidden"));
    const target = btn.getAttribute("data-target");
    document.getElementById(target).classList.remove("hidden");

    sectionTitle.textContent = btn.textContent.trim();

    // استدعاء القسم المناسب
    if (target === "section-guides") loadGuides();
    if (target === "section-places") loadPlaces();
    if (target === "section-bookings") loadBookings();
    if (target === "section-reviews") loadReviews();
  });
});

// ====== 1. تحميل المرشدين ======
async function loadGuides() {
  const section = document.getElementById("section-guides");
  section.innerHTML = "<p class='text-gray-500'>Loading guides...</p>";
  try {
    const res = await fetch(`${API_BASE}/guides/`);
    const data = await res.json();

    if (!data.length) {
      section.innerHTML = "<p class='text-gray-500'>No guides found.</p>";
      return;
    }

    let html = `
      <table class="w-full bg-white rounded-2xl border border-gray-100 text-left">
        <thead class="bg-[#f3f0e6] text-gray-700">
          <tr>
            <th class="py-3 px-5">Name</th>
            <th class="py-3 px-5">Region</th>
            <th class="py-3 px-5">Languages</th>
            <th class="py-3 px-5">Rating</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach((g) => {
      html += `
        <tr class="border-t">
          <td class="py-3 px-5 font-semibold">${g.name}</td>
          <td class="py-3 px-5">${g.region}</td>
          <td class="py-3 px-5">${g.languages?.join(", ") || "-"}</td>
          <td class="py-3 px-5">${g.rating ?? "—"}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    section.innerHTML = html;
  } catch (err) {
    section.innerHTML = `<p class='text-red-600'>Error loading guides: ${err.message}</p>`;
  }
}

// ====== 2. تحميل الأماكن ======
async function loadPlaces() {
  const section = document.getElementById("section-places");
  section.innerHTML = "<p class='text-gray-500'>Loading places...</p>";
  try {
    const res = await fetch(`${API_BASE}/places/`);
    const data = await res.json();
    if (!data.length) {
      section.innerHTML = "<p class='text-gray-500'>No places found.</p>";
      return;
    }

    let html = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">`;
    data.forEach((p) => {
      html += `
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <h3 class="text-[#556b2f] font-semibold">${p.name}</h3>
          <p class="text-sm text-gray-600">${p.city}</p>
          <p class="text-sm text-gray-500 mt-2">${p.description?.slice(0, 80) || ""}</p>
        </div>
      `;
    });
    html += "</div>";
    section.innerHTML = html;
  } catch (err) {
    section.innerHTML = `<p class='text-red-600'>Error loading places.</p>`;
  }
}

// ====== 3. تحميل الحجوزات ======
async function loadBookings() {
  const section = document.getElementById("section-bookings");
  section.innerHTML = "<p class='text-gray-500'>Loading bookings...</p>";
  try {
    const res = await fetch(`${API_BASE}/bookings/`);
    const data = await res.json();

    let html = `
      <table class="w-full bg-white rounded-2xl border border-gray-100 text-left">
        <thead class="bg-[#f3f0e6] text-gray-700">
          <tr>
            <th class="py-3 px-5">User</th>
            <th class="py-3 px-5">Guide</th>
            <th class="py-3 px-5">Place</th>
            <th class="py-3 px-5">Date</th>
          </tr>
        </thead><tbody>
    `;

    data.forEach((b) => {
      html += `
        <tr class="border-t">
          <td class="py-3 px-5">${b.user_name}</td>
          <td class="py-3 px-5">${b.guide_name}</td>
          <td class="py-3 px-5">${b.place_name}</td>
          <td class="py-3 px-5">${b.date}</td>
        </tr>`;
    });

    html += "</tbody></table>";
    section.innerHTML = html;
  } catch {
    section.innerHTML = "<p class='text-red-600'>Error loading bookings.</p>";
  }
}

// ====== 4. تحميل المراجعات ======
async function loadReviews() {
  const section = document.getElementById("section-reviews");
  section.innerHTML = "<p class='text-gray-500'>Loading reviews...</p>";
  try {
    const res = await fetch(`${API_BASE}/reviews/`);
    const data = await res.json();

    let html = `<div class="space-y-4">`;
    data.forEach((r) => {
      html += `
        <div class="bg-white border rounded-2xl p-4 shadow-sm">
          <p class="font-semibold text-[#556b2f]">${r.user}</p>
          <p class="text-sm text-gray-500">${r.comment}</p>
          <p class="text-yellow-600 mt-1">Rating: ${r.rating}⭐</p>
        </div>`;
    });
    html += "</div>";
    section.innerHTML = html;
  } catch {
    section.innerHTML = "<p class='text-red-600'>Error loading reviews.</p>";
  }
}
