import { supabase } from "../utils/supabase.js";

/* Récupérer l'utilisateur actuel */
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/* Extraire un nom d'utilisateur propre */
export function extractUsername(user) {
  if (!user) return null;

  return (
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.raw_user_meta_data?.full_name ||
    null
  );
}

/* Mettre à jour les informations de l'utilisateur */
export async function updateUser(updates) {
  const { data, error } = await supabase.auth.updateUser(updates);
  return { data, error };
}
