import { supabase } from "../utils/supabase.js";

/* Récupérer la session */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session ?? null;
}

/* Rediriger si pas connecté */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = "../index.html";
  }
}

/* Rediriger si déjà connecté */
export async function redirectIfLoggedIn() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    window.location.href = "pages/dashboard.html";
    return;
  }

  supabase.auth.onAuthStateChange((_event, newSession) => {
    if (newSession) {
      window.location.href = "pages/dashboard.html";
    }
  });
}
