/**
 * TIBEX Demo — Markaziy ma'lumotlar ombori
 * localStorage asosida ishlaydi, sessiya davomida saqlanadi
 */
(function () {
  const STORAGE_KEY = "tibex_demo_v1";
  const SESSION_KEY = "tibex_session_v1";

  // ─── Demo foydalanuvchilar ───────────────────────────────
  const USERS = [
    { username: "admin",     password: "admin123", role: "admin",     fullname: "Aziz Karimov" },
    { username: "reception", password: "demo123",  role: "reception", fullname: "Nilufar Rasulova" },
    { username: "doctor",    password: "demo123",  role: "doctor",    fullname: "Dr. Bekzod Toshmatov" },
    { username: "cashier",   password: "demo123",  role: "cashier",   fullname: "Kamola Yusupova" },
    { username: "lab",       password: "demo123",  role: "lab_doctor", fullname: "Dr. Sanjar Aliyev" },
    { username: "assistant", password: "demo123",  role: "assistant", fullname: "Dilshod Ergashev" }
  ];

  // ─── Rol → sahifa ruxsatlari ──────────────────────────────
  const ROLE_PAGES = {
    admin:     ["dashboard","patients","appointments","doctors","payments","lab-results","reports","audit-log","settings"],
    reception: ["dashboard","patients","appointments","doctors","payments","settings"],
    doctor:    ["dashboard","patients","appointments","lab-results","settings"],
    cashier:   ["dashboard","payments","settings"],
    lab_doctor:["dashboard","patients","lab-results","settings"],
    assistant: ["dashboard","reports","audit-log","settings"]
  };

  // ─── Laboratoriya shablonlari ─────────────────────────────
  const LAB_TEMPLATES = {
    "Umumiy qon tahlili": [
      { name: "Gemoglobin", unit: "g/L", low: 120, high: 160 },
      { name: "Leykotsitlar", unit: "10⁹/L", low: 4, high: 9 },
      { name: "Trombotsitlar", unit: "10⁹/L", low: 150, high: 400 },
      { name: "ESR", unit: "mm/soat", low: 2, high: 15 }
    ],
    "Biokimyoviy tahlil": [
      { name: "Glyukoza", unit: "mmol/L", low: 3.9, high: 6.1 },
      { name: "Kreatinin", unit: "mkmol/L", low: 62, high: 106 },
      { name: "Xolesterin", unit: "mmol/L", low: 3.0, high: 5.2 }
    ],
    "Siydik tahlili": [
      { name: "Protein", unit: "g/L", low: 0, high: 0.14 },
      { name: "Leykotsitlar", unit: "1 ko'rishda", low: 0, high: 5 },
      { name: "Eritrotsitlar", unit: "1 ko'rishda", low: 0, high: 2 }
    ],
    "Qalqonsimon bez": [
      { name: "TSH", unit: "mIU/L", low: 0.4, high: 4.0 },
      { name: "T3 erkin", unit: "pmol/L", low: 3.1, high: 6.8 },
      { name: "T4 erkin", unit: "pmol/L", low: 12, high: 22 }
    ]
  };

  // ─── Boshlang'ich seed ma'lumotlar ────────────────────────
  function seed() {
    return {
      patients: [
        { id: 1, fullname: "Aliyev Sardor Baxtiyorovich", phone: "+998 90 123 45 67", birthdate: "1985-03-12", gender: "M", address: "Toshkent, Chilonzor 9-mavze", allergies: "Penitsillin", chronic: "Gipertoniya", createdAt: "2026-01-15", deleted: false },
        { id: 2, fullname: "Karimova Nilufar Azizovna", phone: "+998 91 234 56 78", birthdate: "1992-07-25", gender: "F", address: "Toshkent, Yunusobod 4-mavze", allergies: "—", chronic: "—", createdAt: "2026-01-18", deleted: false },
        { id: 3, fullname: "Rahimov Jasur Ulug'bekovich", phone: "+998 93 345 67 89", birthdate: "1978-11-03", gender: "M", address: "Samarqand, Registon ko'chasi", allergies: "Lateks", chronic: "Qandli diabet II tur", createdAt: "2026-01-20", deleted: false },
        { id: 4, fullname: "Tosheva Dilnoza Baxtiyorovna", phone: "+998 94 456 78 90", birthdate: "1995-05-19", gender: "F", address: "Toshkent, Mirzo Ulug'bek", allergies: "—", chronic: "Bronxial astma", createdAt: "2026-02-01", deleted: false },
        { id: 5, fullname: "Ergashev Bobur Alisherovich", phone: "+998 97 567 89 01", birthdate: "1988-09-14", gender: "M", address: "Buxoro, Mustaqillik ko'chasi", allergies: "—", chronic: "—", createdAt: "2026-02-05", deleted: false }
      ],
      doctors: [
        { id: 1, fullname: "Dr. Toshmatov Bekzod Akmalovich", specialty: "Kardiolog",     category: "Oliy toifa", price: 150000, phone: "+998 90 111 22 33", schedule: "Dush–Juma, 09:00–15:00", active: true },
        { id: 2, fullname: "Dr. Yusupova Malika Rustamovna", specialty: "Terapevt",      category: "I toifa",    price: 100000, phone: "+998 90 222 33 44", schedule: "Dush–Shan, 08:00–14:00", active: true },
        { id: 3, fullname: "Dr. Aliyev Sanjar Farhodovich",  specialty: "Nevrolog",      category: "Oliy toifa", price: 180000, phone: "+998 90 333 44 55", schedule: "Sesh–Shan, 10:00–17:00", active: true },
        { id: 4, fullname: "Dr. Nazarova Gulnora Bahodirovna", specialty: "Pediatr",     category: "I toifa",    price: 90000,  phone: "+998 90 444 55 66", schedule: "Dush–Juma, 09:00–16:00", active: true }
      ],
      appointments: [],
      payments: [],
      labResults: [],
      admissions: [],
      auditLog: []
    };
  }

  // ─── Holat ────────────────────────────────────────────────
  let data = load();
  let auditCounter = 100;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.warn("Store load error:", e); }
    const fresh = seed();
    // Bugun uchun namuna qabullar
    const today = new Date();
    const at = (h, m) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m).toISOString();
    fresh.appointments = [
      { id: 1, patient_id: 1, doctor_id: 1, datetime: at(9, 0),  status: "waiting",     created_by: "reception", cancel_reason: null },
      { id: 2, patient_id: 2, doctor_id: 2, datetime: at(9, 30), status: "in_progress", created_by: "reception", cancel_reason: null },
      { id: 3, patient_id: 3, doctor_id: 1, datetime: at(10, 0), status: "waiting",     created_by: "reception", cancel_reason: null },
      { id: 4, patient_id: 4, doctor_id: 3, datetime: at(10, 30),status: "completed",   created_by: "reception", cancel_reason: null },
      { id: 5, patient_id: 5, doctor_id: 4, datetime: at(11, 0), status: "delayed",     created_by: "reception", cancel_reason: "Bemor 20 daqiqaga kechikdi" }
    ];
    fresh.payments = [
      { id: 1, appointment_id: 4, patient_id: 4, amount: 180000, paid: 180000, date: at(10, 45), status: "paid",   refund_by: null, refund_at: null },
      { id: 2, appointment_id: 1, patient_id: 1, amount: 150000, paid: 100000, date: at(9, 5),  status: "partial", refund_by: null, refund_at: null }
    ];
    fresh.labResults = [
      { id: 1, patient_id: 1, template: "Umumiy qon tahlili", date: new Date().toISOString(), indicators: [
        { name: "Gemoglobin", value: 145, unit: "g/L", ref_low: 120, ref_high: 160, flag: "me'yorda" },
        { name: "Leykotsitlar", value: 11.2, unit: "10⁹/L", ref_low: 4, ref_high: 9, flag: "yuqori" },
        { name: "Trombotsitlar", value: 220, unit: "10⁹/L", ref_low: 150, ref_high: 400, flag: "me'yorda" },
        { name: "ESR", value: 22, unit: "mm/soat", ref_low: 2, ref_high: 15, flag: "yuqori" }
      ]}
    ];
    fresh.auditLog = [
      { user: "admin", action: "Tizimga kirdi", target: "—", timestamp: new Date().toISOString() }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (e) { console.warn("Store save error:", e); }
  }

  function log(action, target) {
    const u = currentUser();
    data.auditLog.unshift({
      user: u ? u.username : "tizim",
      action, target, timestamp: new Date().toISOString()
    });
    if (data.auditLog.length > 200) data.auditLog.length = 200;
    save();
  }

  function nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

  // ─── Sessiya ──────────────────────────────────────────────
  function currentUser() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  function login(username, password) {
    const u = USERS.find(x => x.username === username && x.password === password);
    if (!u) {
      data.auditLog.unshift({ user: username || "noma'lum", action: "Muvaffaqiyatsiz kirish", target: "login", timestamp: new Date().toISOString() });
      save();
      return null;
    }
    const session = { username: u.username, role: u.role, fullname: u.fullname };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    data.auditLog.unshift({ user: u.username, action: "Tizimga kirdi", target: "login", timestamp: new Date().toISOString() });
    save();
    return session;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  // ─── Bemorlar ─────────────────────────────────────────────
  const listPatients = () => data.patients;
  const getPatient = (id) => data.patients.find(p => p.id === +id);
  function addPatient(p) {
    const item = { ...p, id: nextId(data.patients), createdAt: new Date().toISOString().slice(0, 10), deleted: false };
    data.patients.push(item); save(); log("Bemor qo'shildi", item.fullname);
    return item;
  }
  function updatePatient(id, patch) {
    const p = getPatient(id); if (!p) return;
    Object.assign(p, patch); save(); log("Bemor tahrirlandi", p.fullname);
  }
  function deletePatient(id) {
    const p = getPatient(id); if (!p) return;
    p.deleted = true; save(); log("Bemor o'chirildi (soft)", p.fullname);
  }

  // ─── Shifokorlar ──────────────────────────────────────────
  const listDoctors = () => data.doctors;
  const getDoctor = (id) => data.doctors.find(d => d.id === +id);
  function addDoctor(d) {
    const item = { ...d, id: nextId(data.doctors), active: true };
    data.doctors.push(item); save(); log("Shifokor qo'shildi", item.fullname);
    return item;
  }
  function toggleDoctorActive(id) {
    const d = getDoctor(id); if (!d) return;
    d.active = !d.active; save(); log("Shifokor holati o'zgardi", d.fullname);
  }
  function deleteDoctor(id) {
    const d = getDoctor(id); if (!d) return { ok: false, reason: "Topilmadi" };
    const busy = data.appointments.some(a => a.doctor_id === d.id && (a.status === "waiting" || a.status === "in_progress" || a.status === "delayed"));
    if (busy) return { ok: false, reason: "Shifokorning faol qabullari bor — avval ularni yakunlang" };
    data.doctors = data.doctors.filter(x => x.id !== d.id);
    save(); log("Shifokor o'chirildi", d.fullname);
    return { ok: true };
  }

  // ─── Qabullar (state machine) ─────────────────────────────
  const TRANSITIONS = {
    waiting:     ["in_progress", "delayed", "cancelled", "no_show"],
    delayed:     ["in_progress", "cancelled", "no_show"],
    in_progress: ["completed"],
    completed:   [], cancelled: [], no_show: []
  };

  const listAppointments = () => data.appointments;
  const getAppointment = (id) => data.appointments.find(a => a.id === +id);

  function bookAppointment({ patient_id, doctor_id, datetime, created_by }) {
    const dt = new Date(datetime);
    const conflict = data.appointments.find(a =>
      a.doctor_id === +doctor_id &&
      ["waiting", "in_progress", "delayed"].includes(a.status) &&
      Math.abs(new Date(a.datetime) - dt) < 30 * 60 * 1000
    );
    if (conflict) return { ok: false, reason: "Bu vaqt oralig'ida shifokor band (±30 daqiqa)" };
    const item = { id: nextId(data.appointments), patient_id: +patient_id, doctor_id: +doctor_id, datetime, status: "waiting", created_by, cancel_reason: null };
    data.appointments.push(item);
    // Avtomatik to'lov yozuvi
    const doc = getDoctor(doctor_id);
    data.payments.push({
      id: nextId(data.payments), appointment_id: item.id, patient_id: +patient_id,
      amount: doc ? doc.price : 0, paid: 0, date: new Date().toISOString(),
      status: "partial", refund_by: null, refund_at: null
    });
    save(); log("Qabul band qilindi", `#${item.id}`);
    return { ok: true, appointment: item };
  }

  function transitionAppointment(id, newStatus, reason) {
    const a = getAppointment(id); if (!a) return { ok: false, reason: "Qabul topilmadi" };
    const allowed = TRANSITIONS[a.status] || [];
    if (!allowed.includes(newStatus)) return { ok: false, reason: `"${a.status}" → "${newStatus}" o'tish mumkin emas` };
    a.status = newStatus;
    if (reason) a.cancel_reason = reason;
    save(); log("Qabul holati o'zgardi", `#${a.id} → ${newStatus}`);
    return { ok: true };
  }

  // ─── To'lovlar ────────────────────────────────────────────
  const listPayments = () => data.payments;
  const getPayment = (id) => data.payments.find(p => p.id === +id);
  const debtFor = (p) => Math.max(0, (p.amount || 0) - (p.paid || 0));

  function payAppointment(appointment_id, amount) {
    const p = data.payments.find(x => x.appointment_id === +appointment_id);
    if (!p) return { ok: false, reason: "To'lov topilmadi" };
    p.paid = Math.min(p.amount, p.paid + amount);
    p.status = p.paid >= p.amount ? "paid" : "partial";
    save(); log("To'lov qabul qilindi", `#${p.id} — ${amount}`);
    return { ok: true };
  }

  function cancelPayment(id) {
    const p = getPayment(id); if (!p) return;
    p.status = "cancelled"; save(); log("To'lov bekor qilindi", `#${p.id}`);
  }

  function refundPayment(id) {
    const p = getPayment(id); if (!p) return { ok: false, reason: "Topilmadi" };
    if (p.status !== "cancelled") return { ok: false, reason: "Avval admin bekor qilishi kerak" };
    p.status = "refunded"; p.refund_at = new Date().toISOString();
    const u = currentUser(); p.refund_by = u ? u.username : "—";
    save(); log("Pul qaytarildi", `#${p.id}`);
    return { ok: true };
  }

  // ─── Laboratoriya ─────────────────────────────────────────
  const listLabResults = () => data.labResults;

  function addLabResult(patient_id, template, values) {
    const defs = LAB_TEMPLATES[template] || [];
    const indicators = defs.map((d, i) => {
      const v = values[i];
      let flag = "me'yorda";
      if (v < d.low) flag = "past";
      else if (v > d.high) flag = "yuqori";
      return { name: d.name, value: v, unit: d.unit, ref_low: d.low, ref_high: d.high, flag };
    });
    const item = { id: nextId(data.labResults), patient_id: +patient_id, template, date: new Date().toISOString(), indicators };
    data.labResults.push(item); save(); log("Tahlil natijasi kiritildi", `#${item.id}`);
    return item;
  }

  // ─── Statsionar ───────────────────────────────────────────
  const listAdmissions = () => data.admissions;

  // ─── Audit ────────────────────────────────────────────────
  const listAuditLog = () => data.auditLog;

  // ─── Reset ────────────────────────────────────────────────
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    data = load();
  }

  // ─── Eksport ──────────────────────────────────────────────
  window.TIBEX_DB = {
    USERS, ROLE_PAGES, LAB_TEMPLATES,
    currentUser, login, logout,
    listPatients, getPatient, addPatient, updatePatient, deletePatient,
    listDoctors, getDoctor, addDoctor, toggleDoctorActive, deleteDoctor,
    listAppointments, getAppointment, bookAppointment, transitionAppointment,
    listPayments, getPayment, debtFor, payAppointment, cancelPayment, refundPayment,
    listLabResults, addLabResult,
    listAdmissions, listAuditLog,
    reset
  };
})();