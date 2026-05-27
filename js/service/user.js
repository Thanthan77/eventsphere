import { supabase } from "../utils/supabase.js";

/* Récupérer l'utilisateur actuel */
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/* Mettre à jour les informations de l'utilisateur */
export async function updateUser(updates) {
  const { data, error } = await supabase.auth.updateUser(updates);
  return { data, error };
}
