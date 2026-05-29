import { supabase } from "../utils/supabase.js";

export async function signup(email, password, username) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username,
      },
    },
  });
}

export async function login(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function loginGoogle() {
  // 1. Déconnexion Supabase (session locale)
  await supabase.auth.signOut();

  // 2. Déconnexion Google OAuth
  window.location.href =
    "https://accounts.google.com/Logout?continue=" +
    encodeURIComponent(
      "https://purple-tree-0bed2d91e.7.azurestaticapps.net/pages/login.html"
    );
}


export async function logout() {
  return await supabase.auth.signOut();
}
