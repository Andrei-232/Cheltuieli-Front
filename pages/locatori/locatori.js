let locatari = [];
let editId = null;

async function fetchLocatari() {
  try {
    const res = await fetch("http://127.0.0.1:5176/locatari/getResidents");
    const data = await res.json();
    locatari = data.locatari;
    renderTable();
  } catch (err) {
    console.error("Eroare la încărcarea locatarilor:", err);
  }
}

function renderTable() {
  const tableBody = document.getElementById("locatariTableBody");
  tableBody.innerHTML = "";

  locatari.forEach((locatar, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${locatar.nume}</td>
      <td>${locatar.cnp}</td>
      <td>${locatar.varsta}</td>
      <td>${locatar.pensionar ? "Da" : "Nu"}</td>
      <td>${locatar.apartament}</td>
      <td>
        <button class="btn-icon" onclick="editLocatar(${index})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon" onclick="deleteLocatar(${index})">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function openModal() {
  document.getElementById("modal").classList.add("show");
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
  document.getElementById("locatarForm").reset();
  editId = null;
}

function editLocatar(index) {
  const locatar = locatari[index];
  document.getElementById("nume").value = locatar.nume;
  document.getElementById("cnp").value = locatar.cnp;
  document.getElementById("varsta").value = locatar.varsta;
  document.getElementById("pensionar").checked = locatar.pensionar;
  document.getElementById("apartament").value = locatar.apartament;
  editId = index;
  openModal();
}

async function deleteLocatar(index) {
  if (!confirm("Sigur vrei să ștergi acest locatar?")) return;

  const cnp = locatari[index].cnp;
  try {
    await fetch("http://127.0.0.1:5176/locatari/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cnp })
    });
    fetchLocatari();
  } catch (err) {
    console.error("Eroare la ștergere:", err);
  }
}

async function saveLocatar(e) {
  e.preventDefault();

  const locatar = {
    nume: document.getElementById("nume").value,
    cnp: document.getElementById("cnp").value,
    varsta: parseInt(document.getElementById("varsta").value),
    pensionar: document.getElementById("pensionar").checked,
    apartament: document.getElementById("apartament").value
  };

  const endpoint = editId !== null ? "/locatari/update" : "/locatari/add";

  try {
    await fetch("http://127.0.0.1:5176" + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(locatar)
    });
    closeModal();
    fetchLocatari();
  } catch (err) {
    console.error("Eroare la salvare:", err);
  }
}

document.getElementById("addLocatarBtn").addEventListener("click", () => {
  editId = null;
  openModal();
});

document.getElementById("locatarForm").addEventListener("submit", saveLocatar);
document.getElementById("closeModal").addEventListener("click", closeModal);

window.onload = fetchLocatari;