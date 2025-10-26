console.log("✅ guide-details.js loaded");

async function loadGuideDetails() {
  const params = new URLSearchParams(window.location.search);
  const guideId = params.get("guide_id");
  const placeId = params.get("place_id");

  if (!guideId || !placeId) {
    document.body.innerHTML = "<p>Invalid guide or place.</p>";
    return;
  }

  const { data: guide, error: guideErr } = await supabaseClient
    .from("guides")
    .select("*")
    .eq("id", guideId)
    .single();

  const { data: place, error: placeErr } = await supabaseClient
    .from("places")
    .select("*")
    .eq("id", placeId)
    .single();

  if (guideErr || placeErr) {
    console.error("❌ Failed to load guide/place data");
    return;
  }

  // Guide Info
  const guideInfo = document.getElementById("guide-info");
  guideInfo.innerHTML = `
    <img src="${guide.avatar_url || '../assets/images/default.png'}" alt="${guide.full_name}" class="guide-avatar"/>
    <div class="guide-details">
      <h2>${guide.full_name}</h2>
      <p><strong>Age:</strong> ${guide.age || "—"}</p>
      <p><strong>Languages:</strong> ${guide.languages?.join(", ") || "—"}</p>
      <p><strong>Bio:</strong> ${guide.bio || "—"}</p>
      <p><strong>Rating:</strong> ⭐ ${guide.rating ? guide.rating.toFixed(1) : "—"}</p>
    </div>
  `;

  // Place Info
  const placeInfo = document.getElementById("place-info");
  placeInfo.innerHTML = `
    <img src="${place.image_url || '../assets/images/default.png'}" alt="${place.title}" class="place-image"/>
    <div class="place-details">
      <h2>${place.title}</h2>
      <p><strong>City:</strong> ${place.city || "—"}</p>
      <p>${place.description || ""}</p>
    </div>
  `;

  // Set Min Date = Tomorrow
  const dateInput = document.getElementById("startDate");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  dateInput.min = minDate;

  // Handle Booking
  const bookingForm = document.getElementById("bookingForm");
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bookBtn = document.getElementById("bookBtn");
    bookBtn.disabled = true;
    bookBtn.innerHTML = `<i class="fa fa-spinner fa-spin mr-2"></i> Sending...`;

    const { data: auth } = await supabaseClient.auth.getUser();
    
    if (!auth.user) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `../login/login.html?next=${currentUrl}`;
      return;
    }




    const numGuests = parseInt(document.getElementById("numGuests").value);
    const startDate = document.getElementById("startDate").value;

    if (!startDate) {
      alert("Please select a valid date.");
      bookBtn.disabled = false;
      bookBtn.textContent = "Book Now";
      return;
    }

    const { error } = await supabaseClient.from("bookings").insert([
      {
        customer_id: auth.user.id,
        guide_id: guideId,
        place_id: placeId,
        start_at: startDate,
        num_guests: numGuests,
        status: "pending",
      },
    ]);

    if (error) {
      alert("❌ Booking failed.");
      console.error(error);
      bookBtn.disabled = false;
      bookBtn.textContent = "Book Now";
      return;
    }

    // Show confirmation modal
    const modal = document.getElementById("successModal");
    modal.classList.add("active");

    // Reset form and button
    bookBtn.disabled = false;
    bookBtn.textContent = "Book Now";
  });

  // Modal navigation
  document.getElementById("goToBookingsBtn").addEventListener("click", () => {
    window.location.href = "../user/my-bookings.html";
  });
}

loadGuideDetails();
