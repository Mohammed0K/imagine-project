console.log("✅ Guide Details Updated");

const params = new URLSearchParams(window.location.search);
const guideId = params.get("id");

async function loadGuide() {
  const { data: guide, error } = await supabaseClient
    .from("guides")
    .select("*")
    .eq("id", guideId)
    .single();

  document.getElementById("guideName").textContent = guide.full_name;
  document.getElementById("guideBio").textContent = guide.bio || "";
  document.getElementById("guideCity").textContent = guide.city;
  document.getElementById("guideImage").src =
    guide.avatar_url || "/assets/images/default.png";

  if (!guide.receiving_requests) {
    document.getElementById("bookNowBtn").remove();
    document.getElementById("guideSection").innerHTML +=
      `<p class="text-red-600 mt-2">Guide not accepting requests.</p>`;
  }
}
loadGuide();

// ✅ book request
document.getElementById("bookNowBtn")?.addEventListener("click", async () => {
  const { data: auth } = await supabaseClient.auth.getUser();
  if (!auth.user) return alert("Please login first");

  const date = document.getElementById("bookDate").value;
  if (!date) return alert("Select booking date");

  const { error } = await supabaseClient.from("bookings").insert([
    {
      customer_id: auth.user.id,
      guide_id: guideId,
      start_at: date,
      status: "pending"
    }
  ]);

  if (error) return alert("❌ Booking failed");
  alert("✅ Sent to guide for approval");
  window.location.href = "/user/my-bookings.html";
});
