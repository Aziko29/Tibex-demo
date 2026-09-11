/* ============================================================
   TIBEX DEMO — store.js
   Soxta (mock) ma'lumotlar bazasi. Hech qanday server yo'q —
   hammasi shu brauzerning localStorage'ida saqlanadi.
   Bu FAQAT interfeys va logikani ko'rsatish uchun demo.
   ============================================================ */
(function (global) {
  const KEY = "tibex_demo_v1";

  const SEED = {
    users: [
      { id: 1, username: "admin", password: "admin123", fullname: "Aziko29", role: "admin" },
      { id: 2, username: "reception", password: "demo123", fullname: "Malika Yusupova", role: "reception" },
      { id: 3, username: "doctor", password: "demo123", fullname: "Dr. Botir Karimov", role: "doctor", doctor_id: 1 },
      { id: 4, username: "cashier", password: "demo123", fullname: "Nodira Aliyeva", role: "cashier" },
      { id: 5, username: "lab", password: "demo123", fullname: "Sardor Nazarov", role: "lab_doctor" },
      { id: 6, username: "assistant", password: "demo123", fullname: "Kamola Rashidova", role: "assistant_admin" }
    ],
    doctors: [
      { id: 1, fullname: "Botir Karimov", specialty: "Kardiolog", category: "Oliy toifa", price: 150000, phone: "+998 90 123 45 01", schedule: "Dush–Juma, 09:00–15:00", active: true },
      { id: 2, fullname: "Dilnoza Shukurova", specialty: "Pediatr", category: "I toifa", price: 100000, phone: "+998 90 123 45 02", schedule: "Dush–Shan, 10:00–17:00", active: true },
      { id: 3, fullname: "Farrux Toshpulatov", specialty: "Nevrolog", category: "Oliy toifa", price: 180000, phone: "+998 90 123 45 03", schedule: "Sesh, Pay, Juma, 09:00–14:00", active: true },
      { id: 4, fullname: "Gulnora Ergasheva", specialty: "Ginekolog", category: "I toifa", price: 130000, phone: "+998 90 123 45 04", schedule: "Dush–Juma, 08:00–14:00", active: true },
      { id: 5, fullname: "Jasur Nabiyev", specialty: "Ortoped-travmatolog", category: "II toifa", price: 120000, phone: "+998 90 123 45 05", schedule: "Sesh–Shan, 11:00–18:00", active: true },
      { id: 6, fullname: "Shahnoza Qodirova", specialty: "LOR (Otorinolaringolog)", category: "I toifa", price: 110000, phone: "+998 90 123 45 06", schedule: "Dush, Sesh, Chor, Juma, 09:00–15:00", active: false }
    ],
    patients: [
      { id: 1, fullname: "Alisher Yoqubov", phone: "+998 93 111 22 01", birthdate: "1988-04-12", gender: "M", address: "Toshkent sh., Chilonzor t.", allergies: "Penitsillin", chronic: "Gipertoniya", createdAt: "2024-11-02" },
      { id: 2, fullname: "Zebiniso Rahimova", phone: "+998 93 111 22 02", birthdate: "1995-09-03", gender: "F", address: "Toshkent sh., Yunusobod t.", allergies: "—", chronic: "—", createdAt: "2024-12-15" },
      { id: 3, fullname: "Bekzod Islomov", phone: "+998 93 111 22 03", birthdate: "1979-01-27", gender: "M", address: "Toshkent sh., Mirzo Ulug'bek t.", allergies: "—", chronic: "Qandli diabet II tur", createdAt: "2025-01-20" },
      { id: 4, fullname: "Madina Tursunova", phone: "+998 93 111 22 04", birthdate: "2001-06-18", gender: "F", address: "Toshkent sh., Shayxontohur t.", allergies: "Aspirin", chronic: "—", createdAt: "2025-02-09" },
      { id: 5, fullname: "Ravshan G'ulomov", phone: "+998 93 111 22 05", birthdate: "1965-11-05", gender: "M", address: "Toshkent sh., Uchtepa t.", allergies: "—", chronic: "Astma", createdAt: "2025-03-01" },
      { id: 6, fullname: "Sevinch Nurmatova", phone: "+998 93 111 22 06", birthdate: "1992-02-14", gender: "F", address: "Toshkent sh., Yashnobod t.", allergies: "—", chronic: "—", createdAt: "2025-04-11" },
      { id: 7, fullname: "Ulug'bek Safarov", phone: "+998 93 111 22 07", birthdate: "1983-08-30", gender: "M", address: "Toshkent sh., Sergeli t.", allergies: "Yod", chronic: "—", createdAt: "2025-05-22" },
      { id: 8, fullname: "Nigora Xolmatova", phone: "+998 93 111 22 08", birthdate: "1999-12-01", gender: "F", address: "Toshkent sh., Bektemir t.", allergies: "—", chronic: "—", createdAt: "2025-06-30" }
    ],
    appointments: [],
    payments: [],
    lab_results: [],
    admissions: [
      { id: 1, patient_id: 3, room: "204-A", admit_date: todayStr(-2), discharge_date: null, reason: "Qandli diabet nazorati" }
    ],
    audit_log: [],
    seq: { appointments: 1, payments: 1, lab_results: 1, patients: 9, doctors: 7, audit: 1, admissions: 2 }
  };

  function todayStr(offsetDays = 0, hh = null, mm = null) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    if (hh !== null) d.setHours(hh, mm || 0, 0, 0);
    return d.toISOString();
  }

  // Seed today's appointment/payment/lab activity relative to "now" so the demo always looks live.
  function buildDynamicSeed() {
    const statuses = ["waiting", "in_progress", "completed", "delayed", "completed", "cancelled", "waiting", "no_show"];
    const appts = [];
    const pays = [];
    let apId = 1, payId = 1;
    const combos = [
      [1, 1, -0.5, "waiting"], [2, 2, -0.2, "in_progress"], [3, 1, -1, "completed"],
      [4, 3, -1.5, "completed"], [5, 4, 0.3, "waiting"], [6, 2, -0.8, "delayed"],
      [7, 5, -2, "completed"], [8, 1, 0.6, "waiting"], [1, 3, -3, "cancelled"],
      [2, 4, -4, "no_show"], [3, 5, -0.1, "in_progress"], [4, 1, -5, "completed"]
    ];
    combos.forEach(([pid, did, hourOffset, status], i) => {
      const dt = new Date();
      dt.setHours(9, 0, 0, 0);
      dt.setTime(dt.getTime() + hourOffset * 3600 * 1000);
      const appt = {
        id: apId++, patient_id: pid, doctor_id: did,
        datetime: dt.toISOString(), status,
        cancel_reason: status === "cancelled" ? "Bemor tashrifni bekor qildi" : (status === "no_show" ? "Bemor kelmadi" : ""),
        created_by: "reception"
      };
      appts.push(appt);
      if (status === "completed" || status === "in_progress") {
        const doctor = SEED.doctors.find(d => d.id === did);
        const price = doctor ? doctor.price : 100000;
        const paid = status === "completed" ? price : Math.round(price * 0.5);
        pays.push({
          id: payId++, appointment_id: appt.id, patient_id: pid,
          amount: price, paid, status: paid >= price ? "paid" : "partial",
          date: dt.toISOString()
        });
      }
    });
    return { appts, pays, apId, payId };
  }

  const LAB_TEMPLATES = {
    "Umumiy qon tahlili": [
      { name: "Gemoglobin", unit: "g/l", low: 120, high: 160 },
      { name: "Eritrotsitlar", unit: "10^12/l", low: 3.9, high: 5.1 },
      { name: "Leykotsitlar", unit: "10^9/l", low: 4.0, high: 9.0 },
      { name: "Trombotsitlar", unit: "10^9/l", low: 150, high: 400 },
      { name: "ECHT", unit: "mm/soat", low: 2, high: 15 }
    ],
    "Biokimyoviy qon tahlili": [
      { name: "Glyukoza", unit: "mmol/l", low: 3.9, high: 6.1 },
      { name: "Umumiy bilirubin", unit: "mkmol/l", low: 3.4, high: 20.5 },
      { name: "ALT", unit: "U/l", low: 0, high: 41 },
      { name: "AST", unit: "U/l", low: 0, high: 40 },
      { name: "Kreatinin", unit: "mkmol/l", low: 62, high: 115 }
    ],
    "Umumiy siydik tahlili": [
      { name: "Solishtirma og'irlik", unit: "", low: 1.015, high: 1.025 },
      { name: "Oqsil", unit: "g/l", low: 0, high: 0.14 },
      { name: "Glyukoza", unit: "mmol/l", low: 0, high: 0.8 },
      { name: "Leykotsitlar", unit: "hpf", low: 0, high: 3 }
    ]
  };

  function randIndicatorValue(low, high, forceOut) {
    const range = high - low || 1;
    if (forceOut) {
      return Math.random() > 0.5
        ? +(high + range * (0.15 + Math.random() * 0.4)).toFixed(2)
        : +(low - range * (0.15 + Math.random() * 0.3)).toFixed(2);
    }
    return +(low + Math.random() * range).toFixed(2);
  }

  function flagFor(v, low, high) {
    if (v < low) return "past";
    if (v > high) return "yuqori";
    return "me'yorda";
  }

  function buildLabResults() {
    const out = [];
    let id = 1;
    const plans = [
      [1, "Umumiy qon tahlili", -1, false],
      [1, "Biokimyoviy qon tahlili", -1, true],
      [3, "Biokimyoviy qon tahlili", -2, true],
      [3, "Umumiy siydik tahlili", -2, false],
      [5, "Umumiy qon tahlili", -3, true],
      [7, "Umumiy qon tahlili", -5, false]
    ];
    plans.forEach(([pid, tmpl, dayOffset, hasOut]) => {
      const indicators = LAB_TEMPLATES[tmpl].map((ind, i) => {
        const forceOut = hasOut && i === 0;
        const value = randIndicatorValue(ind.low, ind.high, forceOut);
        return { name: ind.name, unit: ind.unit, value, ref_low: ind.low, ref_high: ind.high, flag: flagFor(value, ind.low, ind.high) };
      });
      out.push({ id: id++, patient_id: pid, template: tmpl, date: todayStr(dayOffset), indicators });
    });
    return out;
  }

  function buildAuditLog() {
    const acts = [
      ["admin", "Foydalanuvchi qo'shdi", "Nodira Aliyeva (cashier)"],
      ["reception", "Bemor qo'shdi", "Nigora Xolmatova"],
      ["reception", "Qabul band qildi", "#5 — Ravshan G'ulomov → Gulnora Ergasheva"],
      ["cashier", "To'lov qabul qildi", "#3 — 150 000 so'm"],
      ["doctor", "Tahlil natijasini kiritdi", "Umumiy qon tahlili — Alisher Yoqubov"],
      ["admin", "To'lovni bekor qildi", "#9 — sabab: bemor kelmadi"],
      ["reception", "Qabul holatini o'zgartirdi", "#2 — waiting → in_progress"],
      ["admin", "Zaxira nusxa yaratdi", "tibex_backup_2025_09_10.sql"]
    ];
    return acts.map(([user, action, target], i) => ({
      id: i + 1, user, action, target, timestamp: todayStr(-(acts.length - i) * 0.3)
    }));
  }

  function freshState() {
    const { appts, pays, apId, payId } = buildDynamicSeed();
    return {
      users: clone(SEED.users),
      doctors: clone(SEED.doctors),
      patients: clone(SEED.patients),
      appointments: appts,
      payments: pays,
      lab_results: buildLabResults(),
      admissions: clone(SEED.admissions),
      audit_log: buildAuditLog(),
      seq: { appointments: apId, payments: payId, lab_results: 7, patients: 9, doctors: 7, audit: 9, admissions: 2 },
      session: null
    };
  }

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const state = freshState();
      save(state);
      return state;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      const state = freshState();
      save(state);
      return state;
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function reset() {
    const state = freshState();
    save(state);
    return state;
  }

  const DB = {
    state: load(),
    LAB_TEMPLATES,
    reset() { this.state = reset(); },
    persist() { save(this.state); },
    nextId(kind) {
      this.state.seq[kind] = (this.state.seq[kind] || 1) + 1;
      return this.state.seq[kind] - 1;
    },
    log(action, target) {
      const user = this.state.session ? this.state.session.fullname : "Sistema";
      this.state.audit_log.unshift({ id: this.nextId("audit"), user, action, target, timestamp: new Date().toISOString() });
      this.persist();
    },
    // ---- auth ----
    login(username, password) {
      const u = this.state.users.find(u => u.username === username && u.password === password);
      if (u) { this.state.session = u; this.persist(); }
      return u || null;
    },
    logout() { this.state.session = null; this.persist(); },
    currentUser() { return this.state.session; },
    // ---- patients ----
    listPatients() { return this.state.patients; },
    getPatient(id) { return this.state.patients.find(p => p.id === +id); },
    addPatient(data) {
      const p = Object.assign({ id: this.nextId("patients"), createdAt: new Date().toISOString().slice(0, 10) }, data);
      this.state.patients.push(p);
      this.log("Bemor qo'shdi", p.fullname);
      this.persist();
      return p;
    },
    updatePatient(id, data) {
      const p = this.getPatient(id);
      if (!p) return null;
      Object.assign(p, data);
      this.log("Bemor ma'lumotini tahrirladi", p.fullname);
      this.persist();
      return p;
    },
    deletePatient(id) {
      const p = this.getPatient(id);
      if (!p) return false;
      // Soft delete: bemor tarixi (qabul/to'lov) saqlanib qoladi — real tizimdagi kabi.
      p.deleted = true;
      this.log("Bemorni o'chirdi (soft delete)", p.fullname);
      this.persist();
      return true;
    },
    // ---- doctors ----
    listDoctors() { return this.state.doctors; },
    getDoctor(id) { return this.state.doctors.find(d => d.id === +id); },
    addDoctor(data) {
      const d = Object.assign({ id: this.nextId("doctors"), active: true }, data);
      this.state.doctors.push(d);
      this.log("Shifokor qo'shdi", d.fullname);
      this.persist();
      return d;
    },
    toggleDoctorActive(id) {
      const d = this.getDoctor(id);
      if (!d) return null;
      d.active = !d.active;
      this.log(d.active ? "Shifokorni faollashtirdi" : "Shifokorni faoliyatsizlantirdi", d.fullname);
      this.persist();
      return d;
    },
    deleteDoctor(id) {
      const hasAppts = this.state.appointments.some(a => a.doctor_id === +id);
      if (hasAppts) return { ok: false, reason: "Bu shifokorda mavjud qabullar bor — avval ularni bekor qiling yoki shifokorni 'faoliyatsiz' holatga o'tkazing." };
      this.state.doctors = this.state.doctors.filter(d => d.id !== +id);
      this.log("Shifokorni o'chirdi", "#" + id);
      this.persist();
      return { ok: true };
    },
    // ---- appointments (state machine) ----
    TRANSITIONS: {
      waiting: ["in_progress", "delayed", "cancelled", "no_show"],
      delayed: ["in_progress", "cancelled", "no_show"],
      in_progress: ["completed"],
      completed: [],
      cancelled: [],
      no_show: []
    },
    listAppointments() { return this.state.appointments; },
    getAppointment(id) { return this.state.appointments.find(a => a.id === +id); },
    isDoubleBooked(doctor_id, datetime, excludeId) {
      const t = new Date(datetime).getTime();
      return this.state.appointments.some(a =>
        a.id !== excludeId && a.doctor_id === +doctor_id &&
        ["waiting", "delayed", "in_progress"].includes(a.status) &&
        Math.abs(new Date(a.datetime).getTime() - t) < 30 * 60 * 1000
      );
    },
    bookAppointment(data) {
      if (this.isDoubleBooked(data.doctor_id, data.datetime)) {
        return { ok: false, reason: "Bu shifokorda shu vaqt oralig'ida (±30 daqiqa) allaqachon band qilingan qabul mavjud. Ikki bemorni bir vaqtga yozib bo'lmaydi." };
      }
      const a = Object.assign({ id: this.nextId("appointments"), status: "waiting", cancel_reason: "" }, data);
      this.state.appointments.push(a);
      this.log("Qabul band qildi", "#" + a.id);
      this.persist();
      return { ok: true, appointment: a };
    },
    transitionAppointment(id, newStatus, reason) {
      const a = this.getAppointment(id);
      if (!a) return { ok: false, reason: "Qabul topilmadi." };
      const allowed = this.TRANSITIONS[a.status] || [];
      if (!allowed.includes(newStatus)) {
        return { ok: false, reason: `"${a.status}" holatidan "${newStatus}" holatiga o'tish taqiqlangan (state-machine qoidasi).` };
      }
      a.status = newStatus;
      if (reason) a.cancel_reason = reason;
      this.log("Qabul holatini o'zgartirdi", `#${a.id} → ${newStatus}`);
      this.persist();
      return { ok: true, appointment: a };
    },
    // ---- payments ----
    listPayments() { return this.state.payments; },
    getPayment(id) { return this.state.payments.find(p => p.id === +id); },
    debtFor(payment) { return Math.max(0, payment.amount - payment.paid); },
    payAppointment(appointment_id, amount) {
      const appt = this.getAppointment(appointment_id);
      const doctor = appt ? this.getDoctor(appt.doctor_id) : null;
      const price = doctor ? doctor.price : 0;
      let pay = this.state.payments.find(p => p.appointment_id === +appointment_id);
      if (!pay) {
        pay = { id: this.nextId("payments"), appointment_id: +appointment_id, patient_id: appt.patient_id, amount: price, paid: 0, status: "partial", date: new Date().toISOString() };
        this.state.payments.push(pay);
      }
      pay.paid = Math.min(pay.amount, pay.paid + amount);
      pay.status = pay.paid >= pay.amount ? "paid" : "partial";
      this.log("To'lov qabul qildi", `#${pay.id} — ${amount.toLocaleString()} so'm`);
      this.persist();
      return pay;
    },
    cancelPayment(id) {
      // Bosqich 1: Admin to'lovni bekor qiladi.
      const p = this.getPayment(id);
      if (!p) return null;
      p.status = "cancelled";
      this.log("To'lovni bekor qildi (admin, 1-bosqich)", "#" + p.id);
      this.persist();
      return p;
    },
    refundPayment(id) {
      // Bosqich 2: Kassir haqiqiy pulni qaytaradi.
      const p = this.getPayment(id);
      if (!p || p.status !== "cancelled") return { ok: false, reason: "Faqat 'bekor qilingan' to'lovni qaytarish mumkin — avval admin bekor qilishi kerak (2 bosqichli qaytarim)." };
      p.status = "refunded";
      this.log("Pulni qaytardi (kassir, 2-bosqich)", "#" + p.id);
      this.persist();
      return { ok: true, payment: p };
    },
    // ---- lab results ----
    listLabResults() { return this.state.lab_results; },
    addLabResult(patient_id, template, indicatorValues) {
      const defs = LAB_TEMPLATES[template] || [];
      const indicators = defs.map((d, i) => {
        const value = indicatorValues[i];
        return { name: d.name, unit: d.unit, value, ref_low: d.low, ref_high: d.high, flag: flagFor(value, d.low, d.high) };
      });
      const r = { id: this.nextId("lab_results"), patient_id: +patient_id, template, date: new Date().toISOString(), indicators };
      this.state.lab_results.push(r);
      this.log("Tahlil natijasini kiritdi", `${template} — ${this.getPatient(patient_id)?.fullname || ""}`);
      this.persist();
      return r;
    },
    // ---- admissions ----
    listAdmissions() { return this.state.admissions; },
    admitPatient(patient_id, room, reason) {
      const a = { id: this.nextId("admissions"), patient_id: +patient_id, room, admit_date: new Date().toISOString(), discharge_date: null, reason };
      this.state.admissions.push(a);
      this.log("Bemorni statsionarga yotqizdi", `${room} — ${this.getPatient(patient_id)?.fullname || ""}`);
      this.persist();
      return a;
    },
    dischargePatient(id) {
      const a = this.state.admissions.find(a => a.id === +id);
      if (!a) return null;
      a.discharge_date = new Date().toISOString();
      this.log("Bemorni statsionardan chiqardi", "#" + a.id);
      this.persist();
      return a;
    },
    // ---- reports ----
    listAuditLog() { return this.state.audit_log; }
  };

  global.TIBEX_DB = DB;
})(window);
