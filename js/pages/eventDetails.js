import { supabase } from "../utils/supabase.js";
import { getMembers, addMember, removeMember } from "../service/eventMembers.js";
import { getPolls, createPoll, deletePoll } from "../service/polls.js";

async function init() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  if (!eventId) {
    document.getElementById("event-container").innerHTML =
      "<p>Événement introuvable.</p>";
    return;
  }

  const { data: access, error: accessError } = await supabase.rpc(
    "get_event_access",
    { p_event_id: eventId }
  );

  if (accessError) {
    console.error(accessError);
    document.getElementById("event-container").innerHTML =
      "<p>Erreur lors de la vérification des accès.</p>";
    return;
  }

  if (!access.can_view) {
    document.getElementById("event-container").innerHTML =
      "<p>Cet événement est privé. Vous devez être invité pour y accéder.</p>";
    return;
  }

  const event = access.event;
  const isCreator = access.is_creator;
  const isMember = access.is_member;
  const canJoin = access.can_join;
  const canInvite = access.can_invite;
  const canManage = access.can_manage;

  await renderEvent(event, isMember, isCreator, canJoin, canInvite);

  if (canJoin) {
    setupJoinButton(eventId);
    return;
  }

  if (canInvite) {
    setupInviteButton(eventId, event);
  }

  if (isMember) {
    setupCreatePollButton(eventId, event);
    await loadMembers(eventId, event, canManage);
    await loadPolls(eventId, canManage);
  }
}

async function renderEvent(event, isMember, isCreator, canJoin, canInvite) {
  document.getElementById("event-container").innerHTML = `
    <h2>${event.title}</h2>
    <p>${event.description}</p>
    <p><strong>Type :</strong> ${event.is_private ? "Privé" : "Public"}</p>

    ${
      canJoin
        ? `<button id="join-btn" class="primary-btn">Rejoindre l'événement</button>`
        : `
          <h3>Participants</h3>
          <div class="section-block" id="members-list">Chargement...</div>

          <h3>Sondages</h3>
          <div class="section-block" id="polls-list">Chargement...</div>
          <button id="create-poll-btn">Créer un sondage</button>
        `
    }

    ${
      canInvite
        ? `<button id="invite-btn" class="secondary-btn">Inviter un membre</button>`
        : ""
    }
  `;
}

function setupJoinButton(eventId) {
  const btn = document.querySelector("#join-btn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await addMember(eventId, user.id);

    if (error) {
      alert("Impossible de rejoindre l'événement.");
      console.error("Erreur join event:", error);
      return;
    }

    alert("Vous avez rejoint l'événement !");
    await new Promise((resolve) => setTimeout(resolve, 200));
    init();
  });
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

async function loadMembers(eventId, event, canManage) {
  const creatorId = event.created_by;
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
        <div class="member-item">
          <p>${m.profiles.full_name} (${m.profiles.email}) — ${m.role}</p>
          ${
            canManage && m.profiles.id !== creatorId
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
      await loadMembers(eventId, event, canManage);
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

async function loadPolls(eventId, canManage) {
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

  const MAX = 3;
  const visiblePolls = polls.slice(0, MAX);

  pollsList.innerHTML = visiblePolls
    .map(
      (p) => `
        <div class="poll-item">
          <p><strong>${p.question}</strong></p>
          <div class="poll-actions">
            <button class="open-poll-btn" data-id="${p.id}">Voir</button>
            ${
              canManage
                ? `<button class="delete-poll-btn" data-id="${p.id}">Supprimer</button>`
                : ""
            }
          </div>
        </div>
      `
    )
    .join("");

  if (polls.length > MAX) {
    pollsList.innerHTML += `
      <button id="show-more-polls">Voir tous les sondages (${polls.length})</button>
    `;
  }

  attachPollListeners(eventId, canManage);

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
                ${
                  canManage
                    ? `<button class="delete-poll-btn" data-id="${p.id}">Supprimer</button>`
                    : ""
                }
              </div>
            </div>
          `
        )
        .join("");

      attachPollListeners(eventId, canManage);
    });
  }
}

function attachPollListeners(eventId, canManage) {
  document.querySelectorAll(".open-poll-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pollId = btn.dataset.id;
      window.location.href = `pollDetail.html?id=${pollId}`;
    });
  });

  if (canManage) {
    document.querySelectorAll(".delete-poll-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const pollId = btn.dataset.id;

        if (!confirm("Supprimer ce sondage ?")) return;

        const { error } = await deletePoll(pollId);

        if (error) {
          alert("Impossible de supprimer le sondage.");
          return;
        }

        alert("Sondage supprimé !");
        await loadPolls(eventId, canManage);
      });
    });
  }
}

init();
