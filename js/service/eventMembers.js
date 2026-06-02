import { supabase } from "../utils/supabase.js";

/* Récupérer les membres d'un événement */
export async function getMembers(eventId) {
  const { data, error } = await supabase.rpc("get_event_members", {
    eid: eventId
  });

  if (error) return { data: null, error };

  if (!data || data.length === 0) {
    return { data: [], error: null, empty: true };
  }

  const formatted = data.map((m) => ({
    role: m.role,
    joined_at: m.joined_at,
    profiles: {
      id: m.user_id,
      full_name: m.member_full_name
    }
  }));

  return { data: formatted, error: null, empty: false };
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
