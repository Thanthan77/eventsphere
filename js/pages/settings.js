import { getUser, extractUsername, updateUser } from "../service/user.js";

async function init() {
  const user = await getUser();

  // Email
  document.getElementById("email").value = user.email;
  document.getElementById("profile-email").textContent = user.email;

  // Display name
  const name = extractUsername(user);
  document.getElementById("display-name").value = name || "";
  document.getElementById("profile-name").textContent =
    name || "Nom non défini";
  // Avatar
  const avatarLetter = (name || user.email)[0].toUpperCase();
  document.getElementById("profile-avatar").textContent = avatarLetter;
}

document.getElementById("save-btn").addEventListener("click", async () => {
  const newName = document.getElementById("display-name").value;

  const { error } = await updateUser({
    data: { display_name: newName },
  });

  if (error) {
    alert("Erreur lors de la mise à jour");
  } else {
    alert("Nom mis à jour !");
    location.reload();
  }
});

init();
