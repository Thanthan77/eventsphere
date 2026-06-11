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

  // Récupérer les sondages publics
  const { data: publicPolls } = await supabase
    .from("polls")
    .select(`
      id,
      question,
      created_at,
      event_id,
      events ( id, title, is_private, created_by ),
      poll_votes(count)
    `)
    .eq("events.is_private", false);

  //  Récupérer les sondages des événements créés par l'utilisateur
  const { data: ownedPolls } = await supabase
    .from("polls")
    .select(`
      id,
      question,
      event_id,
      events ( id, title, is_private, created_by ),
      poll_votes(count)
    `)
    .eq("events.created_by", userId);

  //  Récupérer les événements où l'utilisateur est membre
  const { data: memberships } = await supabase
    .from("event_members")
    .select("event_id")
    .eq("user_id", userId);

  const memberEventIds = memberships?.map(m => m.event_id) || [];

  //  Récupérer les sondages de ces événements
  let memberPolls = [];
  if (memberEventIds.length > 0) {
    const { data } = await supabase
      .from("polls")
      .select(`
        id,
        question,
        event_id,
        events ( id, title, is_private, created_by ),
        poll_votes(count)
      `)
      .in("event_id", memberEventIds);

    memberPolls = data || [];
  }

  // Fusionner les 3 listes
  const allPolls = [
    ...(publicPolls || []),
    ...(ownedPolls || []),
    ...memberPolls
  ];

  // Enlever les doublons 
  const uniquePolls = Object.values(
    allPolls.reduce((acc, poll) => {
      acc[poll.id] = poll;
      return acc;
    }, {})
  );

  return { data: uniquePolls, error: null };
}

export async function getRecentPolls(userId) {
  const { data, error } = await supabase.rpc("get_recent_polls", {
    user_id: userId
  });

  return { data, error };
}

export async function deletePoll(pollId) {
  const { error } = await supabase.rpc("delete_poll", {
    p_poll_id: pollId
  });

  return { error };
}


