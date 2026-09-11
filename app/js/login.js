(function () {
  const DB = window.TIBEX_DB;
  if (DB.currentUser()) { window.location.href = "dashboard.html"; return; }

  const form = document.getElementById("login-form");
  const errBox = document.getElementById("err-box");

  function attempt(u, p) {
    const user = DB.login(u, p);
    if (user) { window.location.href = "dashboard.html"; }
    else { errBox.style.display = "block"; }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    attempt(document.getElementById("username").value.trim(), document.getElementById("password").value);
  });

  document.querySelectorAll(".demo-user-btn").forEach(btn => {
    btn.addEventListener("click", () => attempt(btn.dataset.u, btn.dataset.p));
  });
})();
