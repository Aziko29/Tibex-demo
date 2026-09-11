(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("payments");
  if (!user) return;
  UI.setTitle("To'lovlar");
  const isAdmin = user.role === "admin";
  const isCashier = user.role === "cashier" || isAdmin;
  const content = document.getElementById("page-content");

  function render() {
    const pays = DB.listPayments().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalDebt = pays.filter(p => p.status === "partial").reduce((s, p) => s + DB.debtFor(p), 0);
    const totalPaid = pays.filter(p => p.status !== "cancelled" && p.status !== "refunded").reduce((s, p) => s + p.paid, 0);

    content.innerHTML = `
      <div class="alert alert-info"><i class="fa-solid fa-arrows-turn-to-dots"></i>Qaytarim <b>2 bosqichda</b> ishlaydi: avval <b>admin</b> to'lovni bekor qiladi, so'ng <b>kassir</b> haqiqiy pulni qaytaradi. Bu tasodifiy pul qaytarishning oldini oladi.</div>
      <div class="kpi-grid" style="grid-template-columns:repeat(2,1fr); margin-bottom:20px;">
        <div class="kpi-card"><div class="kpi-icon ic-teal"><i class="fa-solid fa-sack-dollar"></i></div><h3>${UI.fmtMoney(totalPaid)}</h3><p>Jami tushum</p></div>
        <div class="kpi-card"><div class="kpi-icon ic-danger"><i class="fa-solid fa-scale-unbalanced"></i></div><h3>${UI.fmtMoney(totalDebt)}</h3><p>Jami qarzdorlik</p></div>
      </div>
      <div class="table-wrap"><table class="tbx-table">
        <thead><tr><th>#</th><th>Bemor</th><th>Sana</th><th>Summasi</th><th>To'langan</th><th>Qarz</th><th>Holat</th><th></th></tr></thead>
        <tbody>${pays.map(p => {
          const pat = DB.getPatient(p.patient_id);
          const debt = DB.debtFor(p);
          return `<tr>
            <td class="muted">#${p.id}</td>
            <td><a class="link-name" href="patient-detail.html?id=${p.patient_id}">${UI.escapeHtml(pat?.fullname || "—")}</a></td>
            <td class="muted">${UI.fmtDate(p.date)}</td>
            <td>${UI.fmtMoney(p.amount)}</td>
            <td>${UI.fmtMoney(p.paid)}</td>
            <td style="color:${debt > 0 ? "var(--danger)" : "inherit"}">${UI.fmtMoney(debt)}</td>
            <td>${UI.statusBadge(p.status)}</td>
            <td class="row-actions">
              ${isCashier && p.status === "partial" ? `<button class="btn btn-sm btn-teal pay-btn" data-id="${p.id}">To'la</button>` : ""}
              ${isAdmin && (p.status === "paid" || p.status === "partial") ? `<button class="btn btn-sm btn-danger cancel-btn" data-id="${p.id}">Bekor qil</button>` : ""}
              ${isCashier && p.status === "cancelled" ? `<button class="btn btn-sm btn-primary refund-btn" data-id="${p.id}">Qaytarish</button>` : ""}
            </td>
          </tr>`;
        }).join("")}</tbody>
      </table></div>`;

    content.querySelectorAll(".pay-btn").forEach(b => b.addEventListener("click", () => {
      const p = DB.getPayment(b.dataset.id);
      UI.openModal(`<h3>To'lovni qabul qilish</h3>
        <p style="font-size:13px;color:var(--text-secondary);">Qarzdorlik: <b>${UI.fmtMoney(DB.debtFor(p))}</b></p>
        <div class="field"><label>Summasi (so'm)</label><input type="number" id="pay-amount" value="${DB.debtFor(p)}" max="${DB.debtFor(p)}"></div>
        <div class="modal-actions"><button class="btn" onclick="TIBEX_UI.closeModal()">Bekor qilish</button><button class="btn btn-primary" id="confirm-pay">Qabul qilish</button></div>`);
      document.getElementById("confirm-pay").addEventListener("click", () => {
        const amt = +document.getElementById("pay-amount").value;
        if (!amt || amt <= 0) { UI.toast("Summani kiriting", "error"); return; }
        DB.payAppointment(p.appointment_id, Math.min(amt, DB.debtFor(p)));
        UI.closeModal(); UI.toast("To'lov qabul qilindi", "success"); render();
      });
    }));
    content.querySelectorAll(".cancel-btn").forEach(b => b.addEventListener("click", () => {
      DB.cancelPayment(b.dataset.id); UI.toast("To'lov bekor qilindi (1-bosqich) — endi kassir qaytarishi mumkin", "success"); render();
    }));
    content.querySelectorAll(".refund-btn").forEach(b => b.addEventListener("click", () => {
      const res = DB.refundPayment(b.dataset.id);
      if (!res.ok) UI.toast(res.reason, "error"); else { UI.toast("Pul qaytarildi (2-bosqich)", "success"); render(); }
    }));
  }

  render();
})();
