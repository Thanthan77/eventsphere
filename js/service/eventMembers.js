import { supabase } from "../utils/supabase.js";

/* Récupérer les membres d'un événement  */
export async function getMembers(eventId) {
  const { data, error } = await supabase.rpc("get_event_members", {
    event_id: eventId
  });

  if (error) {
    console.error("RPC ERROR get_event_members:", error);
    return { data: null, error };
  }

  if (!data || data.length === 0) {
    return { data: [], error: null, empty: true };
  }

  const formatted = data.map((m) => ({
    role: m.role,
    profiles: {
      id: m.user_id,
      full_name: m.full_name,
      email: m.email
    }
  }));

  return { data: formatted, error: null, empty: false };
}

/* Ajouter un membre  */
export async function addMember(eventId, userId) {
  const { error } = await supabase.rpc("add_member", {
    event_id: eventId,
    user_id: userId
  });

  return { error };
}

/* Retirer un membre  */
export async function removeMember(eventId, userId) {
  const { data, error } = await supabase.rpc("remove_member", {
    p_event_id: eventId,
    p_user_id: userId
  });

  console.log("RPC remove_member => data:", data, "error:", error);
  return { data, error };
}
