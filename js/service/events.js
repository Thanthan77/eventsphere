import { supabase } from "../utils/supabase.js";

/* Créer un événement  */
export async function createEvent(title, description, isPrivate, userId) {
  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      description,
      is_private: isPrivate,
      created_by: userId
    })
  return { data, error };
}

/* Récupérer tous les événements */
export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, is_private, created_by, created_at")
    .order("created_at", { ascending: false });

  return { data, error };
}

/* Récupérer un événement par ID  */
export async function getEventById(eventId) {
  const { data, error } = await supabase.rpc("get_event_by_id", {
    event_id: eventId
  });

  return { data, error };
}

export async function canInvite(event, user) {
  return event.created_by === user.id;
}

export async function canManageMembers(eventId) {
  const { data: { user } } = await supabase.auth.getUser();

  // Récupérer l'événement
  const { data: event, error } = await supabase
    .from("events")
    .select("created_by")
    .eq("id", eventId)
    .single();

  if (error) return false;

  // Vérifier si l'utilisateur est le créateur
  return event.created_by === user.id;
}


