/* ============================================================
   TIBEX DEMO — ui.js  (sidebar, topbar, toast, modal, guards)
   ============================================================ */
(function (global) {
  const DB = global.TIBEX_DB;

  const MENU = [
    { key: "dashboard", href: "dashboard.html", icon: "fa-chart-pie", label: "Dashboard", roles: ["admin", "reception", "doctor", "cashier", "lab_doctor", "assistant_admin"] },
    { key: "patients", href: "patients.html", icon: "fa-user-injured", label: "Bemorlar", roles: ["admin", "reception", "doctor", "assistant_admin"] },
    { key: "appointments", href: "appointments.html", icon: "fa-calendar-check", label: "Qabul", roles: ["admin", "reception", "doctor", "assistant_admin"] },
    { key: "doctors", href: "doctors.html", icon: "fa-user-md", label: "Doktorlar", roles: ["admin", "reception", "assistant_admin"] },
    { key: "lab-results", href: "lab-results.html", icon: "fa-vial", label: "Tahlil natijalari", roles: ["admin", "doctor", "lab_doctor", "assistant_admin"] },
    { key: "payments", href: "payments.html", icon: "fa-credit-card", label: "To'lovlar", roles: ["admin", "cashier", "assistant_admin"] },
    { key: "reports", href: "reports.html", icon: "fa-file-invoice-dollar", label: "Hisobot", roles: ["admin", "assistant_admin"] },
    { key: "audit-log", href: "audit-log.html", icon: "fa-clipboard-list", label: "Audit jurnal", roles: ["admin", "assistant_admin"] },
    { key: "settings", href: "settings.html", icon: "fa-gear", label: "Sozlamalar", roles: ["admin", "reception", "doctor", "cashier", "lab_doctor", "assistant_admin"] }
  ];

  const ROLE_LABEL = {
    admin: "Administrator", reception: "Qabulxona", doctor: "Shifokor",
    cashier: "Kassir", lab_doctor: "Lab. shifokor", assistant_admin: "Yordamchi admin (faqat o'qish)"
  };

  function requireAuth() {
    const user = DB.currentUser();
    if (!user) { window.location.href = "login.html"; return null; }
    return user;
  }

  function initTheme() {
    const stored = localStorage.getItem("tibex_theme") || "light";
    document.documentElement.setAttribute("data-theme", stored);
  }
  initTheme();

  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem("tibex_theme", cur);
  }

  function initials(name) {
    return (name || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  }

  function renderShell(activeKey) {
    const user = requireAuth();
    if (!user) return null;
    const root = document.getElementById("app-shell");
    if (!root) return user;

    const items = MENU.filter(m => m.roles.includes(user.role));
    root.innerHTML = `
      <aside class="sidebar">
        <a href="dashboard.html" class="brand"><i class="fa-solid fa-heart-pulse"></i><span>TIBEX</span></a>
        <div class="user-badge">
          <div class="avatar">${initials(user.fullname)}</div>
          <div class="user-badge-info">
            <div class="name">${user.fullname}</div>
            <div class="role">${ROLE_LABEL[user.role] || user.role}</div>
          </div>
          <i class="fa-solid fa-arrow-right-from-bracket logout-link" id="logout-btn" title="Chiqish"></i>
        </div>
        <ul class="menu-list">
          ${items.map(m => `<li class="menu-item ${m.key === activeKey ? "active" : ""}">
              <a href="${m.href}"><i class="fa-solid ${m.icon}"></i><span>${m.label}</span></a>
            </li>`).join("")}
        </ul>
        <div class="sidebar-footer">
          <button class="theme-toggle" id="theme-toggle-btn"><i class="fa-solid fa-circle-half-stroke"></i><span>Mavzu</span></button>
          <a class="back-to-site" href="../index.html"><i class="fa-solid fa-arrow-left"></i><span>Reklama saytiga</span></a>
        </div>
      </aside>
      <div class="main-col">
        <header class="topbar">
          <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menyu"><i class="fa-solid fa-bars"></i></button>
          <div class="topbar-title" id="topbar-title"></div>
          <span class="demo-pill"><i class="fa-solid fa-flask"></i> DEMO rejimi — ma'lumotlar shu brauzerda saqlanadi</span>
        </header>
        <main class="content" id="page-content"></main>
      </div>`;

    document.getElementById("logout-btn").addEventListener("click", () => {
      DB.logout();
      window.location.href = "login.html";
    });
    document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);
    document.getElementById("mobile-menu-btn").addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("open");
    });
    return user;
  }

  function setTitle(text) {
    const t = document.getElementById("topbar-title");
    if (t) t.textContent = text;
  }

  function toast(message, kind = "info") {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = `toast toast-${kind}`;
    const icon = kind === "error" ? "fa-circle-exclamation" : kind === "success" ? "fa-circle-check" : "fa-circle-info";
    el.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 250); }, 3400);
  }

  function openModal(html) {
    let overlay = document.getElementById("modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "modal-overlay";
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    }
    overlay.innerHTML = `<div class="modal-box">${html}</div>`;
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    const overlay = document.getElementById("modal-overlay");
    if (overlay) overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  function fmtMoney(n) { return Number(n || 0).toLocaleString("ru-RU") + " so'm"; }
  function fmtDate(iso) { const d = new Date(iso); return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  function fmtTime(iso) { const d = new Date(iso); return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }); }
  function fmtDateTime(iso) { return fmtDate(iso) + " · " + fmtTime(iso); }
  function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  const STATUS_LABEL = {
    waiting: "Kutmoqda", in_progress: "Qabulda", completed: "Yakunlandi",
    delayed: "Kechiktirildi", cancelled: "Bekor qilindi", no_show: "Kelmadi",
    paid: "To'langan", partial: "Qisman to'langan", refunded: "Qaytarilgan"
  };
  const STATUS_CLASS = {
    waiting: "badge-info", in_progress: "badge-teal", completed: "badge-success",
    delayed: "badge-warning", cancelled: "badge-danger", no_show: "badge-muted",
    paid: "badge-success", partial: "badge-warning", refunded: "badge-muted"
  };
  function statusBadge(status) {
    return `<span class="badge ${STATUS_CLASS[status] || "badge-muted"}">${STATUS_LABEL[status] || status}</span>`;
  }
  function flagBadge(flag) {
    const cls = flag === "me'yorda" ? "badge-success" : flag === "yuqori" ? "badge-danger" : "badge-warning";
    return `<span class="badge ${cls}">${flag}</span>`;
  }

  global.TIBEX_UI = {
    renderShell, setTitle, toast, openModal, closeModal, requireAuth,
    fmtMoney, fmtDate, fmtTime, fmtDateTime, escapeHtml, initials,
    statusBadge, flagBadge, STATUS_LABEL, ROLE_LABEL, toggleTheme
  };
})(window);
