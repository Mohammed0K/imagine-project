document.addEventListener("DOMContentLoaded", () => {
  const places = [
    {
      name: "Diriyah",
      region: "Riyadh",
      description: "The birthplace of the Saudi Kingdom, rich with heritage and architecture",
      image: "assets/diriyah.jpg"
    },
    {
      name: "AlUla",
      region: "Madinah",
      description: "Ancient tombs and sandstone mountains form one of the most iconic Saudi destinations",
      image: "assets/alula.jpg"
    },
    {
      name: "Rijal Almaa",
      region: "Asir",
      description: "Embark on a timeless journey to Rijal Heritage Village, a gem just 45 km from Abha. This stunning village",
      image: "assets/asir.jpg"
    },
    {
      name: "Jeddah Corniche",
      region: "Makkah",
      description: "Modern city by the Red Sea with art, food, and beautiful seaside views",
      image: "assets/Jeddah Corniche.jpg"
    },
    {
      name: "Al Hamda Waterfall",
      region: "Al Baha",
      description: "Outdoors Al Hamda Waterfall is one of the most beautiful natural waterfalls in Al Baha",
      image: "assets/al-hamda-waterfall.jpg"
    },
    {
      name: "Nafud Al-Thuwairat",
      region: "Az Zulfi",
      description: "Nafud Al-Thuwairat is an extensive desert dune field bordering the city of Al Zulfi in the Riyadh Region",
      image: "assets/Al-Thuwairat.jpg"
    },
    {
      name: "red-see",
      region: "Jeddah",
      description: "The Marine Cave of the Red Sea is one of the most stunning and rare underwater formations along Saudi Arabia",
      image: "assets/red-see.jpg"
    },
    {
      name: "KAFD",
      region: "Riyadh",
      description: "KAFD is an iconic business and lifestyle destination with state-of-the-art physical and digital infrastructure",
      image: "assets/kafd.jpeg"
    },
    {
      name: "Al Asfar Lake",
      region: "Al Ahsa",
      description: "Tucked among the golden dunes of Al Ahsa, Al Asfar Lake is one of the largest natural water bodies in the Gulf",
      image: "assets/Al-Asfar-Lake.jpg"
    },
    {
      name: "Maqsourat Al-Suwailim",
      region: "Qassim",
      description: "Maqsourat Al-Swailim is one of the most iconic heritage landmarks, blending the charm of the past with modern refinement",
      image: "assets/maqsourat-al-sewailim.jpg"
    }
  ];

  const container = document.getElementById("places-container");

  places.forEach(place => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${place.image}" alt="${place.name}">
      <div class="card-content">
        <h3>${place.name}</h3>
        <small>${place.region}</small>
        <p>${place.description}</p>
        <button class="btn">View Details</button>
      </div>
    `;
    container.appendChild(card);
  });
});
