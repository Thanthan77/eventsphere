import { signup } from "../service/auth.js";
import { redirectIfLoggedIn } from "../service/session.js";

async function init() {
  // utilisateur déjà connecté
  await redirectIfLoggedIn();

  const signupBtn = document.getElementById("signup-btn");

  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const username = document.getElementById("username").value;
      console.log("USERNAME =", username);
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirm = document.getElementById("confirm").value;

      if (!username || !email || !password || !confirm) {
        alert("Veuillez remplir tous les champs.");
        return;
      }

      if (password !== confirm) {
        alert("Les mots de passe ne correspondent pas.");
        return;
      }

      const { error } = await signup(email, password);

      if (error) {
        alert(error.message);
      } else {
        alert("Compte créé ! Vous pouvez maintenant vous connecter.");
        window.location.href = "../index.html"; // redirection vers login
      }
    });
  }
}

init();
