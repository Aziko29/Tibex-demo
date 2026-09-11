/* ============================================================
   TIBEX — landing.js (hero navbat animatsiyasi, mobil menyu)
   ============================================================ */
(function () {
  // Theme init (shared key with demo app so the toggle feels consistent)
  const saved = localStorage.getItem("tibex_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);

  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle) toggle.addEventListener("click", () => links.classList.toggle("open"));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Live queue simulation in the hero (mirrors the real state-machine) ----
  const names = ["A. Yoqubov", "Z. Rahimova", "B. Islomov", "M. Tursunova", "R. G'ulomov", "S. Nurmatova", "U. Safarov", "N. Xolmatova"];
  const docs = ["Kardiolog", "Pediatr", "Nevrolog", "Ginekolog", "Ortoped", "LOR"];
  const cols = { waiting: document.getElementById("col-waiting"), progress: document.getElementById("col-progress"), done: document.getElementById("col-done") };
  if (cols.waiting && !reduceMotion) {
    let seq = 100;
    function makeTicket() {
      const n = names[Math.floor(Math.random() * names.length)];
      const d = docs[Math.floor(Math.random() * docs.length)];
      const el = document.createElement("div");
      el.className = "hv-ticket";
      el.innerHTML = `<div class="n">#${seq++} ${n}</div><div class="s">${d}</div>`;
      return el;
    }
    function moveOne() {
      // waiting -> progress
      if (cols.waiting.children.length) {
        const t = cols.waiting.firstElementChild;
        cols.progress.prepend(t);
        if (cols.progress.children.length > 2) cols.progress.removeChild(cols.progress.lastElementChild);
      }
      // progress -> done (the older one)
      if (cols.progress.children.length > 1) {
        const t = cols.progress.lastElementChild;
        cols.done.prepend(t);
        if (cols.done.children.length > 3) cols.done.removeChild(cols.done.lastElementChild);
      }
      // add a fresh one waiting
      cols.waiting.prepend(makeTicket());
      if (cols.waiting.children.length > 3) cols.waiting.removeChild(cols.waiting.lastElementChild);
    }
    for (let i = 0; i < 3; i++) cols.waiting.appendChild(makeTicket());
    cols.progress.appendChild(makeTicket());
    cols.done.appendChild(makeTicket());
    setInterval(moveOne, 2600);
  }

  // Smooth scroll for in-page nav
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); links && links.classList.remove("open"); }
    });
  });
})();
