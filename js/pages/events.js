import { requireAuth } from "../service/session.js";
import { getUser } from "../service/user.js";
import { createEvent, getEvents } from "../service/events.js";

async function init() {
  await requireAuth();
  await loadEvents();

  document.querySelector(".create-btn").addEventListener("click", () => {
    document.getElementById("create-event-modal").classList.remove("hidden");
  });

  document.getElementById("close-modal-btn").addEventListener("click", () => {
    document.getElementById("create-event-modal").classList.add("hidden");
  });

  document.getElementById("save-event-btn").addEventListener("click", async () => {
    const title = document.getElementById("event-title").value;
    const description = document.getElementById("event-description").value;
    const type = document.getElementById("event-type").value;

    const freshUser = await getUser();

    const { error } = await createEvent(
      title,
      description,
      type === "private",
      freshUser.id
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
  const { data: events, error } = await getEvents();

  if (error) {
    document.querySelector(".event-grid").innerHTML =
      "<p>Impossible de charger les événements.</p>";
    return;
  }

  renderEvents(events);
  setupEventFilters(events); 
}

function renderEvents(events) {
  const grid = document.querySelector(".event-grid");
  grid.innerHTML = "";

  if (!events || events.length === 0) {
    grid.innerHTML = "<p>Aucun événement trouvé.</p>";
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

function setupEventFilters(events) {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.textContent.trim(); 
      let filtered = events;

      if (filter === "Privé") {
        filtered = events.filter((e) => e.is_private);
      } else if (filter === "Public") {
        filtered = events.filter((e) => !e.is_private);
      }

      renderEvents(filtered);
    });
  });
}

init();
