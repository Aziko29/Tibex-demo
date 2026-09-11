(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("appointments");
  if (!user) return;
  UI.setTitle("Qabul — navbat taxtasi");
  const canWrite = ["admin", "reception"].includes(user.role);
  const content = document.getElementById("page-content");

  const COLUMNS = [
    { key: "waiting", label: "Kutmoqda" },
    { key: "delayed", label: "Kechiktirildi" },
    { key: "in_progress", label: "Qabulda" },
    { key: "completed", label: "Yakunlandi" }
  ];
  // Next allowed actions per status, shown as buttons on each ticket.
  const ACTIONS = {
    waiting: [["in_progress", "Boshlash", "btn-teal"], ["delayed", "Kechiktir", ""], ["cancelled", "Bekor qil", "btn-danger"], ["no_show", "Kelmadi", ""]],
    delayed: [["in_progress", "Boshlash", "btn-teal"], ["cancelled", "Bekor qil", "btn-danger"], ["no_show", "Kelmadi", ""]],
    in_progress: [["completed", "Yakunlash", "btn-primary"]],
    completed: [], cancelled: [], no_show: []
  };

  function render() {
    const appts = DB.listAppointments().filter(a => new Date(a.datetime).toDateString() === new Date().toDateString());
    const closedOut = DB.listAppointments().filter(a => (a.status === "cancelled" || a.status === "no_show") && new Date(a.datetime).toDateString() === new Date().toDateString());

    content.innerHTML = `
      <div class="alert alert-info"><i class="fa-solid fa-diagram-project"></i>Bu — state-machine mantiqining jonli namunasi: har bir qabul faqat belgilangan holatlar orasida o'tishi mumkin (masalan, "Yakunlandi" holatidan orqaga qaytib bo'lmaydi).</div>
      <div class="section-row"><h2>Bugungi navbat</h2>${canWrite ? `<button class="btn btn-primary" id="book-btn"><i class="fa-solid fa-calendar-plus"></i> Qabul band qilish</button>` : ""}</div>
      <div class="board">
        ${COLUMNS.map(col => {
          const items = appts.filter(a => a.status === col.key).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
          return `<div class="board-col"><h4>${col.label} <span class="count">${items.length}</span></h4>
            ${items.map(a => ticketHtml(a)).join("") || `<p class="muted" style="font-size:12.5px;">Bo'sh</p>`}
          </div>`;
        }).join("")}
      </div>
      ${closedOut.length ? `<div class="card" style="margin-top:20px;"><h3 style="margin-top:0; font-size:14.5px;">Bekor qilingan / kelmagan</h3>
        <div class="table-wrap"><table class="tbx-table"><thead><tr><th>Vaqt</th><th>Bemor</th><th>Shifokor</th><th>Holat</th><th>Sabab</th></tr></thead><tbody>
        ${closedOut.map(a => { const p = DB.getPatient(a.patient_id), d = DB.getDoctor(a.doctor_id);
          return `<tr><td>${UI.fmtTime(a.datetime)}</td><td>${UI.escapeHtml(p?.fullname||"—")}</td><td>${UI.escapeHtml(d?.fullname||"—")}</td><td>${UI.statusBadge(a.status)}</td><td class="muted">${UI.escapeHtml(a.cancel_reason||"—")}</td></tr>`;
        }).join("")}</tbody></table></div></div>` : ""}`;

    if (canWrite) {
      document.getElementById("book-btn").addEventListener("click", openBookForm);
      content.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", () => {
        const { id, action } = btn.dataset;
        if (action === "cancelled" || action === "no_show") {
          UI.openModal(`<h3>${action === "cancelled" ? "Bekor qilish sababi" : "Kelmadi sababi"}</h3>
            <div class="field"><textarea id="reason-input" rows="3" placeholder="Sababni yozing...">${action === "cancelled" ? "Bemor tashrifni bekor qildi" : "Bemor kelmadi"}</textarea></div>
            <div class="modal-actions"><button class="btn" onclick="TIBEX_UI.closeModal()">Yopish</button><button class="btn btn-primary" id="confirm-reason">Tasdiqlash</button></div>`);
          document.getElementById("confirm-reason").addEventListener("click", () => {
            const res = DB.transitionAppointment(id, action, document.getElementById("reason-input").value.trim());
            UI.closeModal();
            if (!res.ok) UI.toast(res.reason, "error"); else { UI.toast("Holat yangilandi", "success"); render(); }
          });
        } else {
          const res = DB.transitionAppointment(id, action);
          if (!res.ok) UI.toast(res.reason, "error"); else { UI.toast("Holat yangilandi", "success"); render(); }
        }
      }));
    }
  }

  function ticketHtml(a) {
    const p = DB.getPatient(a.patient_id), d = DB.getDoctor(a.doctor_id);
    const acts = canWrite ? (ACTIONS[a.status] || []) : [];
    return `<div class="ticket">
      <div class="t-time">${UI.fmtTime(a.datetime)} · #${a.id}</div>
      <div class="t-name">${UI.escapeHtml(p?.fullname || "—")}</div>
      <div class="t-doc">${UI.escapeHtml(d?.fullname || "—")} — ${UI.escapeHtml(d?.specialty || "")}</div>
      <div class="t-actions">${acts.map(([status, label, cls]) => `<button class="btn btn-sm ${cls}" data-action="${status}" data-id="${a.id}">${label}</button>`).join("")}</div>
    </div>`;
  }

  function openBookForm() {
    const patients = DB.listPatients().filter(p => !p.deleted);
    const doctors = DB.listDoctors().filter(d => d.active);
    UI.openModal(`
      <h3>Qabul band qilish</h3>
      <div class="field"><label>Bemor</label><select id="f-patient">${patients.map(p => `<option value="${p.id}">${UI.escapeHtml(p.fullname)}</option>`).join("")}</select></div>
      <div class="field"><label>Shifokor</label><select id="f-doctor">${doctors.map(d => `<option value="${d.id}">${UI.escapeHtml(d.fullname)} — ${d.specialty}</option>`).join("")}</select></div>
      <div class="field-row">
        <div class="field"><label>Sana</label><input type="date" id="f-date" value="${new Date().toISOString().slice(0,10)}"></div>
        <div class="field"><label>Vaqt</label><input type="time" id="f-time" value="09:00"></div>
      </div>
      <p class="help-text"><i class="fa-solid fa-shield-halved"></i> Agar tanlangan shifokorda shu vaqt oralig'ida (±30 daqiqa) allaqachon band qilingan qabul bo'lsa, tizim buni bloklaydi — ikki bemorni bir vaqtga yozib bo'lmaydi.</p>
      <div class="modal-actions"><button class="btn" onclick="TIBEX_UI.closeModal()">Bekor qilish</button><button class="btn btn-primary" id="save-appt">Band qilish</button></div>`);

    document.getElementById("save-appt").addEventListener("click", () => {
      const date = document.getElementById("f-date").value, time = document.getElementById("f-time").value;
      if (!date || !time) { UI.toast("Sana va vaqtni tanlang", "error"); return; }
      const datetime = new Date(`${date}T${time}:00`).toISOString();
      const res = DB.bookAppointment({ patient_id: +document.getElementById("f-patient").value, doctor_id: +document.getElementById("f-doctor").value, datetime, created_by: user.role });
      if (!res.ok) { UI.toast(res.reason, "error"); }
      else { UI.closeModal(); UI.toast("Qabul band qilindi", "success"); render(); }
    });
  }

  render();
})();
