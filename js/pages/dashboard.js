import { getEvents } from "../service/events.js";
import { getRecentPolls } from "../service/polls.js";
import { supabase } from "../utils/supabase.js";

async function init() {
  await loadRecentEvents();
  await loadRecentPolls();
}

async function loadRecentEvents() {
  const container = document.querySelector(".events-list");

  // Reset
  container.innerHTML = `
    <h2>Événements récents</h2>
    <div id="dashboard-events"></div>
  `;

  const list = document.getElementById("dashboard-events");

  const { data: events, error } = await getEvents();

  if (error) {
    list.innerHTML = "<p>Erreur lors du chargement.</p>";
    return;
  }

  if (!events || events.length === 0) {
    list.innerHTML = "<p>Aucun événement pour le moment.</p>";
    return;
  }

  // On affiche seulement les 3 plus récents
  const recent = events.slice(0, 3);

  recent.forEach((event) => {
    const card = document.createElement("div");
    card.classList.add("event-card");

    card.innerHTML = `
      <h3>${event.title}</h3>
      <p class="event-meta">${event.is_private ? "Privé" : "Public"}</p>
      <p>${event.description}</p>
      <button class="open-event-btn">Ouvrir</button>
    `;

    card.querySelector(".open-event-btn").addEventListener("click", () => {
      window.location.href = `detailEvent.html?id=${event.id}`;
    });

    list.appendChild(card);
  });
}

async function loadRecentPolls() {
  const container = document.querySelector(".polls-list");

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    container.innerHTML += "<p>Utilisateur non connecté</p>";
    return;
  }

  const { data: polls, error } = await getRecentPolls(user.id);

  if (error) {
    container.innerHTML += "<p>Erreur lors du chargement.</p>";
    return;
  }

  if (!polls || polls.length === 0) {
    container.innerHTML += "<p>Aucun sondage pour le moment.</p>";
    return;
  }

  polls.forEach((poll) => {
    const card = document.createElement("div");
    card.classList.add("poll-card");

    card.innerHTML = `
      <h4>${poll.question}</h4>
      <p>${poll.vote_count} votes</p>
      <button onclick="window.location.href='pollDetail.html?id=${poll.id}'">
        Voter
      </button>
    `;

    container.appendChild(card);
  });
}


init();
