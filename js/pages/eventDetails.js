import { supabase } from "../utils/supabase.js";
import { getEventById } from "../service/events.js";
import { getMembers, addMember } from "../service/eventMembers.js";
import { getPolls } from "../service/polls.js";

async function init() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  if (!eventId) {
    document.getElementById("event-container").innerHTML =
      "<p>Événement introuvable.</p>";
    return;
  }

  // Charger l'événement via RPC
  const { data: eventArray, error } = await getEventById(eventId);
  
  if (error || !eventArray || eventArray.length === 0) {
    document.getElementById("event-container").innerHTML =
      "<p>Impossible de charger l'événement.</p>";
    return;
  }

  // On récupère l'objet
  const event = eventArray[0];

  // On affiche l'événement
  renderEvent(event);

  setupInviteButton(eventId);

  // Charger les membres
  await loadMembers(eventId);

  // Charger les sondages
  await loadPolls(eventId);
}


function setupInviteButton(eventId) {
  document.querySelector("#invite-btn").addEventListener("click", async () => {
    const email = prompt("Entrez le courriel de l'utilisateur à inviter :");
    if (!email) return;

    // Chercher l'utilisateur dans profiles
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      alert("Aucun utilisateur trouvé avec ce courriel.");
      return;
    }

    const userId = user.id;

    // Ajouter via RPC add_member
    const { error: addError } = await addMember(eventId, userId);

    if (addError) {
      alert("Impossible d'ajouter ce membre (peut-être déjà invité).");
      console.error(addError);
      return;
    }

    alert("Utilisateur invité avec succès !");
    await loadMembers(eventId);
  });
}

function renderEvent(event) {
  document.getElementById("event-container").innerHTML = `
    <h2>${event.title ?? "Titre introuvable"}</h2>
    <p>${event.description ?? "Aucune description"}</p>
    <p><strong>Type :</strong> ${event.is_private ? "Privé" : "Public"}</p>

    <h3>Participants</h3>
    <div id="members-list">Chargement...</div>
    <button id="invite-btn">Inviter quelqu'un</button>

    <h3>Sondages</h3>
    <div id="polls-list">Chargement...</div>
    <button id="create-poll-btn">Créer un sondage</button>
  `;
}


async function loadMembers(eventId) {
  const membersList = document.getElementById("members-list");

  const { data: members, empty, error } = await getMembers(eventId);

  if (error) {
    console.error("Erreur Supabase :", error);
    membersList.innerHTML = "<p>Erreur lors du chargement.</p>";
    return;
  }

  if (empty) {
    membersList.innerHTML = "<p>Aucun participant pour le moment.</p>";
    return;
  }

  membersList.innerHTML = members
    .map(
      (m) => `
        <p>${m.profiles?.full_name ?? "Utilisateur inconnu"} — <strong>${m.role}</strong></p>
      `
    )
    .join("");
}

async function loadPolls(eventId) {
  const pollsList = document.getElementById("polls-list");

  const { data: polls, empty, error } = await getPolls(eventId);

  if (error) {
    console.error(error);
    pollsList.innerHTML = "<p>Erreur lors du chargement.</p>";
    return;
  }

  if (empty) {
    pollsList.innerHTML = "<p>Aucun sondage pour le moment.</p>";
    return;
  }

  pollsList.innerHTML = polls
    .map(
      (p) => `
      <div class="poll-item">
        <p><strong>${p.question}</strong></p>
        <button class="open-poll-btn" data-id="${p.id}">Voir</button>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".open-poll-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pollId = btn.dataset.id;
      window.location.href = `poll.html?id=${pollId}`;
    });
  });
}

init();
