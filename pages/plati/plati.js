const formContainer = document.getElementById("plataFormContainer");
const form = document.getElementById("plataForm");
const addBtn = document.getElementById("addBtn");
const table = document.getElementById("platiTable");
const cancelBtn = document.getElementById("cancelBtn");

let plati = [];
let editId = null;

addBtn.addEventListener("click", () => {
  editId = null;
  form.reset();
  formContainer.style.display = "block";
});

cancelBtn.addEventListener("click", () => {
  form.reset();
  formContainer.style.display = "none";
  editId = null;
});

async function fetchPlati() {
  const res = await fetch("http://127.0.0.1:5176/plati");
  plati = await res.json();
  renderTable();
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const plata = {
    id_apartament: parseInt(document.getElementById("id_apartament").value),
    id_serviciu: parseInt(document.getElementById("id_serviciu").value),
    suma: parseFloat(document.getElementById("suma").value),
    luna: document.getElementById("luna").value,
  };

  if (editId === null) {
    await fetch("http://127.0.0.1:5176/plati", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plata),
    });
  } else {
    await fetch(`http://127.0.0.1:5176/plati/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plata),
    });
    editId = null;
  }

  form.reset();
  formContainer.style.display = "none";
  await fetchPlati();
});

function renderTable() {
  table.innerHTML = "";
  plati.forEach((plata) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${plata.id_apartament}</td>
      <td>${plata.id_serviciu}</td>
      <td>${plata.suma.toFixed(2)} lei</td>
      <td>${plata.luna}</td>
      <td>
        <button onclick="editPlata(${plata.id_plata})">Editare</button>
        <button onclick="deletePlata(${plata.id_plata})">Ștergere</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function editPlata(id) {
  const plata = plati.find((p) => p.id_plata === id);
  if (plata) {
    document.getElementById("id_apartament").value = plata.id_apartament;
    document.getElementById("id_serviciu").value = plata.id_serviciu;
    document.getElementById("suma").value = plata.suma;
    document.getElementById("luna").value = plata.luna;
    editId = id;
    formContainer.style.display = "block";
  }
}

async function deletePlata(id) {
  await fetch(`http://127.0.0.1:5176/plati/${id}`, {
    method: "DELETE",
  });
  await fetchPlati();
}

fetchPlati();
