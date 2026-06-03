import { requireAuth } from "../service/session.js";
import { getUser } from "../service/user.js";
import { createEvent, getEvents } from "../service/events.js";

async function init() {
  await requireAuth();
  const user = await getUser();

  // Charger les événements
  await loadEvents();

  document.querySelector(".create-btn").addEventListener("click", () => {
    document.getElementById("create-event-modal").classList.remove("hidden");
  });

  document.getElementById("close-modal-btn").addEventListener("click", () => {
    document.getElementById("create-event-modal").classList.add("hidden");
  });

  // Sauvegarder un événement
  document.getElementById("save-event-btn").addEventListener("click", async () => {
    const title = document.getElementById("event-title").value;
    const description = document.getElementById("event-description").value;
    const type = document.getElementById("event-type").value;

   const freshUser = await getUser();
   const { data, error } = await createEvent(
   title,
   description,
   type === "private",
   freshUser.id
   );


    if (error) {
      alert("Erreur lors de la création");
      console.error("Erreur Supabase :", error);
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

  const { data: events, error } = await getEvents();

  if (error) {
    console.error("Erreur Supabase :", error);
    grid.innerHTML = "<p>Impossible de charger les événements.</p>";
    return;
  }

  if (!events || events.length === 0) {
    grid.innerHTML = "<p>Aucun événement pour le moment.</p>";
    return;
  }

  events.forEach((event) => {
    const card = document.createElement("div");
    card.classList.add("event-card");

    card.innerHTML = `
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <p class="event-meta">${event.is_private ? "Privé" : "Public"}</p>
      <button class="open-event-btn">Ouvrir</button>
    `;

    card.querySelector(".open-event-btn").addEventListener("click", () => {
      window.location.href = `detailEvent.html?id=${event.id}`;
    });

    grid.appendChild(card);
  });
}

init();
