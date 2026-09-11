(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("patients");
  if (!user) return;

  const id = new URLSearchParams(location.search).get("id");
  const patient = DB.getPatient(id);
  const content = document.getElementById("page-content");
  if (!patient) {
    UI.setTitle("Topilmadi");
    content.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Bemor topilmadi. <a href="patients.html">Ro'yxatga qaytish</a></div>`;
    return;
  }
  UI.setTitle(patient.fullname);

  const appts = DB.listAppointments().filter(a => a.patient_id === patient.id).sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
  const pays = DB.listPayments().filter(p => p.patient_id === patient.id);
  const labs = DB.listLabResults().filter(l => l.patient_id === patient.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const admission = DB.listAdmissions().find(a => a.patient_id === patient.id && !a.discharge_date);

  content.innerHTML = `
    <a href="patients.html" style="font-size:13px; color:var(--text-secondary); text-decoration:none; display:inline-flex; gap:6px; margin-bottom:16px;"><i class="fa-solid fa-arrow-left"></i> Bemorlar ro'yxati</a>
    <div class="grid-2" style="margin-bottom:20px;">
      <div class="card">
        <div style="display:flex; gap:14px; align-items:center; margin-bottom:16px;">
          <div class="mini-avatar" style="width:52px;height:52px;font-size:18px;">${UI.initials(patient.fullname)}</div>
          <div><h2 style="margin:0;">${UI.escapeHtml(patient.fullname)}</h2><p class="muted" style="margin:2px 0 0;">${patient.phone}</p></div>
        </div>
        <div class="stat-line"><span>Tug'ilgan sana</span><b>${patient.birthdate}</b></div>
        <div class="stat-line"><span>Jinsi</span><b>${patient.gender === "M" ? "Erkak" : "Ayol"}</b></div>
        <div class="stat-line"><span>Manzil</span><b>${UI.escapeHtml(patient.address)}</b></div>
        <div class="stat-line"><span>Allergiyalar</span><b style="color:${patient.allergies !== "—" ? "var(--danger)" : "inherit"}">${UI.escapeHtml(patient.allergies)}</b></div>
        <div class="stat-line"><span>Surunkali kasallik</span><b>${UI.escapeHtml(patient.chronic)}</b></div>
        ${admission ? `<div class="alert alert-warning" style="margin-top:14px;"><i class="fa-solid fa-bed-pulse"></i>Hozir statsionarda: xona ${admission.room} (${UI.fmtDate(admission.admit_date)} dan)</div>` : ""}
      </div>
      <div class="card">
        <h3 style="margin-top:0;">Moliyaviy holat</h3>
        <div class="stat-line"><span>Jami qabullar</span><b>${appts.length}</b></div>
        <div class="stat-line"><span>Jami to'langan</span><b>${UI.fmtMoney(pays.reduce((s, p) => s + p.paid, 0))}</b></div>
        <div class="stat-line"><span>Joriy qarzdorlik</span><b style="color:var(--danger)">${UI.fmtMoney(pays.filter(p=>p.status==="partial").reduce((s, p) => s + DB.debtFor(p), 0))}</b></div>
        <div class="stat-line"><span>Tahlillar soni</span><b>${labs.length}</b></div>
      </div>
    </div>
    <div class="card">
      <div class="tabs">
        <button class="tab-btn active" data-tab="history">Davolanish tarixi</button>
        <button class="tab-btn" data-tab="labs">Tahlil natijalari</button>
        <button class="tab-btn" data-tab="payments">To'lovlar</button>
      </div>
      <div id="tab-history"></div>
      <div id="tab-labs" style="display:none;"></div>
      <div id="tab-payments" style="display:none;"></div>
    </div>`;

  document.getElementById("tab-history").innerHTML = appts.length ? `<div class="timeline">
    ${appts.map(a => {
      const doc = DB.getDoctor(a.doctor_id);
      return `<div class="timeline-item"><div class="tl-date">${UI.fmtDateTime(a.datetime)}</div><div class="tl-title">${UI.escapeHtml(doc?.fullname || "—")} — ${UI.escapeHtml(doc?.specialty || "")}</div>${UI.statusBadge(a.status)} ${a.cancel_reason ? `<span class="muted" style="font-size:12px;"> · ${UI.escapeHtml(a.cancel_reason)}</span>` : ""}</div>`;
    }).join("")}
  </div>` : `<div class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i>Davolanish tarixi yo'q</div>`;

  document.getElementById("tab-labs").innerHTML = labs.length ? labs.map(l => `
    <div style="margin-bottom:18px;">
      <div class="section-row" style="margin-bottom:8px;"><h2 style="font-size:14.5px;">${UI.escapeHtml(l.template)}</h2><span class="muted" style="font-size:12px;">${UI.fmtDate(l.date)}</span></div>
      <div class="table-wrap"><table class="tbx-table"><thead><tr><th>Ko'rsatkich</th><th>Natija</th><th>Me'yor</th><th>Holat</th></tr></thead><tbody>
        ${l.indicators.map(i => `<tr><td>${i.name}</td><td>${i.value} ${i.unit}</td><td class="muted">${i.ref_low}–${i.ref_high} ${i.unit}</td><td>${UI.flagBadge(i.flag)}</td></tr>`).join("")}
      </tbody></table></div>
    </div>`).join("") : `<div class="empty-state"><i class="fa-solid fa-vial"></i>Tahlil natijalari yo'q</div>`;

  document.getElementById("tab-payments").innerHTML = pays.length ? `<div class="table-wrap"><table class="tbx-table"><thead><tr><th>Sana</th><th>Summasi</th><th>To'langan</th><th>Qarz</th><th>Holat</th></tr></thead><tbody>
    ${pays.map(p => `<tr><td>${UI.fmtDate(p.date)}</td><td>${UI.fmtMoney(p.amount)}</td><td>${UI.fmtMoney(p.paid)}</td><td>${UI.fmtMoney(DB.debtFor(p))}</td><td>${UI.statusBadge(p.status)}</td></tr>`).join("")}
  </tbody></table></div>` : `<div class="empty-state"><i class="fa-solid fa-credit-card"></i>To'lovlar yo'q</div>`;

  document.querySelectorAll(".tab-btn").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    ["history", "labs", "payments"].forEach(t => document.getElementById("tab-" + t).style.display = t === btn.dataset.tab ? "" : "none");
  }));
})();
