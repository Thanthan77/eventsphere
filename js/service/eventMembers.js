import { supabase } from "../utils/supabase.js";

/* Récupérer les membres d'un événement */
export async function getMembers(eventId) {
  const { data, error } = await supabase
    .from("event_members")
    .select("user_id, role, joined_at")
    .eq("event_id", eventId);

  if (error) return { data: null, error };

  // Si aucun membre
  if (!data || data.length === 0) {
    return { data: [], error: null, empty: true };
  }

  return { data, error: null, empty: false };
}

/* Ajouter un membre */
export async function addMember(eventId, userId, role = "member") {
  const { data, error } = await supabase
    .from("event_members")
    .insert({
      event_id: eventId,
      user_id: userId,
      role,
    });

  return { data, error };
}

/* Retirer un membre */
export async function removeMember(eventId, userId) {
  const { data, error } = await supabase
    .from("event_members")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  return { data, error };
}
