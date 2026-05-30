import { supabase } from "../utils/supabase.js";


export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  // Vérifier si le user existe encore dans auth.users
  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) {
    await supabase.auth.signOut();
    return null;
  }

  return session;
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
  let { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    await new Promise((resolve) => {
      supabase.auth.onAuthStateChange((_event, newSession) => {
        if (newSession) {
          session = newSession;
          resolve();
        }
      });
    });
  }

  if (session) {
    window.location.href = "pages/dashboard.html";
  }
}
