// ===== بيانات مؤقتة =====
const guides = [
  {
    name: "Abdullah Al-Qahtani",
    region: "Riyadh",
    languages: ["Arabic", "English"],
    rating: 4.8,
    reviews: 34,
    bio: "Certified tour guide specializing in Riyadh’s historical landmarks and Najdi architecture.",
    image: "assets/guide1.jpg"
  },
  {
    name: "Sarah Al-Fahad",
    region: "AlUla",
    languages: ["Arabic", "French", "English"],
    rating: 3.9,
    reviews: 41,
    bio: "Experienced local guide passionate about AlUla’s heritage and desert adventures.",
    image: "assets/guide2.jpg"
  },
  {
    name: "Mohammed Al-Harbi",
    region: "Jeddah",
    languages: ["Arabic", "English"],
    rating: 4.7,
    reviews: 28,
    bio: "Specializes in Red Sea coastal tours and Jeddah’s old town cultural experience.",
    image: "assets/guide3.jpg"
  },
  {
    name: "Khaled Al-Mutairi",
    region: "Taif",
    languages: ["Arabic", "English"],
    rating: 4.1,
    reviews: 19,
    bio: "Nature lover offering Taif mountain and rose valley tours.",
    image: "assets/guide4.jpg"
  },
  {
    name: "Sami Al-Fahad",
    region: "AlUla",
    languages: ["Arabic", "French", "English"],
    rating: 5,
    reviews: 41,
    bio: "Experienced local guide passionate about AlUla’s heritage and desert adventures.",
    image: "assets/guide6.jpg"
  },
  {
    name: "Nasser Alqahtani",
    region: "Jeddah",
    languages: ["Arabic", "English"],
    rating: 4.4,
    reviews: 28,
    bio: "Specializes in Red Sea coastal tours and Jeddah’s old town cultural experience.",
    image: "assets/guide6.jpg"
  },
  {
    name: "Omar",
    region: "Taif",
    languages: ["Arabic", "English"],
    rating: 4,
    reviews: 19,
    bio: "Nature lover offering Taif mountain and rose valley tours.",
    image: "assets/guide7.jpg"
  }
];

// ===== توليد الكروت =====
const container = document.getElementById("guidesGrid");

guides.forEach((g) => {
  const card = document.createElement("div");
  card.className = "guide-card";
  card.innerHTML = `
    <img src="${g.image}" alt="${g.name}" />
    <h3>${g.name}</h3>
    <div class="region">${g.region}</div>
    <div class="languages">Languages: ${g.languages.join(", ")}</div>
    <div class="rating">⭐ ${g.rating.toFixed(1)}</div>
    <p>${g.bio}</p>
    <div class="reviews">${g.reviews} Reviews</div>
  `;
  container.appendChild(card);
});
