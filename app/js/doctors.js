(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("doctors");
  if (!user) return;
  UI.setTitle("Doktorlar");
  const canWrite = ["admin", "reception"].includes(user.role);
  const content = document.getElementById("page-content");

  function render() {
    const docs = DB.listDoctors();
    content.innerHTML = `
      <div class="section-row"><h2>${docs.length} shifokor</h2>${canWrite ? `<button class="btn btn-primary" id="add-doc"><i class="fa-solid fa-plus"></i> Shifokor qo'shish</button>` : ""}</div>
      <div class="table-wrap"><table class="tbx-table">
        <thead><tr><th>Shifokor</th><th>Mutaxassislik</th><th>Toifa</th><th>Narx</th><th>Ish jadvali</th><th>Holat</th><th></th></tr></thead>
        <tbody>${docs.map(d => `
          <tr>
            <td class="name-cell"><div class="mini-avatar" style="background:var(--teal);color:#04211d;">${UI.initials(d.fullname)}</div><span style="font-weight:600;">${UI.escapeHtml(d.fullname)}</span></td>
            <td>${UI.escapeHtml(d.specialty)}</td>
            <td class="muted">${d.category}</td>
            <td>${UI.fmtMoney(d.price)}</td>
            <td class="muted" style="font-size:12.5px;">${d.schedule}</td>
            <td><span class="badge ${d.active ? "badge-success" : "badge-muted"}">${d.active ? "Faol" : "Faoliyatsiz"}</span></td>
            <td class="row-actions">
              ${canWrite ? `<button class="btn btn-sm toggle-btn" data-id="${d.id}"><i class="fa-solid fa-power-off"></i></button>
              <button class="btn btn-sm btn-danger del-btn" data-id="${d.id}"><i class="fa-solid fa-trash"></i></button>` : ""}
            </td>
          </tr>`).join("")}</tbody>
      </table></div>`;

    if (canWrite) {
      document.getElementById("add-doc").addEventListener("click", openForm);
      content.querySelectorAll(".toggle-btn").forEach(b => b.addEventListener("click", () => { DB.toggleDoctorActive(b.dataset.id); render(); UI.toast("Holat yangilandi", "success"); }));
      content.querySelectorAll(".del-btn").forEach(b => b.addEventListener("click", () => {
        const res = DB.deleteDoctor(b.dataset.id);
        if (!res.ok) UI.toast(res.reason, "error");
        else { UI.toast("Shifokor o'chirildi", "success"); render(); }
      }));
    }
  }

  function openForm() {
    UI.openModal(`
      <h3>Yangi shifokor qo'shish</h3>
      <div class="field"><label>To'liq ism</label><input id="f-name" placeholder="Ism Familiya"></div>
      <div class="field-row">
        <div class="field"><label>Mutaxassislik</label><input id="f-spec" placeholder="masalan: Kardiolog"></div>
        <div class="field"><label>Toifa</label><select id="f-cat"><option>Oliy toifa</option><option>I toifa</option><option>II toifa</option></select></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Konsultatsiya narxi (so'm)</label><input id="f-price" type="number" placeholder="120000"></div>
        <div class="field"><label>Telefon</label><input id="f-phone" placeholder="+998 90 000 00 00"></div>
      </div>
      <div class="field"><label>Ish jadvali</label><input id="f-sched" placeholder="Dush–Juma, 09:00–15:00"></div>
      <div class="modal-actions"><button class="btn" onclick="TIBEX_UI.closeModal()">Bekor qilish</button><button class="btn btn-primary" id="save-doc">Saqlash</button></div>`);
    document.getElementById("save-doc").addEventListener("click", () => {
      const fullname = document.getElementById("f-name").value.trim();
      const specialty = document.getElementById("f-spec").value.trim();
      if (!fullname || !specialty) { UI.toast("Ism va mutaxassislik majburiy", "error"); return; }
      DB.addDoctor({ fullname, specialty, category: document.getElementById("f-cat").value, price: +document.getElementById("f-price").value || 0, phone: document.getElementById("f-phone").value.trim(), schedule: document.getElementById("f-sched").value.trim() });
      UI.closeModal(); UI.toast("Shifokor qo'shildi", "success"); render();
    });
  }

  render();
})();
