import { supabase } from "../utils/supabase.js";
import { getUser, extractUsername, updateUserProfile } from "../service/user.js";

let currentUser = null;

async function init() {
  currentUser = await getUser();

  // Email
  document.getElementById("email").value = currentUser.email;
  document.getElementById("profile-email").textContent = currentUser.email;

  // Display name
  const name = extractUsername(currentUser);
  document.getElementById("display-name").value = name || "";
  document.getElementById("profile-name").textContent =
    name || "Nom non défini";

  // Avatar
  const avatarLetter = (name || currentUser.email)[0].toUpperCase();
  document.getElementById("profile-avatar").textContent = avatarLetter;
}

document.getElementById("save-btn").addEventListener("click", async () => {
  const newName = document.getElementById("display-name").value;

  const { error } = await updateUserProfile(newName);

  if (error) {
    alert("Erreur lors de la mise à jour");
  } else {
    alert("Nom mis à jour !");
    location.reload();
  }
});

document.getElementById("delete-account-btn").addEventListener("click", async () => {
  const confirmDelete = confirm(
    "Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible."
  );

  if (!confirmDelete) return;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.rpc("delete_user_completely", {
    p_user_id: user.id
  });

  if (error) {
    alert("Erreur lors de la suppression du compte.");
    return;
  }

  alert("Votre compte a été supprimé.");
  window.location.href = "../index.html";
});


init();
