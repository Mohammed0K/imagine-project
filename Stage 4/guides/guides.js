// ✅ Fetch approved guides from Supabase and render cards
(async function () {
  const grid = document.getElementById("guidesGrid");

  const { data, error } = await supabaseClient
    .from("guides")
    .select("id, full_name, city, languages, rating, avatar_url, receiving_requests, status")
    .eq("status", "approved");

  if (error) {
    grid.innerHTML = `<p class="error">Failed to load guides.</p>`;
    console.error(error);
    return;
  }

  if (!data.length) {
    grid.innerHTML = `<p class="empty">No guides available yet.</p>`;
    return;
  }

  data.forEach(g => {
    const card = document.createElement("div");
    card.className = "guide-card";
    const langs = Array.isArray(g.languages) ? g.languages.join(", ") : (g.languages || "");
    const rating = g.rating ? Number(g.rating).toFixed(1) : "—";
    const img = g.avatar_url || "assets/guide1.jpg";

    card.innerHTML = `
      <img src="${img}" alt="${g.full_name || "Guide"}" />
      <h3>${g.full_name || "Guide"}</h3>
      <div class="region">${g.city || ""}</div>
      <div class="languages">Languages: ${langs}</div>
      <div class="rating">⭐ ${rating}</div>
      ${g.receiving_requests ? "" : `<div class="badge-off">Not accepting requests</div>`}
      <div class="actions">
        <a class="btn-primary" href="../guides/guide-details.html?id=${g.id}">
          View Details
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
})();
