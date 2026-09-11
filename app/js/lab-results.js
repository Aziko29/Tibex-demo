(function () {
  const DB = window.TIBEX_DB, UI = window.TIBEX_UI;
  const user = UI.renderShell("lab-results");
  if (!user) return;
  UI.setTitle("Tahlil natijalari");
  const canWrite = ["admin", "lab_doctor"].includes(user.role);
  const content = document.getElementById("page-content");

  function render() {
    const results = DB.listLabResults().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    content.innerHTML = `
      <div class="section-row"><h2>${results.length} tahlil natijasi</h2>${canWrite ? `<button class="btn btn-primary" id="add-lab"><i class="fa-solid fa-flask-vial"></i> Natija kiritish</button>` : ""}</div>
      ${results.map(r => {
        const p = DB.getPatient(r.patient_id);
        const hasOut = r.indicators.some(i => i.flag !== "me'yorda");
        return `<div class="card" style="margin-bottom:14px;">
          <div class="section-row" style="margin-bottom:10px;">
            <h2 style="font-size:15px;"><a class="link-name" href="patient-detail.html?id=${r.patient_id}">${UI.escapeHtml(p?.fullname || "—")}</a> — ${UI.escapeHtml(r.template)}</h2>
            <span class="muted" style="font-size:12px;">${UI.fmtDate(r.date)} ${hasOut ? "<span class=\"badge badge-danger\" style=\"margin-left:8px;\">Me'yordan chetga chiqish</span>" : ""}</span>
          </div>
          <div class="table-wrap"><table class="tbx-table"><thead><tr><th>Ko'rsatkich</th><th>Natija</th><th>Me'yor</th><th>Holat</th></tr></thead><tbody>
            ${r.indicators.map(i => `<tr><td>${i.name}</td><td>${i.value} ${i.unit}</td><td class="muted">${i.ref_low}–${i.ref_high} ${i.unit}</td><td>${UI.flagBadge(i.flag)}</td></tr>`).join("")}
          </tbody></table></div>
        </div>`;
      }).join("") || `<div class="empty-state"><i class="fa-solid fa-vial"></i>Hozircha natijalar yo'q</div>`}`;

    if (canWrite) document.getElementById("add-lab").addEventListener("click", openForm);
  }

  function openForm() {
    const patients = DB.listPatients().filter(p => !p.deleted);
    const templates = Object.keys(DB.LAB_TEMPLATES);
    UI.openModal(`
      <h3>Tahlil natijasini kiritish</h3>
      <div class="field"><label>Bemor</label><select id="f-patient">${patients.map(p => `<option value="${p.id}">${UI.escapeHtml(p.fullname)}</option>`).join("")}</select></div>
      <div class="field"><label>Tahlil turi</label><select id="f-template">${templates.map(t => `<option value="${t}">${t}</option>`).join("")}</select></div>
      <div id="indicator-fields"></div>
      <div class="modal-actions"><button class="btn" onclick="TIBEX_UI.closeModal()">Bekor qilish</button><button class="btn btn-primary" id="save-lab">Saqlash</button></div>`);

    function drawIndicators() {
      const tmpl = document.getElementById("f-template").value;
      const defs = DB.LAB_TEMPLATES[tmpl];
      document.getElementById("indicator-fields").innerHTML = `<p class="help-text" style="margin:10px 0;">Me'yordan tashqari qiymat kiritsangiz, tizim avtomatik "past/yuqori" belgisini qo'yadi.</p>` +
        defs.map((d, i) => `<div class="field"><label>${d.name} (me'yor: ${d.low}–${d.high} ${d.unit})</label><input type="number" step="0.01" class="ind-input" data-i="${i}" value="${((d.low + d.high) / 2).toFixed(2)}"></div>`).join("");
    }
    document.getElementById("f-template").addEventListener("change", drawIndicators);
    drawIndicators();

    document.getElementById("save-lab").addEventListener("click", () => {
      const values = Array.from(document.querySelectorAll(".ind-input")).map(inp => +inp.value);
      DB.addLabResult(document.getElementById("f-patient").value, document.getElementById("f-template").value, values);
      UI.closeModal(); UI.toast("Tahlil natijasi saqlandi", "success"); render();
    });
  }

  render();
})();
