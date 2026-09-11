(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("audit-log");
  if (!user) return;
  UI.setTitle("Audit jurnal");
  const content = document.getElementById("page-content");
  const log = DB.listAuditLog();
  content.innerHTML = `
    <div class="alert alert-info"><i class="fa-solid fa-clipboard-list"></i>Har bir yozuvchi amal shu yerda avtomatik qayd etiladi: kim, qachon, nima qildi. Demo rejimida shu sessiya davomida qilingan amallar ham shu ro'yxatga qo'shiladi.</div>
    <div class="table-wrap"><table class="tbx-table">
      <thead><tr><th>Foydalanuvchi</th><th>Amal</th><th>Obyekt</th><th>Vaqt</th></tr></thead>
      <tbody>${log.map(l => `<tr><td style="font-weight:600;">${UI.escapeHtml(l.user)}</td><td>${UI.escapeHtml(l.action)}</td><td class="muted">${UI.escapeHtml(l.target)}</td><td class="muted" style="font-family:var(--font-mono); font-size:12px;">${UI.fmtDateTime(l.timestamp)}</td></tr>`).join("")}</tbody>
    </table></div>`;
})();
