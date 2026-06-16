const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");

hamburger.addEventListener("click", () => {
  sidebar.classList.add("open");
  overlay.classList.add("active");
  hamburger.style.display = "none";
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("active");
  hamburger.style.display = "block";
});
