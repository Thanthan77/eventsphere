import { supabase } from "../utils/supabase.js";
import { getAccessiblePolls } from "../service/polls.js";

async function init() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  loadPolls(user.id);
}

async function loadPolls(userId) {
  const container = document.querySelector(".poll-grid");

  const { data: polls, error } = await getAccessiblePolls(userId);

  if (error) {
    container.innerHTML = "<p>Erreur lors du chargement des sondages.</p>";
    console.error("Error loading polls:", error);
    return;
  }

  if (!polls || polls.length === 0) {
    container.innerHTML = "<p>Aucun sondage disponible.</p>";
    return;
  }

  container.innerHTML = polls
    .map(
      (p) => `
      <div class="poll-card">
        <h3>${p.question}</h3>

        <div class="poll-tags">
          <span class="tag">${p.events.title}</span>
          <span class="tag">${p.events.is_private ? "Privé" : "Public"}</span>
        </div>

        <p>${p.poll_votes[0].count} vote(s)</p>

        <button onclick="window.location.href='poll.html?id=${p.id}'">
          Voir
        </button>
      </div>
    `
    )
    .join("");
}

init();
