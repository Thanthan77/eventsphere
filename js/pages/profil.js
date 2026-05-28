import { requireAuth } from "../service/session.js";
import { getUser, extractDisplayName } from "../service/user.js";

async function init() {
  await requireAuth();

  const user = await getUser();
  const avatar = document.getElementById("avatar");

  // Récupérer le display_name proprement
  const displayName = extractDisplayName(user);

  const source = displayName || user.email;
  const firstLetter = source.charAt(0).toUpperCase();

  avatar.textContent = firstLetter;

  avatar.addEventListener("click", () => {
    window.location.href = "../pages/settings.html";
  });
}

init();
