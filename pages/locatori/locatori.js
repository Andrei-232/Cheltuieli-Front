let locatari = [];
let editId = null;

function loadApartamente(selected = null) {
  fetch("/api/apartamente")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("apartament");
      select.innerHTML = '<option value="">Alege apartamentul</option>';
      data.forEach(ap => {
        const opt = document.createElement("option");
        opt.value = ap.id;
        opt.textContent = `Ap. ${ap.numar}`;
        if (ap.id === selected) opt.selected = true;
        select.appendChild(opt);
      });
    });
}

function openAddModal() {
  document.getElementById("modal-form").classList.add("show");
  document.getElementById("modal-title").innerText = "Adaugă locatar";
  document.getElementById("locatarForm").reset();
  editId = null;
  loadApartamente();
}

function openEditModal(index) {
  const locatar = locatari[index];
  document.getElementById("modal-form").classList.add("show");
  document.getElementById("modal-title").innerText = "Editează locatar";

  document.getElementById("nume").value = locatar.nume;
  document.getElementById("cnp").value = locatar.cnp;
  document.getElementById("varsta").value = locatar.varsta;
  document.getElementById("pensionar").value = locatar.pensionar;

  loadApartamente(locatar.apartament);

  editId = index;
}

function closeModal() {
  document.getElementById("modal-form").classList.remove("show");
}

if (editId !== null) {
  fetch(`/api/locatari/${editId}`, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(locatar)
  }).then(() => {
    locatari[editId] = locatar;
    renderTable();
    closeModal();
  });
} else {
  fetch("/api/locatari", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(locatar)
  }).then(() => {
    locatari.push(locatar);
    renderTable();
    closeModal();
  });
}

function deleteLocatar(index) {
  const popup = document.createElement("div");
  popup.className = "confirm-popup";
  popup.innerHTML = `
    <p>Sunteți sigur că vreți să ștergeți acest locătar?</p>
    <div>
      <button class="btn-save" onclick="confirmDelete(${index}, this)">Da</button>
      <button class="btn-cancel" onclick="this.parentElement.parentElement.remove()">Nu</button>
    </div>
  `;
  document.body.appendChild(popup);
}

function confirmDelete(index, btn) {
  locatari.splice(index, 1);
  renderTable();
  btn.closest(".confirm-popup").remove();
}

function renderTable() {
  const tbody = document.getElementById("locatari-tbody");
  tbody.innerHTML = "";

  locatari.forEach((locatar, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${locatar.nume}</td>
      <td>${locatar.cnp}</td>
      <td>${locatar.varsta}</td>
      <td>${locatar.pensionar ? 'Da' : 'Nu'}</td>
      <td>${locatar.apartament}</td>
      <td>
        <button onclick="openEditModal(${index})">✏️</button>
        <button onclick="deleteLocatar(${index})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById("locatarForm").addEventListener("submit", saveLocatar);

renderTable();
