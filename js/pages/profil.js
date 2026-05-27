import { requireAuth } from "../service/session.js";
import { getUser } from "../service/user.js";

async function init() {
  await requireAuth();

  const user = await getUser();
  const avatar = document.getElementById("avatar");

  if (user && user.email) {
    const firstLetter = user.email.charAt(0).toUpperCase();
    avatar.textContent = firstLetter;
  }

  avatar.addEventListener("click", () => {
    window.location.href = "../pages/settings.html";
  });
}

init();
