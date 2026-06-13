import { supabase } from "../utils/supabase.js";
import { getEventById, canInvite, canManageMembers } from "../service/events.js";
import { getMembers, addMember, removeMember} from "../service/eventMembers.js";
import { getPolls, createPoll,deletePoll } from "../service/polls.js";

async function isMember(eventId) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("event_members")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  return !!data;
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  if (!eventId) {
    document.getElementById("event-container").innerHTML =
      "<p>Événement introuvable.</p>";
    return;
  }

  const { data: eventArray, error } = await getEventById(eventId);

  if (error || !eventArray || eventArray.length === 0) {
    document.getElementById("event-container").innerHTML =
      "<p>Impossible de charger l'événement.</p>";
    return;
  }

  const event = eventArray[0];
   const member = await isMember(eventId);

  await renderEvent(event,member);

  if (!member) {
    setupJoinButton(eventId);
    return;
  }

  setupInviteButton(eventId, event);
  setupCreatePollButton(eventId, event);

  await loadMembers(eventId, event);
  await loadPolls(eventId);
}

async function renderEvent(event,isMember) {
  const { data: { user } } = await supabase.auth.getUser();
  const canUserInvite = event.created_by === user.id;

 document.getElementById("event-container").innerHTML = `
  <h2>${event.title}</h2>
  <p>${event.description}</p>
  <p><strong>Type :</strong> ${event.is_private ? "Privé" : "Public"}</p>

  ${
    !isMember
      ? `<button id="join-btn" class="primary-btn">Rejoindre l'événement</button>`
      : `
        <h3>Participants</h3>
        <div class="section-block" id="members-list">Chargement...</div>

        <h3>Sondages</h3>
        <div class="section-block" id="polls-list">Chargement...</div>
        <button id="create-poll-btn">Créer un sondage</button>
      `
  }
`;

}

function setupInviteButton(eventId, event) {
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
      return;
    }

    alert("Utilisateur invité avec succès !");
    await loadMembers(eventId, event);
  });
}

function setupJoinButton(eventId) {
  const btn = document.querySelector("#join-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await addMember(eventId, user.id);

    if (error) {
      alert("Impossible de rejoindre l'événement.");
      console.error("Erreur join event:", error);
      return;
    }

    alert("Vous avez rejoint l'événement !");
    init();
  });
}


async function loadMembers(eventId, event) {
  const creatorId = event.created_by;
  const membersList = document.getElementById("members-list");

  const canUserRemove = await canManageMembers(eventId);

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
      <div class="member-item">
        <p>${m.profiles.full_name} (${m.profiles.email}) — ${m.role}</p>
        ${
          canUserRemove && m.profiles.id !== creatorId
            ? `<button class="open-remove-btn" data-user="${m.profiles.id}">Retirer</button>`
            : ""
        }
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".open-remove-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.user;

      if (!confirm("Retirer ce membre ?")) return;

      const { error } = await removeMember(eventId, userId);

      if (error) {
        alert("Impossible de retirer ce membre.");
        return;
      }

      alert("Membre retiré !");
      await loadMembers(eventId, event);
    });
  });
}

function setupCreatePollButton(eventId, event) {
  const btn = document.querySelector("#create-poll-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const question = prompt("Entrez la question du sondage :");
    if (!question) return;

    const { error } = await createPoll(eventId, question);

    if (error) {
      alert("Impossible de créer le sondage.");
      return;
    }

    alert("Sondage créé avec succès !");
    await loadPolls(eventId);
  });
}

async function loadPolls(eventId) {
  const pollsList = document.getElementById("polls-list");

  // Récupérer l'utilisateur courant
  const { data: { user } } = await supabase.auth.getUser();

  // Récupérer l'événement pour savoir qui est le créateur
  const { data: eventArray } = await getEventById(eventId);
  const event = eventArray[0];
  const isCreator = event.created_by === user.id;

  const { data: polls, empty, error } = await getPolls(eventId);

  if (error) {
    pollsList.innerHTML = "<p>Erreur lors du chargement.</p>";
    return;
  }

  if (empty) {
    pollsList.innerHTML = "<p>Aucun sondage pour le moment.</p>";
    return;
  }

  const MAX = 3;
  const visiblePolls = polls.slice(0, MAX);

  pollsList.innerHTML = visiblePolls
    .map(
      (p) => `
      <div class="poll-item">
        <p><strong>${p.question}</strong></p>
        <div class="poll-actions">
          <button class="open-poll-btn" data-id="${p.id}">Voir</button>
          ${isCreator ? `<button class="delete-poll-btn" data-id="${p.id}">Supprimer</button>` : ""}
        </div>
      </div>
    `
    )
    .join("");

  // Bouton voir plus
  if (polls.length > MAX) {
    pollsList.innerHTML += `
      <button id="show-more-polls">Voir tous les sondages (${polls.length})</button>
    `;
  }

  attachPollListeners(eventId, isCreator);

  const showMoreBtn = document.getElementById("show-more-polls");
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      pollsList.innerHTML = polls
        .map(
          (p) => `
          <div class="poll-item">
            <p><strong>${p.question}</strong></p>
            <div class="poll-actions">
              <button class="open-poll-btn" data-id="${p.id}">Voir</button>
              ${isCreator ? `<button class="delete-poll-btn" data-id="${p.id}">Supprimer</button>` : ""}
            </div>
          </div>
        `
        )
        .join("");

      // Réattacher les listeners pour la version complète
      attachPollListeners(eventId, isCreator);
    });
  }
}

function attachPollListeners(eventId, isCreator) {
  // Listener pour voir
  document.querySelectorAll(".open-poll-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pollId = btn.dataset.id;
      window.location.href = `pollDetail.html?id=${pollId}`;
    });
  });

  // Listener pour supprimer
  if (isCreator) {
    document.querySelectorAll(".delete-poll-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const pollId = btn.dataset.id;

        if (!confirm("Supprimer ce sondage ?")) return;

        const { error } = await deletePoll(pollId);

        if (error) {
          alert("Impossible de supprimer le sondage.");
          console.error(error);
          return;
        }

        alert("Sondage supprimé !");
        await loadPolls(eventId);
      });
    });
  }
}



init();
