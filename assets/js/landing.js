/* TIBEX — Landing jonli navbat simulyatsiyasi */
(function () {
  const COLUMNS = {
    waiting:     [],
    in_progress: [],
    completed:   []
  };
  const NAMES = [
    "Aliyev S.", "Karimova N.", "Rahimov J.", "Tosheva D.",
    "Ergashev B.", "Yusupova M.", "Nazarov A.", "Sattorova L.",
    "Xolmatov R.", "Ibrohimova Z."
  ];
  const DOCS = ["Dr. Toshmatov", "Dr. Yusupova", "Dr. Aliyev", "Dr. Nazarova"];
  let idCounter = 100;

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function timeStr() {
    const h = 9 + Math.floor(Math.random() * 6);
    const m = Math.floor(Math.random() * 60);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  }

  function addTicket() {
    const ticket = {
      id: ++idCounter,
      name: pick(NAMES),
      doc: pick(DOCS),
      time: timeStr()
    };
    COLUMNS.waiting.unshift(ticket);
    render();

    // Kutish → Qabulda (2-5s)
    setTimeout(() => {
      const idx = COLUMNS.waiting.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        COLUMNS.waiting.splice(idx, 1);
        COLUMNS.in_progress.unshift(ticket);
        render();

        // Qabulda → Yakunlandi (3-6s)
        setTimeout(() => {
          const i2 = COLUMNS.in_progress.findIndex(t => t.id === ticket.id);
          if (i2 !== -1) {
            COLUMNS.in_progress.splice(i2, 1);
            COLUMNS.completed.unshift(ticket);
            if (COLUMNS.completed.length > 4) COLUMNS.completed.pop();
            render();
          }
        }, 3000 + Math.random() * 3000);
      }
    }, 2000 + Math.random() * 3000);
  }

  function ticketHtml(t) {
    return `<div class="hv-card" data-id="${t.id}">
      <b>${t.name}</b>
      <span>${t.time} · ${t.doc}</span>
    </div>`;
  }

  function render() {
    const w = document.getElementById("col-waiting");
    const p = document.getElementById("col-progress");
    const d = document.getElementById("col-done");
    if (!w || !p || !d) return;
    w.innerHTML = COLUMNS.waiting.slice(0, 3).map(ticketHtml).join("") || `<div class="muted" style="font-size:10.5px;">—</div>`;
    p.innerHTML = COLUMNS.in_progress.slice(0, 3).map(ticketHtml).join("") || `<div class="muted" style="font-size:10.5px;">—</div>`;
    d.innerHTML = COLUMNS.completed.slice(0, 3).map(ticketHtml).join("") || `<div class="muted" style="font-size:10.5px;">—</div>`;
  }

  // Boshlang'ich 2 ta
  addTicket();
  setTimeout(addTicket, 800);

  // Har 4-8s da yangi
  setInterval(() => {
    if (COLUMNS.waiting.length < 3) addTicket();
  }, 4500);

  // Nav toggle
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  }
})();