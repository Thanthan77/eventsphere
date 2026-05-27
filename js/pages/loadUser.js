import { requireAuth } from "../service/session.js";
import { getUser } from "../service/user.js";

async function init() {
  await requireAuth(); 

  const user = await getUser(); 

  if (user) {
    document.getElementById("userEmail").textContent = user.email;
  }
}

init();
