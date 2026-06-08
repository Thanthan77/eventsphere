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


export async function updateUserProfile(newName) {
  // Récupérer l'utilisateur connecté
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: userError || "Utilisateur non connecté" };
  }

  // Appel RPC
  const { error } = await supabase.rpc("update_user_profile", {
    user_id: user.id,
    new_name: newName
  });

  return { error };
}

