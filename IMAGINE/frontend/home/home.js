// تأثير حركة الصورة الخلفية (Parallax)
const heroBg = document.querySelector(".hero-bg");
window.addEventListener("scroll", () => {
  heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
});
