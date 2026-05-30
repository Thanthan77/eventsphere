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
  await supabase.auth.signOut(); 

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo:
        "https://calm-sky-035d00f1e.7.azurestaticapps.net/pages/dashboard.html",
    }
  });
}



export async function logout() {
  return await supabase.auth.signOut();
}
