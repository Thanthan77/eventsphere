import { getEventById } from "../service/events.js";
import { getMembers } from "../service/eventMembers.js";
import { getPolls } from "../service/polls.js";

async function init() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  if (!eventId) {
    document.getElementById("event-container").innerHTML =
      "<p>Événement introuvable.</p>";
    return;
  }

  const { data: event, error } = await getEventById(eventId);

  if (error || !event) {
    document.getElementById("event-container").innerHTML =
      "<p>Impossible de charger l'événement.</p>";
    return;
  }

  renderEvent(event);
  await loadMembers(eventId);
  await loadPolls(eventId);
}

function renderEvent(event) {
  document.getElementById("event-container").innerHTML = `
    <h2>${event.title}</h2>
    <p>${event.description}</p>
    <p><strong>Type :</strong> ${event.is_private ? "Privé" : "Public"}</p>

    <h3>Participants</h3>
    <div id="members-list">Chargement...</div>
    <button id="invite-btn">Inviter quelqu'un</button>

    <h3>Sondages</h3>
    <div id="polls-list">Chargement...</div>
    <button id="create-poll-btn">Créer un sondage</button>
  `;
}

/* Membres d'un événement */

async function loadMembers(eventId) {
  const membersList = document.getElementById("members-list");

  const { data: members, empty, error } = await getMembers(eventId);

  if (error) {
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
      <p>${m.user_id} — <strong>${m.role}</strong></p>
    `
    )
    .join("");
}

/* Sondages d'un événement */

async function loadPolls(eventId) {
  const pollsList = document.getElementById("polls-list");

  const { data: polls, empty, error } = await getPolls(eventId);

  if (error) {
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

  // Ajouter les listeners pour ouvrir un poll
  document.querySelectorAll(".open-poll-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pollId = btn.dataset.id;
      window.location.href = `poll.html?id=${pollId}`;
    });
  });
}

init();
