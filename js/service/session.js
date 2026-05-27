import { supabase } from "../utils/supabase.js";


export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/* Rediriger si pas connecté */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = "../index.html"; // page login
  }
}

/* Rediriger si déjà connecté */
export async function redirectIfLoggedIn() {
  const session = await getSession();
  if (session) {
    window.location.href = "pages/dashboard.html";
  }
}
