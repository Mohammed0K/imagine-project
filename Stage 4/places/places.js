document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("places-container");
  container.innerHTML = "Loading...";

  const { data, error } = await supabaseClient
    .from("places")
    .select("title, city, description, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = `<p class="text-red-600">Error loading places.</p>`;
    console.error(error);
    return;
  }

  if (!data.length) {
    container.innerHTML = `<p>No places found.</p>`;
    return;
  }

  container.innerHTML = "";
  data.forEach((place) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${place.image_url}" alt="${place.title}">
      <div class="card-content">
        <h3>${place.title}</h3>
        <small>${place.city}</small>
        <p>${place.description}</p>
      </div>
    `;
    container.appendChild(card);
  });
});
