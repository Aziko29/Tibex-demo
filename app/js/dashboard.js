(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("dashboard");
  if (!user) return;
  UI.setTitle("Dashboard");

  const appts = DB.listAppointments();
  const pays = DB.listPayments();
  const patients = DB.listPatients().filter(p => !p.deleted);
  const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

  const todayAppts = appts.filter(a => isToday(a.datetime));
  const waitingNow = appts.filter(a => a.status === "waiting" || a.status === "in_progress");
  const todayRevenue = pays.filter(p => isToday(p.date) && p.status !== "cancelled" && p.status !== "refunded").reduce((s, p) => s + p.paid, 0);
  const totalDebt = pays.filter(p => p.status === "partial").reduce((s, p) => s + DB.debtFor(p), 0);

  const content = document.getElementById("page-content");
  content.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-icon ic-blue"><i class="fa-solid fa-calendar-day"></i></div><h3>${todayAppts.length}</h3><p>Bugungi qabullar</p></div>
      <div class="kpi-card"><div class="kpi-icon ic-teal"><i class="fa-solid fa-users"></i></div><h3>${patients.length}</h3><p>Jami bemorlar</p></div>
      <div class="kpi-card"><div class="kpi-icon ic-gold"><i class="fa-solid fa-sack-dollar"></i></div><h3>${UI.fmtMoney(todayRevenue)}</h3><p>Bugungi tushum</p></div>
      <div class="kpi-card"><div class="kpi-icon ic-danger"><i class="fa-solid fa-triangle-exclamation"></i></div><h3>${UI.fmtMoney(totalDebt)}</h3><p>Jami qarzdorlik</p></div>
    </div>
    <div class="grid-2" style="margin-bottom:22px;">
      <div class="card">
        <div class="section-row"><h2>Haftalik qabullar (namuna)</h2></div>
        <canvas id="chart-week" height="170"></canvas>
      </div>
      <div class="card">
        <div class="section-row"><h2>Qabul holatlari</h2></div>
        <canvas id="chart-status" height="170"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="section-row"><h2>Jonli navbat</h2><a class="btn btn-sm" href="appointments.html">Barchasi <i class="fa-solid fa-arrow-right"></i></a></div>
      ${waitingNow.length ? `<div class="table-wrap"><table class="tbx-table"><thead><tr><th>Vaqt</th><th>Bemor</th><th>Shifokor</th><th>Holat</th></tr></thead><tbody>
        ${waitingNow.slice(0, 6).map(a => {
          const p = DB.getPatient(a.patient_id), d = DB.getDoctor(a.doctor_id);
          return `<tr><td>${UI.fmtTime(a.datetime)}</td><td>${UI.escapeHtml(p?.fullname || "—")}</td><td>${UI.escapeHtml(d?.fullname || "—")}</td><td>${UI.statusBadge(a.status)}</td></tr>`;
        }).join("")}
      </tbody></table></div>` : `<div class="empty-state"><i class="fa-solid fa-mug-hot"></i>Hozircha navbatda hech kim yo'q</div>`}
    </div>`;

  const days = ["Dush", "Sesh", "Chor", "Pay", "Juma", "Shan", "Yak"];
  new Chart(document.getElementById("chart-week"), {
    type: "bar",
    data: { labels: days, datasets: [{ label: "Qabullar soni", data: [14, 19, 12, 22, 27, 9, 3], backgroundColor: "#2454D6", borderRadius: 6 }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: "rgba(148,163,184,.15)" } }, x: { grid: { display: false } } } }
  });

  const statusCounts = {};
  appts.forEach(a => statusCounts[a.status] = (statusCounts[a.status] || 0) + 1);
  new Chart(document.getElementById("chart-status"), {
    type: "doughnut",
    data: {
      labels: Object.keys(statusCounts).map(k => UI.STATUS_LABEL[k] || k),
      datasets: [{ data: Object.values(statusCounts), backgroundColor: ["#3B82F6", "#0EA5A0", "#10B981", "#F59E0B", "#EF4444", "#94A3B8"] }]
    },
    options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } } }
  });
})();
