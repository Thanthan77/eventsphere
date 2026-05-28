import { requireAuth } from "../service/session.js";
import { getUser, extractUsername } from "../service/user.js";

async function init() {
  await requireAuth();

  const user = await getUser();
  const avatar = document.getElementById("avatar");

  // Récupérer le display_name proprement
  const username = extractUsername(user);

  const source = username || user.email;
  const firstLetter = source.charAt(0).toUpperCase();

  avatar.textContent = firstLetter;

  avatar.addEventListener("click", () => {
    window.location.href = "../pages/settings.html";
  });
}

init();
