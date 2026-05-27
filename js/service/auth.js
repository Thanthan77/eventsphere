import { supabase } from "../utils/supabase.js";


export async function signup(email, password) {
  return await supabase.auth.signUp({
    email,
    password
  });
}

export async function login(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function loginGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        "https://purple-tree-0bed2d91e.7.azurestaticapps.net/pages/dashboard.html",
    },
  });
}

export async function logout() {
  return await supabase.auth.signOut();
}
