import { supabase } from "../utils/supabase.js";

/* Récupérer les polls d'un événement */
export async function getPolls(eventId) {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error };

  if (!data || data.length === 0) {
    return { data: [], empty: true, error: null };
  }

  return { data, empty: false, error: null };
}

/* Créer un poll */
export async function createPoll(eventId, question, category, userId) {
  const { data, error } = await supabase
    .from("polls")
    .insert({
      event_id: eventId,
      question,
      category,
      created_by: userId,
    })
    .select()
    .single();

  return { data, error };
}

/* Récupérer les options d'un poll */
export async function getPollOptions(pollId) {
  const { data, error } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", pollId);

  if (error) return { data: null, error };

  if (!data || data.length === 0) {
    return { data: [], empty: true, error: null };
  }

  return { data, empty: false, error: null };
}

/* Ajouter une option */
export async function addPollOption(pollId, text, userId) {
  const { data, error } = await supabase
    .from("poll_options")
    .insert({
      poll_id: pollId,
      option_text: text,
      created_by: userId,
    });

  return { data, error };
}

/* Récupérer les votes d'un poll */
export async function getVotes(pollId) {
  const { data, error } = await supabase
    .from("poll_votes")
    .select("*")
    .eq("poll_id", pollId);

  if (error) return { data: null, error };

  if (!data || data.length === 0) {
    return { data: [], empty: true, error: null };
  }

  return { data, empty: false, error: null };
}

/* Voter */
export async function vote(pollId, optionId, userId) {
  const { data, error } = await supabase
    .from("poll_votes")
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
    });

  return { data, error };
}
