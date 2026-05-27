import { logout } from "../service/auth.js";

document.getElementById("logout").addEventListener("click", async () => {
  await logout();
  window.location.href = "../index.html";
});
