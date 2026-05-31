import { supabase } from "../utils/supabase.js";


export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  // Vérifier si le user existe, mais NE PAS déconnecter immédiatement
  const { data: user } = await supabase.auth.getUser();

  if (!user) {
    await new Promise(r => setTimeout(r, 300));
    const { data: retryUser } = await supabase.auth.getUser();

    if (!retryUser) {
      await supabase.auth.signOut();
      return null;
    }

    return session;
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

