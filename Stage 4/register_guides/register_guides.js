// register_guides.js
console.log("✅ register_guides.js LOADED");

document.getElementById("guideForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const age = document.getElementById("age").value;
  const licenseNumber = document.getElementById("license_number").value;
  const licenseFile = document.getElementById("license_file").files[0];

  // ✅ التحقق من الإدخالات
  if (!name || !email || !password || !age || !licenseNumber) {
    alert("❌ الرجاء ملء جميع الحقول المطلوبة");
    return;
  }

  if (!licenseFile) {
    alert("❌ الرجاء رفع ملف الرخصة");
    return;
  } else if (isNaN(age) || age < 18) {
    alert("❌ العمر غير صالح — يجب أن يكون 18 أو أكثر");
    return;
  }

  // ✅ 1) إنشاء حساب جديد في Supabase Auth
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name,
        age: age,
        role: "pending_guide",
      },
    },
  });

  // ✅ التعامل مع أخطاء التسجيل
  if (error) {
    if (error.message.includes("already registered")) {
      alert("⚠️ هذا البريد مسجّل مسبقًا. الرجاء تسجيل الدخول بدلًا من التسجيل.");
      window.location.href = "../login_guides/login_guides.html";
      return;
    }
    alert("❌ خطأ أثناء التسجيل: " + error.message);
    return;
  }

  const user = data.user;
  const guideId = user.id;

  alert("✅ تم إنشاء الحساب! جاري رفع ملف الرخصة...");

  // ✅ تنظيف اسم ملف الرخصة
  const cleanedFileName = licenseFile.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-");

  // ✅ 2) رفع ملف الرخصة إلى Storage داخل bucket guides
  const path = `licenses/${guideId}_${Date.now()}_${cleanedFileName}`;
  const { error: uploadErr } = await supabaseClient.storage
    .from("guides")
    .upload(path, licenseFile);

  if (uploadErr) {
    alert("❌ رفع الرخصة فشل: " + uploadErr.message);
    return;
  }

  const { data: fileData } = supabaseClient.storage
    .from("guides")
    .getPublicUrl(path);
  const licenseUrl = fileData.publicUrl;

  // ✅ 3) إضافة سجل المرشد في جدول guides
  const { error: insertErr } = await supabaseClient.from("guides").insert({
    id: guideId,
    age: age,
    license_number: licenseNumber,
    license_url: licenseUrl,
    status: "pending", // بانتظار موافقة الأدمن
  });

  if (insertErr) {
    alert("❌ تخزين بيانات المرشد فشل: " + insertErr.message);
    return;
  }

  // ✅ 3.5) إضافة سجل في جدول profiles للمرشد الجديد
  const { error: profileErr } = await supabaseClient.from("profiles").insert({
    id: guideId,
    full_name: name,
    role: "guide", // مؤقتًا كـ guide، ويتغير من الأدمن عند الرفض أو القبول
    avatar_url: null,
  });

  if (profileErr) {
    console.error("❌ فشل إدخال الملف الشخصي:", profileErr.message);
  }

  // ✅ إشعار المستخدم
  alert(
    "✅ تم إرسال طلبك بنجاح! سيتم مراجعة بياناتك من قبل الإدارة، وسيتم إشعارك عند الموافقة."
  );

  // ✅ 4) تحويل لصفحة انتظار الموافقة
  window.location.href = "../guides/pending.html";
});
