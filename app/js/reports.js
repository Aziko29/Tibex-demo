(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("reports");
  if (!user) return;
  UI.setTitle("Hisobotlar");
  const content = document.getElementById("page-content");

  const doctors = DB.listDoctors();
  const appts = DB.listAppointments();
  const perDoctor = doctors.map(d => ({ d, count: appts.filter(a => a.doctor_id === d.id && a.status === "completed").length }));
  const cancelReasons = {};
  appts.filter(a => a.status === "cancelled" || a.status === "no_show").forEach(a => {
    const key = a.cancel_reason || "Sabab ko'rsatilmagan";
    cancelReasons[key] = (cancelReasons[key] || 0) + 1;
  });

  content.innerHTML = `
    <div class="grid-2" style="margin-bottom:20px;">
      <div class="card"><h2 style="font-size:15px; margin-top:0;">Shifokor samaradorligi (yakunlangan qabullar)</h2><canvas id="c1" height="200"></canvas></div>
      <div class="card"><h2 style="font-size:15px; margin-top:0;">Bekor qilish sabablari</h2><canvas id="c2" height="200"></canvas></div>
    </div>
    <div class="card"><h2 style="font-size:15px; margin-top:0;">Band vaqt tahlili (soatlar bo'yicha, namuna)</h2><canvas id="c3" height="140"></canvas></div>`;

  new Chart(document.getElementById("c1"), {
    type: "bar",
    data: { labels: perDoctor.map(x => x.d.fullname.split(" ")[0]), datasets: [{ label: "Yakunlangan qabullar", data: perDoctor.map(x => x.count), backgroundColor: "#0EA5A0", borderRadius: 6 }] },
    options: { indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
  });
  new Chart(document.getElementById("c2"), {
    type: "pie",
    data: { labels: Object.keys(cancelReasons).length ? Object.keys(cancelReasons) : ["Bekor qilish yo'q"], datasets: [{ data: Object.keys(cancelReasons).length ? Object.values(cancelReasons) : [1], backgroundColor: ["#EF4444", "#94A3B8", "#F59E0B"] }] },
    options: { plugins: { legend: { position: "bottom" } } }
  });
  new Chart(document.getElementById("c3"), {
    type: "line",
    data: { labels: ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"], datasets: [{ label: "Band foizi (%)", data: [20,55,78,90,60,40,70,85,45], borderColor: "#2454D6", backgroundColor: "rgba(36,84,214,.12)", fill: true, tension: .35 }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
  });
})();
