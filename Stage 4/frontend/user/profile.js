console.log("✅ profile.js loaded");

const avatarImg = document.getElementById("avatarImg");
const avatarBtn = document.getElementById("avatarBtn");
const avatarInput = document.getElementById("avatarInput");
const uName = document.getElementById("uName");
const uEmail = document.getElementById("uEmail");

const fullName = document.getElementById("fullName");
const phone = document.getElementById("phone");
const country = document.getElementById("country");
const city = document.getElementById("city");
const bio = document.getElementById("bio");
const form = document.getElementById("profileForm");
const resetBtn = document.getElementById("resetBtn");

// Load current profile
async function loadProfile() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data.user) { console.error(error); return; }
  const user = data.user;

  const meta = user.user_metadata || {};
  uEmail.textContent = user.email;
  uName.textContent = meta.full_name || "Traveler";

  fullName.value = meta.full_name || "";
  phone.value = meta.phone || "";
  country.value = meta.country || "";
  city.value = meta.city || "";
  bio.value = meta.bio || "";

  // Avatar
  const fallback = "/assets/images/default.png";
  const url = meta.avatar_url || fallback;
  avatarImg.src = url;
}
loadProfile();

// Save profile
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    data: {
      full_name: fullName.value.trim(),
      phone: phone.value.trim(),
      country: country.value.trim(),
      city: city.value.trim(),
      bio: bio.value.trim(),
      // keep avatar_url as is (not modified here)
    }
  };
  const { data, error } = await supabaseClient.auth.updateUser(payload);
  if (error) { alert("❌ Failed to save"); console.error(error); return; }
  alert("✅ Saved");
  loadProfile();
});

// Reset
resetBtn.addEventListener("click", () => loadProfile());

// Upload avatar → Supabase Storage bucket: "avatars" (public)
avatarBtn.addEventListener("click", () => avatarInput.click());
avatarInput.addEventListener("change", async () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  const { data: auth } = await supabaseClient.auth.getUser();
  const userId = auth.user.id;
  const path = `public/${userId}-${Date.now()}`; // unique name

  // Upload (create the bucket "avatars" and make it public from Supabase UI once)
  const { error: upErr } = await supabaseClient.storage.from("avatars").upload(path, file, { upsert: true });
  if (upErr) { alert("❌ Upload failed"); console.error(upErr); return; }

  // build public URL
  const { data: pub } = supabaseClient.storage.from("avatars").getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  // Save to user metadata
  const { error: metaErr } = await supabaseClient.auth.updateUser({ data: { avatar_url: publicUrl } });
  if (metaErr) { alert("❌ Failed to set avatar"); console.error(metaErr); return; }

  avatarImg.src = publicUrl;
  alert("✅ Avatar updated!");
});
