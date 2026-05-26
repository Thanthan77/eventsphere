import { supabase } from "./supabase.js";

async function loadUser() {
  // On récupère la session actuelle
  const { data: { session } } = await supabase.auth.getSession();

  //Si pas encore de session, on attend que Supabase la crée
  if (!session) {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.href = "index.html";
      }
    });
    return;
  }

  document.getElementById("userEmail").textContent = session.user.email;
}

window.addEventListener("DOMContentLoaded", loadUser);
