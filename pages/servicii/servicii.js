const formContainer = document.getElementById("serviceFormContainer");
const form = document.getElementById("serviceForm");
const addBtn = document.getElementById("addBtn");
const table = document.getElementById("serviciiTable");
const cancelBtn = document.getElementById("cancelBtn");

let servicii = [];
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

async function fetchServicii() {
  const res = await fetch("http://127.0.0.1:5176/servicii");
  servicii = await res.json();
  renderTable();
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const serviciu = {
    nume: document.getElementById("nume").value,
    cod: document.getElementById("cod").value
  };

  if (editId === null) {
    await fetch("http://127.0.0.1:5176/servicii", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviciu),
    });
  } else {
    await fetch(`http://127.0.0.1:5176/servicii/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviciu),
    });
    editId = null;
  }

  form.reset();
  formContainer.style.display = "none";
  await fetchServicii();
});

function renderTable() {
  table.innerHTML = "";
  servicii.forEach((serviciu) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${serviciu.nume}</td>
      <td>${serviciu.cod}</td>
      <td>
        <button onclick="editService(${serviciu.id})">Editare</button>
        <button onclick="deleteService(${serviciu.id})">Ștergere</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function editService(id) {
  const serviciu = servicii.find((s) => s.id === id);
  if (serviciu) {
    document.getElementById("nume").value = serviciu.nume;
    document.getElementById("cod").value = serviciu.cod;
    editId = id;
    formContainer.style.display = "block";
  }
}

async function deleteService(id) {
  await fetch(`http://127.0.0.1:5176/servicii/${id}`, {
    method: "DELETE",
  });
  await fetchServicii();
}

fetchServicii();
