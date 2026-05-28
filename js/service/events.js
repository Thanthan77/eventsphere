import { supabase } from "../utils/supabase.js";

export async function createEvent(title, description, isPrivate, userId) {
  return await supabase.from("events").insert({
    title,
    description,
    is_private: isPrivate,
    created_by: userId
  });
}

export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getEventById(eventId) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  return { data, error };
}
