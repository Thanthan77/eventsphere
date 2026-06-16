document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("overlay");

  if (!hamburger || !sidebar || !overlay) return;

  // Ouvrir sidebar
  hamburger.addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    hamburger.style.display = "none";
  });

  // Fermer sidebar en cliquant en dehors
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    hamburger.style.display = "block";
  });
});
