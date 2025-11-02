// ✅ register_guides.js (final fixed version)
console.log("✅ register_guides.js LOADED");

document.getElementById("guideForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const age = document.getElementById("age").value;
  const licenseNumber = document.getElementById("license_number").value.trim();
  const licenseFile = document.getElementById("license_file").files[0];

  // 🧩 التحقق من الإدخالات
  if (!name || !email || !password || !age || !licenseNumber) {
    showToast("❌ Please fill in all required fields.", "error");
    return;
  }
  if (!licenseFile) return showToast("❌ Please upload the license file.", "error");
  if (isNaN(age) || age < 18) return showToast("❌ Must be 18 years of age or older.", "error");

  // 🟢 1) إنشاء حساب جديد في Supabase Auth
  const { data: signupData, error: signupErr } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: "pending_guide",
      },
    },
  });

  if (signupErr) {
    if (signupErr.message.includes("already registered")) {
      showToast("⚠️ This email address is already registered. Please log in instead of registering.", "error");
      window.location.href = "../login_guides/login_guides.html";
      return;
    }
    showToast("❌ Error during recording: " + signupErr.message , "error");
    return;
  }

  const user = signupData.user;
  const guideId = user.id;

  showToast("✅ Operation completed successfully", "success");

  // 🟢 2) رفع ملف الرخصة إلى Storage (bucket: guides)
  const cleanedFileName = licenseFile.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-");

  const path = `licenses/${guideId}_${Date.now()}_${cleanedFileName}`;
  const { error: uploadErr } = await supabaseClient.storage
    .from("guides")
    .upload(path, licenseFile);

  if (uploadErr) {
    showToast("❌ License upload failed: " + uploadErr.message, "error");
    return;
  }

  const { data: fileData } = supabaseClient.storage
    .from("guides")
    .getPublicUrl(path);
  const licenseUrl = fileData.publicUrl;

  // 🟢 3) إدخال سجل المرشد في جدول guides
  const { error: insertErr } = await supabaseClient.from("guides").insert([
    {
      id: guideId,
      full_name: name,
      age,
      license_number: licenseNumber,
      license_url: licenseUrl,
      status: "pending",
      receiving_requests: false,
    },
  ]);

  if (insertErr) {
    showToast("❌ Failed to insert guide data: " + insertErr.message, "error");
    return;
  }

  

  // 🟢 5) تحديث بيانات metadata في Auth
  const { error: metaErr } = await supabaseClient.auth.updateUser({
    data: {
      full_name: name,
      role: "pending_guide",
    },
  });
  if (metaErr) console.warn("⚠️ تحديث metadata فشل:", metaErr.message);

  // 🟢 إشعار المستخدم
  showToast("✅ Operation completed successfully", "success");
  window.location.href = "../guides/pending.html";
});
