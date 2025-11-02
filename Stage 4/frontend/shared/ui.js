// ================================
// IMAGINE Shared UI Components
// Toast - ConfirmModal - Loader
// ================================

// === TOAST ===
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="close-btn">&times;</button>
  `;
  container.insertBefore(toast, container.firstChild); // new one on top

  toast.querySelector(".close-btn").onclick = () => toast.remove();
  setTimeout(() => toast.remove(), 5000);
}

// === CONFIRM MODAL ===
function openConfirm({ title = "Confirm", message = "", onConfirm = null }) {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  overlay.innerHTML = `
    <div class="confirm-box">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="confirm-btn">Confirm</button>
        <button class="cancel-btn">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector(".cancel-btn").onclick = () => overlay.remove();
  overlay.querySelector(".confirm-btn").onclick = () => {
    overlay.remove();
    if (typeof onConfirm === "function") onConfirm();
  };
}

// === LOADER ===
function showLoader(show = true) {
  let overlay = document.querySelector(".loader-overlay");
  if (show) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "loader-overlay";
      overlay.innerHTML = `<div class="loader"></div>`;
      document.body.appendChild(overlay);
    }
  } else if (overlay) {
    overlay.remove();
  }
}

// === SECTION SWITCHER ===
function switchSection(sectionId) {
  document.querySelectorAll(".section-panel").forEach((sec) => sec.classList.add("hidden"));
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("hidden");
}

console.log("✅ ui.js loaded");
