import { supabase } from "../utils/supabase.js";

/* Récupérer les polls d'un événement  */
export async function getPolls(eventId) {
  const { data, error } = await supabase.rpc("get_polls", {
    event_id: eventId
  });

  if (error) return { data: null, error };

  if (!data || data.length === 0) {
    return { data: [], empty: true, error: null };
  }

  return { data, empty: false, error: null };
}

/* Créer un poll  */
export async function createPoll(eventId, question) {
  const { data, error } = await supabase
    .from("polls")
    .insert({
      event_id: eventId,
      question
    })
    .select()
    .single();

  return { data, error };
}

/* Récupérer les options d'un poll  */
export async function getPollOptions(pollId) {
  const { data, error } = await supabase
    .from("poll_options")
    .select("id, option_text")
    .eq("poll_id", pollId);

  if (error) return { data: null, error };

  if (!data || data.length === 0) {
    return { data: [], empty: true, error: null };
  }

  return { data, empty: false, error: null };
}

/* Ajouter une option  */
export async function addPollOption(pollId, text) {
  const { data, error } = await supabase
    .from("poll_options")
    .insert({
      poll_id: pollId,
      option_text: text
    })
    .select()
    .single();

  return { data, error };
}

/* Récupérer les votes  */
export async function getVotes(pollId) {
  const { data, error } = await supabase
    .from("poll_votes")
    .select("poll_id, option_id, user_id")
    .eq("poll_id", pollId);

  if (error) return { data: null, error };

  if (!data || data.length === 0) {
    return { data: [], empty: true, error: null };
  }

  return { data, empty: false, error: null };
}

/* Voter  */
export async function vote(pollId, optionId, userId) {
  const { data, error } = await supabase
    .from("poll_votes")
    .insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId
    })
    .select()
    .single();

  return { data, error };
}

export async function getAccessiblePolls(userId) {
  const { data, error } = await supabase
    .from("polls")
    .select(`
      id,
      question,
      event_id,
      events (
        id,
        title,
        is_private,
        created_by
      ),
      poll_votes(count)
    `)
    .or(
      `events.is_private.eq.false,
       events.created_by.eq.${userId},
       poll_votes.user_id.eq.${userId}`
    );

  return { data, error };
}
