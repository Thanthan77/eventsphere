import { login, loginGoogle } from "../service/auth.js";
import { redirectIfLoggedIn } from "../service/session.js";

async function init() {
  // utilisateur déjà connecté 
  await redirectIfLoggedIn();

  // Connexion email
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { error } = await login(email, password);

      if (error) {
        alert(error.message);
      } else {
        window.location.href = "pages/dashboard.html";
      }
    });
  }

  // Connexion Google
  const googleBtn = document.getElementById("google-login");
  if (googleBtn) {
    googleBtn.addEventListener("click", loginGoogle);
  }
}

init();
