import { supabase } from "../utils/supabase.js";
import { login, loginGoogle } from "../service/auth.js";
import { redirectIfLoggedIn } from "../service/session.js";

async function init() {
  // Nettoyer session Supabase locale
  await supabase.auth.signOut();

  // utilisateur déjà connecté
  await redirectIfLoggedIn();

  const url = new URL(window.location.href);
  if (url.searchParams.get("forceGoogleLogin") === "1") {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          "https://calm-sky-035d00f1e.7.azurestaticapps.net/pages/dashboard.html",
      },
    });
    return; 
  }



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
    googleBtn.addEventListener("click", async () => {
      // Lancer OAuth proprement
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            "https://calm-sky-035d00f1e.7.azurestaticapps.net/pages/dashboard.html",
        },
      });
    });
  }
}

init();
