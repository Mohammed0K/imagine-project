console.log("✅ guide-details.js loaded");

const BASE_PRICE = 250;
const FEE_RATE  = 0.05;

async function loadPage() {
  const qs = new URLSearchParams(location.search);
  const guideId = qs.get("guide_id");
  const placeId = qs.get("place_id");
  if (!guideId || !placeId) return;

  // Fetch place + guide
  const { data: place } = await supabaseClient.from("places").select("*").eq("id", placeId).single();
  const { data: guide } = await supabaseClient.from("guides").select("*").eq("id", guideId).single();

  // HERO: image + text
   // HERO: image + text
  const hero = document.querySelector(".hero");
  hero.style.backgroundImage = `url("${place?.image_url || "../assets/images/default.png"}")`;
  document.getElementById("placeTitle").textContent = place?.title || "—";
  document.getElementById("placeCity").textContent  = place?.city || "—";


  // Reviews → average rating
  let avg = null, count = 0;
  const { data: revs } = await supabaseClient.from("reviews").select("rating").eq("guide_id", guideId);
  if (revs?.length) {
    count = revs.length;
    avg = (revs.reduce((a,r)=>a+(r.rating||0),0) / count).toFixed(1);
  }

  // GUIDE card
  const langs = Array.isArray(guide?.languages) ? guide.languages : [];
  document.getElementById("guideCard").innerHTML = `
    <img class="guide__avatar" src="${guide?.avatar_url || "../assets/images/default.png"}" alt="${guide?.full_name||"Guide"}"/>
    <div class="guide__meta">
      <h3>Your Tour Guide</h3>
      <div class="row">
        <span style="font-weight:600">${guide?.full_name || "—"}</span>
        <span>⭐ ${avg ? avg : "—"}</span>
        <span>${count ? `${count} reviews` : ""}</span>
      </div>
      <p class="guide__bio">${guide?.city ? `Based in ${guide.city}` : ""}</p>
      <p class="guide__bio">${langs.length ? `Languages: ${langs.join(", ")}` : ""}</p>
    </div>
  `;

  // Languages -> select
  const langSel = document.getElementById("languageSelect");
  langSel.innerHTML = `<option value="">Select language</option>`;
  langs.forEach(l=>{
    const opt = document.createElement("option");
    opt.value = l; opt.textContent = l;
    langSel.appendChild(opt);
  });

  // date min = tomorrow
  const d = new Date(); d.setDate(d.getDate()+1);
  document.getElementById("dateInput").min = d.toISOString().split("T")[0];

  // initial price
  updatePrice();
}

function updatePrice(){
  const guests = parseInt(document.getElementById("guestsInput").value || "1", 10);
  const base   = BASE_PRICE * guests;
  const fee    = base * FEE_RATE;
  const total  = base + fee;

  document.getElementById("ppg").textContent        = `SAR ${BASE_PRICE}`;
  document.getElementById("guestsLabel").textContent= `${guests} ${guests>1?"guests":"guest"}`;
  document.getElementById("baseTotal").textContent  = `SAR ${base.toFixed(2)}`;
  document.getElementById("fee").textContent        = `SAR ${fee.toFixed(2)}`;
  document.getElementById("grand").textContent      = `SAR ${total.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPage();

  document.getElementById("guestsInput").addEventListener("change", updatePrice);

  document.getElementById("bookingForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const btn = document.getElementById("bookBtn");

  // ✅ Show loader
  btn.disabled = true;
  showLoader(true);

  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth?.user){
    showLoader(false);
    btn.disabled = false;
    return location.href = "../login/login.html";
  }

  const qs = new URLSearchParams(location.search);
  const payload = {
    customer_id: auth.user.id,
    guide_id: qs.get("guide_id"),
    place_id: qs.get("place_id"),
    start_at: `${document.getElementById("dateInput").value}T${document.getElementById("timeSlot").value}`,
    num_guests: parseInt(document.getElementById("guestsInput").value||"1",10),
    status: "pending",
    admin_note:
      `Language: ${document.getElementById("languageSelect").value || "-"}\n`+
      `Notes: ${document.getElementById("noteInput").value || "-"}`,
  };

  const { error } = await supabaseClient.from("bookings").insert([payload]);
  if (error){
    console.error(error);
    showLoader(false);   // ❌ إخفاء اللودينق عند الفشل
    btn.disabled = false;
    btn.textContent = "Confirm Booking";
    return;
  }

  showLoader(false);     // ✅ إخفاء اللودينق عند النجاح
  btn.disabled = false;
  btn.textContent = "Confirm Booking";

  showToast("✅ Booking Confirmed!", "success");
  setTimeout(() => window.location.href = "../user/my-bookings.html", 1200);
});




});
