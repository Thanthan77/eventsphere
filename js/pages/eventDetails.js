import { supabase } from "../utils/supabase.js";
import { getEventById,canInvite,canManageMembers } from "../service/events.js";
import { getMembers, addMember,removeMember} from "../service/eventMembers.js";
import { getPolls,createPoll } from "../service/polls.js";

async function init() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  if (!eventId) {
    document.getElementById("event-container").innerHTML =
      "<p>Événement introuvable.</p>";
    return;
  }

  // Charger l'événement 
  const { data: eventArray, error } = await getEventById(eventId);
  
  if (error || !eventArray || eventArray.length === 0) {
    document.getElementById("event-container").innerHTML =
      "<p>Impossible de charger l'événement.</p>";
    return;
  }

  // On récupère l'objet
  const event = eventArray[0];

  // On affiche l'événement
  await renderEvent(event);

  setupInviteButton(eventId);
  setupCreatePollButton(eventId);

  // Charger les membres
  await loadMembers(eventId,event);

  // Charger les sondages
  await loadPolls(eventId);
}

function setupInviteButton(eventId) {
  const btn = document.querySelector("#invite-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const email = prompt("Entrez le courriel de l'utilisateur à inviter :");
    if (!email) return;

    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      alert("Aucun utilisateur trouvé avec ce courriel.");
      return;
    }

    const { error: addError } = await addMember(eventId, user.id);

    if (addError) {
      alert("Impossible d'ajouter ce membre (peut-être déjà invité).");
      console.error(addError);
      return;
    }

    alert("Utilisateur invité avec succès !");
    await loadMembers(eventId);
  });
}



async function renderEvent(event) {
   const { data: { user } } = await supabase.auth.getUser();
  const canUserInvite = event.created_by === user.id;
  document.getElementById("event-container").innerHTML = `
    <h2>${event.title ?? "Titre introuvable"}</h2>
    <p>${event.description ?? "Aucune description"}</p>
    <p><strong>Type :</strong> ${event.is_private ? "Privé" : "Public"}</p>

    <h3>Participants</h3>
    <div id="members-list">Chargement...</div>
    ${canUserInvite ? `<button id="invite-btn">Inviter quelqu'un</button>` : ''}

    <h3>Sondages</h3>
    <div id="polls-list">Chargement...</div>
    <button id="create-poll-btn">Créer un sondage</button>
  `;
}


async function loadMembers(eventId,event) {
  const creatorId = event.created_by;
  const membersList = document.getElementById("members-list");

  // Vérifier si l'utilisateur peut retirer des membres
  const canUserRemove = await canManageMembers(eventId);

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
      <div class="member-item">
        <p>${m.profiles.full_name} (${m.profiles.email}) - ${m.role}</p>
        ${canUserRemove && m.profiles.id !== creatorId ? `<button class="open-btn" data-user="${m.profiles.id}">Retirer</button>` : ''}
      </div>
      `
    )
    .join("");

  document.querySelectorAll(".open-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.user;

      const confirmRemove = confirm("Retirer ce membre ?");
      if (!confirmRemove) return;

      const { error } = await removeMember(eventId, userId);

      if (error) {
        alert("Impossible de retirer ce membre.");
        console.error(error);
        return;
      }

      alert("Membre retiré !");
      loadMembers(eventId); // Recharger la liste
    });
  });
}

function setupCreatePollButton(eventId) {
  const btn = document.querySelector("#create-poll-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const question = prompt("Entrez la question du sondage :");
    if (!question) return;

    const { data, error } = await createPoll(eventId, question);

    if (error) {
      alert("Impossible de créer le sondage.");
      console.error(error);
      return;
    }

    alert("Sondage créé avec succès !");
    await loadPolls(eventId);
  });
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
        <button class="open-btn" data-id="${p.id}">Voir</button>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".open-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pollId = btn.dataset.id;
      window.location.href = `pollDetail.html?id=${pollId}`;
    });
  });
}

init();
