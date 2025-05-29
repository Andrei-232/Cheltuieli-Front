const form = document.getElementById("apartmentForm");
const table = document.getElementById("apartamenteTable");

let apartamente = [];
let editId = null;

async function fetchApartamente() {
  const res = await fetch("http://127.0.0.1:5176/apartamente");
  apartamente = await res.json();
  renderTable();
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const apt = {
    numar: document.getElementById("numar").value,
    incalzireCentralizata: document.getElementById("incCentr").checked,
    incalzireAutonoma: document.getElementById("incAuto").checked,
    locatar: document.getElementById("locatar").value,
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
  await fetchApartamente();
});

function renderTable() {
  table.innerHTML = "";
  apartamente.forEach((apt) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${apt.numar}</td>
      <td>${apt.incalzireCentralizata ? "✔" : "✘"}</td>
      <td>${apt.incalzireAutonoma ? "✔" : "✘"}</td>
      <td>${apt.locatar}</td>
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
    document.getElementById("incCentr").checked = apt.incalzireCentralizata;
    document.getElementById("incAuto").checked = apt.incalzireAutonoma;
    document.getElementById("locatar").value = apt.locatar;
    editId = id;
  }
}

async function deleteApartment(id) {
  await fetch(`http://127.0.0.1:5176/apartamente/${id}`, {
    method: "DELETE",
  });
  await fetchApartamente();
}

fetchApartamente();