import { supabase } from "../utils/supabase.js";

export async function createEvent(title, description, isPrivate, userId, nom, courriel) {
  return await supabase.from("events").insert({
    title,
    description,
    is_private: isPrivate,
    created_by: userId,
    nom,
    courriel
  });
}

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, is_private, created_by, created_at")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getEventById(eventId) {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, is_private, created_by, nom, courriel")
    .eq("id", eventId)
    .single();

  return { data, error };
}
