(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("patients");
  if (!user) return;
  UI.setTitle("Bemorlar");
  const canWrite = ["admin", "reception"].includes(user.role);

  const content = document.getElementById("page-content");
  let query = "";

  function render() {
    const list = DB.listPatients().filter(p => !p.deleted && p.fullname.toLowerCase().includes(query.toLowerCase()));
    content.innerHTML = `
      <div class="section-row">
        <h2>${list.length} bemor</h2>
        <div style="display:flex; gap:10px;">
          <input type="text" id="search" placeholder="Ism bo'yicha qidirish..." style="padding:9px 13px; border:1px solid var(--border-color); border-radius:10px; font-size:13.5px; background:var(--bg-card); color:var(--text-primary); min-width:220px;" value="${UI.escapeHtml(query)}">
          ${canWrite ? `<button class="btn btn-primary" id="add-btn"><i class="fa-solid fa-plus"></i> Bemor qo'shish</button>` : ""}
        </div>
      </div>
      <div class="table-wrap"><table class="tbx-table">
        <thead><tr><th>Bemor</th><th>Telefon</th><th>Tug'ilgan sana</th><th>Surunkali kasallik</th><th>Qo'shildi</th><th></th></tr></thead>
        <tbody>
          ${list.length ? list.map(p => `
            <tr>
              <td class="name-cell"><div class="mini-avatar">${UI.initials(p.fullname)}</div><a class="link-name" href="patient-detail.html?id=${p.id}">${UI.escapeHtml(p.fullname)}</a></td>
              <td>${p.phone}</td>
              <td>${p.birthdate}</td>
              <td>${p.chronic === "—" ? '<span class="muted">—</span>' : UI.escapeHtml(p.chronic)}</td>
              <td class="muted">${p.createdAt}</td>
              <td class="row-actions">
                <a class="btn btn-sm" href="patient-detail.html?id=${p.id}"><i class="fa-solid fa-eye"></i></a>
                ${canWrite ? `<button class="btn btn-sm edit-btn" data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-danger del-btn" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>` : ""}
              </td>
            </tr>`).join("") : `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i>Hech narsa topilmadi</div></td></tr>`}
        </tbody>
      </table></div>`;

    document.getElementById("search").addEventListener("input", (e) => { query = e.target.value; render(); });
    if (canWrite) {
      document.getElementById("add-btn").addEventListener("click", () => openForm());
      content.querySelectorAll(".edit-btn").forEach(b => b.addEventListener("click", () => openForm(DB.getPatient(b.dataset.id))));
      content.querySelectorAll(".del-btn").forEach(b => b.addEventListener("click", () => {
        const p = DB.getPatient(b.dataset.id);
        UI.openModal(`
          <h3>Bemorni o'chirish</h3>
          <p style="font-size:13.5px; color:var(--text-secondary);">"${UI.escapeHtml(p.fullname)}" o'chirilsinmi? Bu <b>soft delete</b> — yozuv ro'yxatdan yashirinadi, lekin tarixi (qabul/to'lov) saqlanib qoladi, xuddi haqiqiy tizimdagidek.</p>
          <div class="modal-actions"><button class="btn" onclick="TIBEX_UI.closeModal()">Bekor qilish</button><button class="btn btn-danger" id="confirm-del">O'chirish</button></div>`);
        document.getElementById("confirm-del").addEventListener("click", () => {
          DB.deletePatient(p.id); UI.closeModal(); UI.toast("Bemor o'chirildi (soft delete)", "success"); render();
        });
      }));
    }
  }

  function openForm(p) {
    const isEdit = !!p;
    UI.openModal(`
      <h3>${isEdit ? "Bemorni tahrirlash" : "Yangi bemor qo'shish"}</h3>
      <div class="field"><label>To'liq ism</label><input id="f-name" value="${isEdit ? UI.escapeHtml(p.fullname) : ""}" placeholder="Ism Familiya"></div>
      <div class="field-row">
        <div class="field"><label>Telefon</label><input id="f-phone" value="${isEdit ? p.phone : ""}" placeholder="+998 9x xxx xx xx"></div>
        <div class="field"><label>Tug'ilgan sana</label><input id="f-birth" type="date" value="${isEdit ? p.birthdate : ""}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Jinsi</label><select id="f-gender"><option value="M" ${isEdit && p.gender === "M" ? "selected" : ""}>Erkak</option><option value="F" ${isEdit && p.gender === "F" ? "selected" : ""}>Ayol</option></select></div>
        <div class="field"><label>Allergiyalar</label><input id="f-allergy" value="${isEdit ? UI.escapeHtml(p.allergies) : "—"}"></div>
      </div>
      <div class="field"><label>Manzil</label><input id="f-address" value="${isEdit ? UI.escapeHtml(p.address) : ""}"></div>
      <div class="field"><label>Surunkali kasallik</label><input id="f-chronic" value="${isEdit ? UI.escapeHtml(p.chronic) : "—"}"></div>
      <div class="modal-actions"><button class="btn" onclick="TIBEX_UI.closeModal()">Bekor qilish</button><button class="btn btn-primary" id="save-patient">Saqlash</button></div>`);

    document.getElementById("save-patient").addEventListener("click", () => {
      const name = document.getElementById("f-name").value.trim();
      const phone = document.getElementById("f-phone").value.trim();
      if (!name || !phone) { UI.toast("Ism va telefon majburiy", "error"); return; }
      const data = {
        fullname: name, phone, birthdate: document.getElementById("f-birth").value,
        gender: document.getElementById("f-gender").value, allergies: document.getElementById("f-allergy").value.trim() || "—",
        address: document.getElementById("f-address").value.trim(), chronic: document.getElementById("f-chronic").value.trim() || "—"
      };
      if (isEdit) DB.updatePatient(p.id, data); else DB.addPatient(data);
      UI.closeModal(); UI.toast(isEdit ? "Bemor yangilandi" : "Bemor qo'shildi", "success"); render();
    });
  }

  render();
})();
