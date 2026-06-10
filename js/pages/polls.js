import { supabase } from "../utils/supabase.js";
import { getAccessiblePolls } from "../service/polls.js";

async function init() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  loadPolls(user.id);
}

async function loadPolls(userId) {
  const { data: polls, error } = await getAccessiblePolls(userId);

  if (error) {
    document.querySelector(".poll-grid").innerHTML =
      "<p>Erreur lors du chargement des sondages.</p>";
    console.error("Error loading polls:", error);
    return;
  }

  renderPolls(polls);
  setupPollFilters(polls, userId); 
}

function renderPolls(polls) {
  const container = document.querySelector(".poll-grid");
  container.innerHTML = "";

  if (!polls || polls.length === 0) {
    container.innerHTML = "<p>Aucun sondage trouvé.</p>";
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

        <button onclick="window.location.href='pollDetail.html?id=${p.id}'">
          Voir
        </button>
      </div>
    `
    )
    .join("");
}

function setupPollFilters(polls, userId) {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.textContent.trim();
      let filtered = polls;

      if (filter === "Tous") {
        filtered = polls;
      }

      else if (filter === "Mes sondages") {
        filtered = polls.filter((p) => p.events.created_by === userId);
      }

      else if (filter === "Votés") {
        filtered = polls.filter((p) =>
          p.poll_votes.some((v) => v.user_id === userId)
        );
      }

      else if (filter === "Non votés") {
        filtered = polls.filter(
          (p) => !p.poll_votes.some((v) => v.user_id === userId)
        );
      }

      renderPolls(filtered);
    });
  });
}

init();
