console.log("✅ My Bookings JS Loaded");

const bookingsList  = document.getElementById("bookingsList");
const reviewModal   = document.getElementById("reviewModal");
const tableWrapper  = document.getElementById("tableWrapper");
const emptyState    = document.getElementById("emptyState");

let selectedBookingId = null;
let selectedGuideId = null;

// ✅ تحميل الحجوزات
async function loadBookings() {
  try {
    bookingsList.innerHTML = `<tr><td colspan="5" style="padding:12px">Loading...</td></tr>`;

    // جلسة المستخدم
    const { data: authData, error: authErr } = await supabaseClient.auth.getUser();
    if (authErr || !authData?.user) {
      window.location.href = "../login/login.html";
      return;
    }
    const user = authData.user;

    // تعبئة الشريط الجانبي
    document.getElementById("sbName").textContent =
      user.user_metadata?.full_name || "Traveler";
    document.getElementById("sbEmail").textContent = user.email || "—";
    document.getElementById("avatarSmall").src =
      user.user_metadata?.avatar_url || "../assets/images/default.png";

    // ✅ جلب الحجوزات من Supabase مرتبة من الأحدث إلى الأقدم
    const { data: bookings, error } = await supabaseClient
      .from("bookings")
      .select(`
        id,
        status,
        start_at,
        created_at,
        guide_id,
        guides(full_name, phone),
        places(title)
      `)
      .eq("customer_id", user.id)
      .order("start_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    bookingsList.innerHTML = "";

    // لا توجد بيانات
    if (!bookings?.length) {
      tableWrapper.style.display = "none";
      emptyState.hidden = false;
      return;
    }

    tableWrapper.style.display = "block";
    emptyState.hidden = true;

    // ✅ اجلب إيميلات المرشدين
    const guideIds = [...new Set(bookings.map(b => b.guide_id).filter(Boolean))];
    let emailByGuideId = {};
    if (guideIds.length) {
      const { data: guideProfiles } = await supabaseClient
        .from("profiles_view")
        .select("id, email")
        .in("id", guideIds);
      guideProfiles?.forEach(p => emailByGuideId[p.id] = p.email);
    }

    // ✅ بناء الصفوف
    for (const booking of bookings) {
      // تحقق من وجود تقييم سابق
      const { count } = await supabaseClient
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", booking.id);

      const hasReview = (count || 0) > 0;
      const canReview = booking.status?.toLowerCase() === "completed" && !hasReview;

      const statusText = (booking.status || "").toLowerCase();
      const statusMap = {
        pending: "pending",
        approved: "approved",
        canceled: "canceled",
        cancel: "cancel",
        pause: "pause",
        paused: "paused",
        reject: "reject",
        rejected: "rejected",
        completed: "completed",
        complete: "complete",
      };
      const statusClass = statusMap[statusText] || "neutral";

      const guideName  = booking.guides?.full_name ?? "Unknown Guide";
      const guidePhone = booking.guides?.phone || "—";
      const guideEmail = emailByGuideId[booking.guide_id] || "—";
      const placeTitle = booking.places?.title || "—";

      // ✅ صندوق التواصل تحت اسم المرشد
      const showContact = ["approved", "completed"].includes(statusText);
      const contactHTML = showContact ? `
        <div class="contact-row">
          <a href="mailto:${guideEmail}" title="Email"><i class="fa-regular fa-envelope"></i> ${guideEmail}</a>
          <a href="tel:${guidePhone}" title="Call"><i class="fa-solid fa-phone"></i> ${guidePhone}</a>
          <a target="_blank"
             href="https://wa.me/${guidePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
               `Hi ${guideName}, this is my booking on IMAGINE.`)}"
             title="WhatsApp"><i class="fa-brands fa-whatsapp"></i> Chat</a>
        </div>` : "";

      // ✅ بناء صف الجدول
      bookingsList.insertAdjacentHTML("beforeend", `
        <tr>
          <td>
            <strong>${guideName}</strong>
            ${contactHTML}
          </td>
          <td><span class="place-chip">${placeTitle}</span></td>
          <td>${new Date(booking.start_at || booking.created_at).toLocaleDateString()}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
          <td>
            ${
              canReview
                ? `<button class="btn btn-primary review-btn"
                    data-id="${booking.id}"
                    data-guide="${booking.guide_id}">Review</button>`
                : `<button class="btn btn-secondary" disabled>—</button>`
            }
            ${
              statusText === "pending"
                ? `<button class="btn btn-ghost" onclick="cancelBooking('${booking.id}')">Cancel</button>`
                : ""
            }
          </td>
        </tr>
      `);
    }

    // ✅ تفعيل زر Review وربطه بالـmodal
    document.querySelectorAll(".review-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        openReview(btn.dataset.id, btn.dataset.guide);
      });
    });

  } catch (err) {
    console.error("❌ Load Error:", err);
    bookingsList.innerHTML = `<tr><td colspan="5" style="padding:12px;color:#c00">Error loading bookings.</td></tr>`;
  }
}

// ✅ فتح / إغلاق مودال التقييم
function openReview(id, guideId = null) {
  selectedBookingId = id;
  selectedGuideId = guideId;
  document.getElementById("reviewModal").classList.add("show");
}
function closeModal() {
  document.getElementById("reviewModal").classList.remove("show");
}

// ⭐ تفعيل اختيار النجوم
let selectedRating = 0;
document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll("#starsContainer i");
  stars.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value);
      stars.forEach(s =>
        s.classList.toggle("active", parseInt(s.dataset.value) <= selectedRating)
      );
    });
  });
});

// ✅ حفظ التقييم
document.getElementById("saveReviewBtn").addEventListener("click", async () => {
  try {
    const rating = selectedRating;
    const comment = document.getElementById("comment").value.trim();

    if (!rating) {
      showToast("⭐ Please select a rating", "error");
      return;
    }
    if (!comment) {
      showToast("💬 Please write a comment", "error");
      return;
    }

    const { error } = await supabaseClient.from("reviews").insert([
      {
        booking_id: selectedBookingId,
        guide_id: selectedGuideId,
        rating,
        comment
      }
    ]);

    if (error) throw error;

    showToast("✅ Review submitted successfully", "success");
    closeModal();
    loadBookings();
  } catch (e) {
    console.error("❌ Insert Error:", e);
    showToast("❌ Failed to add review", "error");
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

    showToast("✅ Booking canceled successfully", "success");
    loadBookings();
  } catch (e) {
    console.error(e);
    showToast("❌ Failed to cancel", "error");
  }
}

// ✅ تحميل عند البدء
document.addEventListener("DOMContentLoaded", loadBookings);
