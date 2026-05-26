import { supabase } from "supabase.js";

async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        "https://purple-tree-0bed2d91e.7.azurestaticapps.net/pages/signup.html",
    },
  });

  if (error) {
    console.error(error);
    alert("Erreur Google Auth");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("google-login")
    .addEventListener("click", loginWithGoogle);
});
