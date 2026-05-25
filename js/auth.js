import { supabase } from "../utils/supabaseClient.js";

 async function loginWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: "http://localhost:5500/eventsphere/pages/signup.html",
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