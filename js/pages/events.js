import { requireAuth } from "../service/session.js";
import { getUser, extractDisplayName } from "../service/user.js";
import { createEvent, getEvents } from "../service/events.js";

async function init() {
  await requireAuth();

  const user = await getUser();


  // Charger les événements
  await loadEvents();

  // Ouvrir le modal
  document.querySelector(".create-btn").addEventListener("click", () => {
    document.getElementById("create-event-modal").classList.remove("hidden");
  });

  // Fermer le modal
  document.getElementById("close-modal-btn").addEventListener("click", () => {
    document.getElementById("create-event-modal").classList.add("hidden");
  });

  // Sauvegarder un événement
  document.getElementById("save-event-btn").addEventListener("click", async () => {
    const title = document.getElementById("event-title").value;
    const description = document.getElementById("event-description").value;
    const type = document.getElementById("event-type").value;

    const { error } = await createEvent(
      title,
      description,
      type === "private",
      user.id
    );

    if (error) {
      alert("Erreur lors de la création");
      return;
    }

    alert("Événement créé !");
    document.getElementById("create-event-modal").classList.add("hidden");
    await loadEvents();
  });
}

async function loadEvents() {
  const grid = document.querySelector(".event-grid");
  grid.innerHTML = ""; // reset

  const { data: events } = await getEvents();

  events.forEach(event => {
    const card = document.createElement("div");
    card.classList.add("event-card");

    card.innerHTML = `
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <p class="event-meta">${event.is_private ? "Privé" : "Public"}</p>
      <button>Ouvrir</button>
    `;

    grid.appendChild(card);
  });
}

init();
