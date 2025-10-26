console.log("✅ My Bookings JS Loaded");

const bookingsList  = document.getElementById("bookingsList");
const reviewModal   = document.getElementById("reviewModal");
const tableWrapper  = document.getElementById("tableWrapper");
const emptyState    = document.getElementById("emptyState");

let selectedBookingId = null;

// ✅ تحميل الحجوزات
async function loadBookings() {
  try {
    // حالة تحميل بسيطة
    bookingsList.innerHTML = `
      <tr><td colspan="4" style="padding:12px">Loading...</td></tr>
    `;

    // جلسة المستخدم
    const { data: authData, error: authErr } = await supabaseClient.auth.getUser();
    if (authErr || !authData?.user) {
      // غير مسجل → رجوع لتسجيل الدخول
      window.location.href = "../login/login.html";
      return;
    }
    const user = authData.user;

    // تعبئة معلومات الشريط الجانبي
    document.getElementById("sbName").textContent =
      user.user_metadata?.full_name || "Traveler";
    document.getElementById("sbEmail").textContent = user.email || "—";
    document.getElementById("avatarSmall").src =
      user.user_metadata?.avatar_url || "../assets/images/default.png";

    // جلب الحجوزات
    const { data, error } = await supabaseClient
      .from("bookings")
      .select(`
        id,
        status,
        start_at,
        guides (full_name)
      `)
      .eq("customer_id", user.id)
      .order("start_at", { ascending: false });

    if (error) {
      console.error("❌ Load bookings error:", error);
      bookingsList.innerHTML = `
        <tr><td colspan="4" style="padding:12px;color:#c00">Error loading bookings.</td></tr>
      `;
      return;
    }

    // تفريع المخرجات
    bookingsList.innerHTML = "";

    // لا توجد بيانات → أظهر Empty State
    if (!data || data.length === 0) {
      tableWrapper.style.display = "none";
      emptyState.hidden = false;
      return;
    } else {
      tableWrapper.style.display = "block";
      emptyState.hidden = true;
    }

    // بناء الصفوف
    for (const booking of data) {
      // تحقق إن كان فيه تقييم سابق
      const { count } = await supabaseClient
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", booking.id);

      const hasReview = (count || 0) > 0;
      const canReview = booking.status === "completed" && !hasReview;

      const statusClass =
        booking.status === "completed" ? "ok" :
        booking.status === "pending"   ? "pending" : "cancel";

      bookingsList.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td>${booking.guides?.full_name ?? "Unknown"}</td>
          <td>${new Date(booking.start_at).toLocaleDateString()}</td>
          <td><span class="badge ${statusClass}">${booking.status}</span></td>
          <td>
            ${
              canReview
                ? `<button class="btn btn-primary" onclick="openReview('${booking.id}')">Review</button>`
                : `<button class="btn btn-secondary" disabled>—</button>`
            }
            ${
              booking.status === "pending"
                ? `<button class="btn btn-ghost" onclick="cancelBooking('${booking.id}')">Cancel</button>`
                : ""
            }
          </td>
        </tr>
        `
      );
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    bookingsList.innerHTML =
      `<tr><td colspan="4" style="padding:12px;color:#c00">Something went wrong.</td></tr>`;
  }
}

// ✅ نوافذ التقييم
function openReview(id) {
  selectedBookingId = id;
  reviewModal.classList.add("show");
}
function closeModal() {
  reviewModal.classList.remove("show");
}

// ✅ حفظ التقييم
document.getElementById("saveReviewBtn").addEventListener("click", async () => {
  try {
    const rating  = Number(document.getElementById("rating").value);
    const comment = document.getElementById("comment").value.trim();

    const { error } = await supabaseClient.from("reviews").insert([
      { booking_id: selectedBookingId, rating, comment }
    ]);
    if (error) throw error;

    alert("✅ Review added!");
    closeModal();
    loadBookings();
  } catch (e) {
    console.error(e);
    alert("❌ Failed to add review");
  }
});

// ✅ إلغاء الحجز
async function cancelBooking(id) {
  if (!confirm("Cancel this booking?")) return;
  try {
    const { error } = await supabaseClient
      .from("bookings")
      .update({ status: "canceled" })
      .eq("id", id);
    if (error) throw error;

    alert("✅ Booking canceled");
    loadBookings();
  } catch (e) {
    console.error(e);
    alert("❌ Failed to cancel");
  }
}

// ✅ بدء التحميل
loadBookings();
