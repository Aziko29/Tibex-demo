(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("settings");
  if (!user) return;
  UI.setTitle("Sozlamalar");
  const content = document.getElementById("page-content");
  content.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <h2 style="margin-top:0;font-size:15px;">Profil</h2>
        <div class="stat-line"><span>Ism</span><b>${UI.escapeHtml(user.fullname)}</b></div>
        <div class="stat-line"><span>Login</span><b>${user.username}</b></div>
        <div class="stat-line"><span>Rol</span><b>${UI.ROLE_LABEL[user.role]}</b></div>
        <p class="help-text" style="margin-top:10px;">Demo rejimida profil ma'lumotlarini tahrirlash o'chirilgan.</p>
      </div>
      <div class="card">
        <h2 style="margin-top:0;font-size:15px;">Ko'rinish</h2>
        <p class="help-text" style="margin-bottom:12px;">Dark / Light mavzusini almashtirish.</p>
        <button class="btn btn-primary" id="theme-btn"><i class="fa-solid fa-circle-half-stroke"></i> Mavzuni almashtirish</button>
        <div style="margin-top:22px; border-top:1px solid var(--border-color); padding-top:16px;">
          <h2 style="margin-top:0;font-size:15px;">Demo ma'lumotlarini tozalash</h2>
          <p class="help-text" style="margin-bottom:12px;">Barcha o'zgarishlarni bekor qilib, dastlabki namunaviy ma'lumotlarga qaytaring.</p>
          <button class="btn btn-danger" id="reset-btn"><i class="fa-solid fa-rotate-left"></i> Demo'ni qayta tiklash</button>
        </div>
      </div>
    </div>`;
  document.getElementById("theme-btn").addEventListener("click", UI.toggleTheme);
  document.getElementById("reset-btn").addEventListener("click", () => {
    UI.openModal(`<h3>Demo'ni qayta tiklash</h3><p style="font-size:13.5px;color:var(--text-secondary);">Barcha qo'shilgan/o'zgartirilgan ma'lumotlar o'chiriladi va dastlabki namuna qayta yuklanadi. Davom etasizmi?</p>
      <div class="modal-actions"><button class="btn" onclick="TIBEX_UI.closeModal()">Bekor qilish</button><button class="btn btn-danger" id="confirm-reset">Tiklash</button></div>`);
    document.getElementById("confirm-reset").addEventListener("click", () => {
      DB.reset(); UI.closeModal(); window.location.href = "login.html";
    });
  });
})();
