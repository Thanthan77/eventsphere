import { supabase } from "./supabase.js";

async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.error(error);
        window.location.href = "index.html";
        return;
      }
     document.getElementById("userEmail").textContent = data.user.email;
}

window.addEventListener("DOMContentLoaded", loadUser);