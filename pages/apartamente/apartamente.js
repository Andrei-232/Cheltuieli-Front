const formContainer = document.getElementById("apartmentFormContainer");
const form = document.getElementById("apartmentForm");
const addBtn = document.getElementById("addBtn");
const table = document.getElementById("apartamenteTable");
const cancelBtn = document.getElementById("cancelBtn");

let apartamente = [];
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

async function fetchApartamente() {
  const res = await fetch("http://127.0.0.1:5176/apartamente");
  apartamente = await res.json();
  renderTable();
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const apt = {
    numar: document.getElementById("numar").value,
    etaj: document.getElementById("etaj").value,
    suprafata: document.getElementById("suprafata").value,
    numarCamere: document.getElementById("numar_camere").value,
    bloc: document.getElementById("bloc").value,
    incalzireCentralizata: document.getElementById("incCentr").checked,
    incalzireAutonoma: document.getElementById("incAuto").checked
  };

  if (editId === null) {
    await fetch("http://127.0.0.1:5176/apartamente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apt),
    });
  } else {
    await fetch(`http://127.0.0.1:5176/apartamente/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apt),
    });
    editId = null;
  }

  form.reset();
  formContainer.style.display = "none";
  await fetchApartamente();
});

function renderTable() {
  table.innerHTML = "";
  apartamente.forEach((apt) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${apt.numar}</td>
      <td>${apt.etaj}</td>
      <td>${apt.suprafata}</td>
      <td>${apt.numarCamere}</td>
      <td>${apt.bloc}</td>
      <td>${apt.incalzireCentralizata ? "✔" : "✘"}</td>
      <td>${apt.incalzireAutonoma ? "✔" : "✘"}</td>
      <td>
        <button onclick="editApartment(${apt.id})">Editare</button>
        <button onclick="deleteApartment(${apt.id})">Ștergere</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function editApartment(id) {
  const apt = apartamente.find((a) => a.id === id);
  if (apt) {
    document.getElementById("numar").value = apt.numar;
    document.getElementById("etaj").value = apt.etaj;
    document.getElementById("suprafata").value = apt.suprafata;
    document.getElementById("numar_camere").value = apt.numarCamere;
    document.getElementById("bloc").value = apt.bloc;
    document.getElementById("incCentr").checked = apt.incalzireCentralizata;
    document.getElementById("incAuto").checked = apt.incalzireAutonoma;
    editId = id;
    formContainer.style.display = "block";
  }
}

async function deleteApartment(id) {
  await fetch(`http://127.0.0.1:5176/apartamente/${id}`, {
    method: "DELETE",
  });
  await fetchApartamente();
}

fetchApartamente();