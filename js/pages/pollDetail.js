import { supabase } from "../utils/supabase.js";
import { getPollOptions, getVotes, addPollOption, vote } from "../service/polls.js";
import { getEventById } from "../service/events.js";

/* Charger un sondage complet */
async function init() {
  const params = new URLSearchParams(window.location.search);
  const pollId = params.get("id");

  if (!pollId) {
    document.querySelector(".poll-grid").innerHTML = "<p>Sondage introuvable.</p>";
    return;
  }

  // Charger le sondage
  const poll = await loadPoll(pollId);
  if (!poll) return;

  // Charger les options
  const options = await loadOptions(pollId);

  // Charger les votes
  const votes = await loadVotes(pollId);

  // Construire la carte
  renderPollCard(poll, options, votes);

  setupVoting(pollId, options);
  setupAddOptionButton(pollId);
}

/* Charger le sondage + event */
async function loadPoll(pollId) {
  const { data, error } = await supabase
    .from("polls")
    .select("id, question, event_id")
    .eq("id", pollId)
    .single();

  if (error || !data) {
    document.querySelector(".poll-grid").innerHTML = "<p>Erreur lors du chargement du sondage.</p>";
    return null;
  }

  // Charger l'événement
  const { data: eventArray } = await getEventById(data.event_id);
  const event = eventArray ? eventArray[0] : null;

  return {
    ...data,
    event_title: event?.title ?? "Événement inconnu"
  };
}

/* Charger les options */
async function loadOptions(pollId) {
  const { data, empty } = await getPollOptions(pollId);
  return empty ? [] : data;
}

/* Charger les votes */
async function loadVotes(pollId) {
  const { data, empty } = await getVotes(pollId);
  return empty ? [] : data;
}

/* Construire la carte poll-card */
function renderPollCard(poll, options, votes) {
  const container = document.querySelector(".poll-grid");

  const voteCounts = {};
  votes.forEach(v => {
    voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1;
  });

  container.innerHTML = `
    <div class="poll-card">

      <h3>${poll.question}</h3>
      <p class="poll-meta">Événement : ${poll.event_title}</p>

      <h4>Options</h4>
      ${options.length === 0 ? "<p>Aucune option pour le moment.</p>" : ""}
      ${options
        .map(
          (opt) => `
        <div class="option-item selectable-option" data-id="${opt.id}">
          <span>${opt.option_text}</span>
          <span class="vote-count">${voteCounts[opt.id] || 0} vote(s)</span>
        </div>
      `
        )
        .join("")}

      <div class="poll-actions">
        <button id="add-option-btn" class="secondary-btn">Ajouter une option</button>
      </div>

    </div>
  `;
}


/* Bouton : Ajouter une option */
function setupAddOptionButton(pollId) {
  const btn = document.querySelector("#add-option-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const text = prompt("Entrez le texte de l'option :");
    if (!text) return;

    const { error } = await addPollOption(pollId, text);
    if (error) {
      alert("Erreur lors de l'ajout de l'option.");
      return;
    }

    alert("Option ajoutée !");
    init(); // recharger la page
  });
}

async function setupVoting(pollId, options) {
  const { data: { user } } = await supabase.auth.getUser();

  document.querySelectorAll(".selectable-option").forEach((optDiv) => {
    optDiv.addEventListener("click", async () => {
      const optionId = optDiv.dataset.id;

      // Retirer l'ancienne sélection
      document.querySelectorAll(".selectable-option").forEach((o) =>
        o.classList.remove("selected")
      );

      // Ajouter la nouvelle sélection
      optDiv.classList.add("selected");

      // Envoyer le vote
      const { error } = await vote(pollId, optionId, user.id);

      if (error) {
        alert("Vous avez déjà voté ou une erreur est survenue.");
        return;
      }

      // Recharger les résultats
      init();
    });
  });
}


init();
