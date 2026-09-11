/**
 * TIBEX Demo — UI helper funksiyalari
 * Shell, sidebar, modal, toast, formatlash va badge'lar
 */
(function () {
  const DB = window.TIBEX_DB;

  // ─── Konstantalar ─────────────────────────────────────────
  const STATUS_LABEL = {
    waiting:     "Kutmoqda",
    delayed:     "Kechiktirildi",
    in_progress: "Qabulda",
    completed:   "Yakunlandi",
    cancelled:   "Bekor qilindi",
    no_show:     "Kelmadi",
    paid:        "To'langan",
    partial:     "Qismiy",
    refunded:    "Qaytarilgan"
  };

  const STATUS_TONE = {
    waiting: "info", delayed: "warning", in_progress: "teal",
    completed: "success", cancelled: "danger", no_show: "muted",
    paid: "success", partial: "warning", refunded: "muted"
  };

  const ROLE_LABEL = {
    admin: "Administrator", reception: "Qabulxona", doctor: "Shifokor",
    cashier: "Kassir", lab_doctor: "Lab. shifokor", assistant: "Yordamchi admin"
  };

  const MENU = [
    { key: "dashboard",    label: "Dashboard",     icon: "fa-chart-pie",        href: "dashboard.html" },
    { key: "patients",     label: "Bemorlar",      icon: "fa-user-injured",     href: "patients.html" },
    { key: "appointments", label: "Qabul",         icon: "fa-calendar-check",   href: "appointments.html" },
    { key: "doctors",      label: "Doktorlar",     icon: "fa-user-md",          href: "doctors.html" },
    { key: "payments",     label: "To'lovlar",     icon: "fa-credit-card",      href: "payments.html" },
    { key: "lab-results",  label: "Tahlillar",     icon: "fa-vial",             href: "lab-results.html" },
    { key: "reports",      label: "Hisobotlar",    icon: "fa-chart-line",       href: "reports.html" },
    { key: "audit-log",    label: "Audit jurnal",  icon: "fa-clipboard-list",   href: "audit-log.html" },
    { key: "settings",     label: "Sozlamalar",    icon: "fa-gear",             href: "settings.html" }
  ];

  // ─── Escape ───────────────────────────────────────────────
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ─── Formatlash ───────────────────────────────────────────
  function fmtMoney(n) {
    if (n == null || isNaN(n)) return "0 so'm";
    return new Intl.NumberFormat("uz-UZ").format(Math.round(n)) + " so'm";
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" });
  }

  function fmtTime(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtDateTime(iso) {
    if (!iso) return "—";
    return fmtDate(iso) + " " + fmtTime(iso);
  }

  function initials(name) {
    if (!name) return "?";
    return name.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }

  // ─── Badge'lar ────────────────────────────────────────────
  function statusBadge(status) {
    const label = STATUS_LABEL[status] || status;
    const tone = STATUS_TONE[status] || "muted";
    return `<span class="badge badge-${tone}">${escapeHtml(label)}</span>`;
  }

  function flagBadge(flag) {
    const map = { "me'yorda": "success", "past": "info", "yuqori": "danger" };
    return `<span class="badge badge-${map[flag] || "muted"}">${escapeHtml(flag)}</span>`;
  }

  // ─── Toast ────────────────────────────────────────────────
  function ensureToastHost() {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(message, type = "info") {
    const host = ensureToastHost();
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    const icon = { success: "fa-circle-check", error: "fa-circle-exclamation", info: "fa-circle-info", warning: "fa-triangle-exclamation" }[type] || "fa-circle-info";
    el.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  // ─── Modal ────────────────────────────────────────────────
  function openModal(innerHtml) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "modal-overlay";
    overlay.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${innerHtml}</div>`;
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));
    // ESC
    overlay._esc = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", overlay._esc);
  }

  function closeModal() {
    const o = document.getElementById("modal-overlay");
    if (!o) return;
    if (o._esc) document.removeEventListener("keydown", o._esc);
    o.classList.remove("show");
    setTimeout(() => o.remove(), 200);
  }

  // ─── Theme ────────────────────────────────────────────────
  function applyTheme() {
    const saved = localStorage.getItem("tibex_theme") || "light";
    document.documentElement.dataset.theme = saved;
  }
  function toggleTheme() {
    const cur = document.documentElement.dataset.theme || "light";
    const next = cur === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("tibex_theme", next);
    toast(`Mavzu: ${next === "dark" ? "Tungi" : "Kunduzgi"}`, "info");
  }
  applyTheme();

  // ─── Shell (sidebar + topbar) ─────────────────────────────
  function renderShell(activeKey) {
    const user = DB.currentUser();
    if (!user) { window.location.href = "login.html"; return null; }

    const allowed = DB.ROLE_PAGES[user.role] || [];
    if (!allowed.includes(activeKey)) {
      window.location.href = allowed[0] ? allowed[0] + ".html" : "login.html";
      return null;
    }

    const shell = document.getElementById("app-shell");
    const menuItems = MENU.filter(m => allowed.includes(m.key));

    shell.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <i class="fa-solid fa-heart-pulse"></i>
          <span>TIBEX</span>
        </div>
        <nav class="sidebar-nav">
          ${menuItems.map(m => `
            <a class="nav-item ${m.key === activeKey ? "active" : ""}" href="${m.href}">
              <i class="fa-solid ${m.icon}"></i><span>${m.label}</span>
            </a>`).join("")}
        </nav>
        <div class="sidebar-foot">
          <div class="user-chip">
            <div class="mini-avatar">${initials(user.fullname)}</div>
            <div class="user-meta">
              <b>${escapeHtml(user.fullname)}</b>
              <span>${ROLE_LABEL[user.role]}</span>
            </div>
          </div>
          <button class="btn btn-sm logout-btn" id="logout-btn"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="nav-toggle-btn" id="sidebar-toggle" aria-label="Menyu"><i class="fa-solid fa-bars"></i></button>
          <h1 id="page-title" class="page-title">—</h1>
          <div class="topbar-actions">
            <span class="demo-pill"><i class="fa-solid fa-flask"></i> Demo</span>
            <a class="icon-btn" href="https://github.com/Aziko29/tibex" target="_blank" rel="noopener" title="GitHub"><i class="fa-brands fa-github"></i></a>
          </div>
        </header>
        <main class="page-content" id="page-content"></main>
      </div>`;

    document.getElementById("logout-btn").addEventListener("click", () => { DB.logout(); window.location.href = "login.html"; });
    document.getElementById("sidebar-toggle").addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
    });

    return user;
  }

  function setTitle(t) {
    const el = document.getElementById("page-title");
    if (el) el.textContent = t;
    document.title = t + " · TIBEX Demo";
  }

  // ─── Eksport ──────────────────────────────────────────────
  window.TIBEX_UI = {
    STATUS_LABEL, STATUS_TONE, ROLE_LABEL, MENU,
    escapeHtml, fmtMoney, fmtDate, fmtTime, fmtDateTime, initials,
    statusBadge, flagBadge, toast, openModal, closeModal,
    applyTheme, toggleTheme, renderShell, setTitle
  };
})();