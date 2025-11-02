console.log("✅ profile.js loaded");

const avatarImg = document.getElementById("avatarImg");
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

// Popup elements
const avatarModal = document.getElementById("avatarModal");
const uploadNewBtn = document.getElementById("uploadNewBtn");
const removeAvatarBtn = document.getElementById("removeAvatarBtn");
const closeAvatarModal = document.getElementById("closeAvatarModal");

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

  const fallback = "../assets/images/default.png";
  avatarImg.src = meta.avatar_url || fallback;
}
loadProfile();

// Save profile info
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    data: {
      full_name: fullName.value.trim(),
      phone: phone.value.trim(),
      country: country.value.trim(),
      city: city.value.trim(),
      bio: bio.value.trim(),
    },
  };
  const { error } = await supabaseClient.auth.updateUser(payload);
  if (error) return showToast("❌ Failed to save", "error");
  showToast("✅ Saved successfully", "success");
  loadProfile();
});

// Reset
resetBtn.addEventListener("click", () => loadProfile());

// ✅ Avatar Modal Logic
avatarImg.addEventListener("click", () => {
  avatarModal.classList.add("show");
});

closeAvatarModal.addEventListener("click", () => {
  avatarModal.classList.remove("show");
});

// Upload new photo
uploadNewBtn.addEventListener("click", () => {
  avatarInput.click();
});

avatarInput.addEventListener("change", async () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  const { data: auth } = await supabaseClient.auth.getUser();
  const userId = auth.user.id;
  const path = `public/${userId}-${Date.now()}`;

  showLoader(true); // يبدأ التحميل

  const { error: upErr } = await supabaseClient.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
    showLoader(false); // يخفي التحميل بعد الانتهاء

  if (upErr) {
    showToast("❌ Upload failed", "error");
    console.error(upErr);
    return;
  }

  const { data: pub } = supabaseClient.storage.from("avatars").getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { error: metaErr } = await supabaseClient.auth.updateUser({ data: { avatar_url: publicUrl } });
  if (metaErr) {
    showToast("❌ Failed to save avatar", "error");
    console.error(metaErr);
    return;
  }

  avatarImg.src = publicUrl;
  avatarModal.classList.remove("show");
  showToast("✅ Avatar updated successfully", "success");
});

// Remove avatar
removeAvatarBtn.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.updateUser({ data: { avatar_url: null } });
  if (error) {
    showToast("❌ Failed to remove avatar", "error");
    return;
  }
  avatarImg.src = "../assets/images/default.png";
  avatarModal.classList.remove("show");
  showToast("✅ Avatar removed", "success");
});
