// Variabile globale
let plati = []
let apartamente = []
let servicii = []
let editIndex = null
let deleteIndex = null

// Funcții pentru gestionarea datelor
async function fetchApartamente() {
  try {
    console.log("Încărcare apartamente...")
    const response = await fetch("http://localhost:5176/locatari/getApartments")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Apartamente primite:", data)

    apartamente = data.apartamente || []
    populateApartmentDropdown()
  } catch (error) {
    console.error("Eroare la încărcarea apartamentelor:", error)
    showError("Nu s-au putut încărca apartamentele. Verificați conexiunea la server.")
  }
}

async function fetchServicii() {
  try {
    console.log("Încărcare servicii...")
    const response = await fetch("http://localhost:5176/servicii/getAll")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Servicii primite:", data)

    servicii = data.servicii || []
    populateServiciuDropdown()
  } catch (error) {
    console.error("Eroare la încărcarea serviciilor:", error)
    showError("Nu s-au putut încărca serviciile. Verificați conexiunea la server.")
  }
}

function populateApartmentDropdown() {
  const apartamentSelect = document.getElementById("apartament")
  if (!apartamentSelect) {
    console.error("Element apartament select nu a fost găsit!")
    return
  }

  // Păstrează opțiunea default
  apartamentSelect.innerHTML = '<option value="">Selectează apartamentul...</option>'

  // Adaugă apartamentele
  apartamente.forEach((apt) => {
    const option = document.createElement("option")
    option.value = apt.id
    option.textContent = `Apartament ${apt.numar}`
    apartamentSelect.appendChild(option)
  })

  console.log(`Dropdown apartamente populat cu ${apartamente.length} apartamente`)
}

function populateServiciuDropdown() {
  const serviciuSelect = document.getElementById("serviciu")
  if (!serviciuSelect) {
    console.error("Element serviciu select nu a fost găsit!")
    return
  }

  // Păstrează opțiunea default
  serviciuSelect.innerHTML = '<option value="">Selectează serviciul...</option>'

  // Adaugă serviciile
  servicii.forEach((serv) => {
    const option = document.createElement("option")
    option.value = serv.id
    option.textContent = `${serv.nume} (${serv.cod})`
    serviciuSelect.appendChild(option)
  })

  console.log(`Dropdown servicii populat cu ${servicii.length} servicii`)
}

async function fetchPlati() {
  try {
    console.log("=== Încărcare plăți ===")
    const response = await fetch("http://localhost:5176/plati/getAll")

    console.log("Response status:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Date plăți primite:", data)

    plati = data.plati || []
    console.log("Plăți procesate:", plati)
    renderTable()
  } catch (error) {
    console.error("Eroare la încărcarea plăților:", error)
    showError("Nu s-au putut încărca datele. Verificați conexiunea la server.")
  }
}

function renderTable() {
  const tableBody = document.getElementById("platiTableBody")

  if (!tableBody) {
    console.error("Element platiTableBody nu a fost găsit!")
    return
  }

  if (plati.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">Nu există plăți înregistrate</td>
      </tr>
    `
    return
  }

  tableBody.innerHTML = ""

  plati.forEach((plata, index) => {
    const row = document.createElement("tr")

    // Afișează denumirile în loc de ID-uri
    const apartamentDisplay = plata.numarApartament ? `Apartament ${plata.numarApartament}` : "Necunoscut"
    const serviciuDisplay = plata.numeServiciu || "Necunoscut"

    row.innerHTML = `
      <td>${apartamentDisplay}</td>
      <td>${escapeHtml(serviciuDisplay)}</td>
      <td>${plata.suma.toFixed(2)} lei</td>
      <td>${plata.luna}</td>
      <td>
        <button class="btn-icon edit" onclick="editPlata(${index})" title="Editează">
          <i class="fas fa-edit"></i>
        </button>
      </td>
    `
    tableBody.appendChild(row)
  })

  console.log(`Tabel randat cu ${plati.length} plăți`)
}

// Funcții pentru modal
function openModal(title = "Adaugă Plată") {
  const modalTitle = document.getElementById("modal-title")
  const modal = document.getElementById("modal")

  if (modalTitle) modalTitle.textContent = title
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"

    // Focus pe primul select
    setTimeout(() => {
      const apartamentSelect = document.getElementById("apartament")
      if (apartamentSelect) apartamentSelect.focus()
    }, 100)
  }
}

function closeModal() {
  const modal = document.getElementById("modal")
  const form = document.getElementById("plataForm")

  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  if (form) form.reset()
  editIndex = null
  clearValidationErrors()
}

function openConfirmModal() {
  const confirmModal = document.getElementById("confirmModal")
  if (confirmModal) {
    confirmModal.classList.add("show")
    document.body.style.overflow = "hidden"
  }
}

function closeConfirmModal() {
  const confirmModal = document.getElementById("confirmModal")
  if (confirmModal) {
    confirmModal.classList.remove("show")
    document.body.style.overflow = "auto"
  }
  deleteIndex = null
}

// Funcții CRUD
function addPlata() {
  editIndex = null
  openModal("Adaugă Plată")
}

function editPlata(index) {
  if (index < 0 || index >= plati.length) {
    showError("Plată invalidă!")
    return
  }

  const plata = plati[index]
  console.log("=== Editare plată ===")
  console.log("Plată selectată:", plata)

  // Verifică dacă toate câmpurile există înainte de a le popula
  const apartamentSelect = document.getElementById("apartament")
  const serviciuSelect = document.getElementById("serviciu")
  const sumaInput = document.getElementById("suma")
  const lunaInput = document.getElementById("luna")

  if (!apartamentSelect || !serviciuSelect || !sumaInput || !lunaInput) {
    showError("Eroare: Nu s-au găsit toate câmpurile formularului!")
    return
  }

  // Populează câmpurile cu datele plății
  apartamentSelect.value = plata.idApartament || ""
  serviciuSelect.value = plata.idServiciu || ""
  sumaInput.value = plata.suma || ""
  lunaInput.value = plata.luna || ""

  editIndex = index
  openModal("Editează Plată")

  console.log("Câmpuri populate pentru editare")
}

function confirmDeletePlata(index) {
  deleteIndex = index
  openConfirmModal()
}

async function deletePlata() {
  if (deleteIndex === null || deleteIndex < 0 || deleteIndex >= plati.length) {
    showError("Plată invalidă!")
    return
  }

  const id = plati[deleteIndex].id

  try {
    console.log("Ștergere plată cu ID:", id)

    const response = await fetch("http://localhost:5176/plati/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ id: id }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("Rezultat ștergere:", result)

    closeConfirmModal()
    showSuccess("Plată ștearsă cu succes!")
    await fetchPlati()
  } catch (error) {
    console.error("Eroare la ștergere:", error)
    showError("Eroare la ștergerea plății!")
  }
}

async function savePlata(event) {
  event.preventDefault()

  console.log("=== Salvare plată ===")

  if (!validateForm()) {
    return
  }

  const apartamentSelect = document.getElementById("apartament")
  const serviciuSelect = document.getElementById("serviciu")
  const sumaInput = document.getElementById("suma")
  const lunaInput = document.getElementById("luna")

  const formData = {
    idApartament: apartamentSelect ? apartamentSelect.value : "",
    idServiciu: serviciuSelect ? serviciuSelect.value : "",
    suma: sumaInput ? Number.parseFloat(sumaInput.value) : 0,
    luna: lunaInput ? lunaInput.value : "",
  }

  const isEdit = editIndex !== null
  const endpoint = isEdit ? "/plati/update" : "/plati/add"

  console.log("Date formular:", formData)
  console.log("Este editare:", isEdit)
  console.log("Endpoint:", endpoint)

  try {
    let requestBody
    if (isEdit) {
      requestBody = JSON.stringify({
        id: plati[editIndex].id,
        plata: formData,
      })
    } else {
      requestBody = JSON.stringify(formData)
    }

    console.log("Request body:", requestBody)

    const response = await fetch(`http://localhost:5176${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: requestBody,
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Response error:", errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("Rezultat salvare:", result)

    if (result.success) {
      closeModal()
      showSuccess(`Plată ${isEdit ? "editată" : "adăugată"} cu succes!`)
      await fetchPlati()
    } else {
      showError(result.error || "Eroare necunoscută")
    }
  } catch (error) {
    console.error("Eroare la salvare:", error)
    showError(`Eroare la ${isEdit ? "editarea" : "adăugarea"} plății!`)
  }
}

// Funcții de validare
function validateForm() {
  clearValidationErrors()
  let isValid = true

  const apartamentSelect = document.getElementById("apartament")
  const serviciuSelect = document.getElementById("serviciu")
  const sumaInput = document.getElementById("suma")
  const lunaInput = document.getElementById("luna")

  const apartament = apartamentSelect ? apartamentSelect.value : ""
  const serviciu = serviciuSelect ? serviciuSelect.value : ""
  const suma = sumaInput ? sumaInput.value : ""
  const luna = lunaInput ? lunaInput.value : ""

  if (!apartament) {
    showFieldError("apartament", "Apartamentul este obligatoriu")
    isValid = false
  }

  if (!serviciu) {
    showFieldError("serviciu", "Serviciul este obligatoriu")
    isValid = false
  }

  if (!suma || Number.parseFloat(suma) <= 0) {
    showFieldError("suma", "Suma trebuie să fie pozitivă")
    isValid = false
  }

  if (!luna) {
    showFieldError("luna", "Luna este obligatorie")
    isValid = false
  }

  return isValid
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId)
  if (!field) return

  field.style.borderColor = "#dc3545"

  // Adaugă mesajul de eroare
  let errorDiv = field.parentNode.querySelector(".error-message")
  if (!errorDiv) {
    errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.style.color = "#dc3545"
    errorDiv.style.fontSize = "12px"
    errorDiv.style.marginTop = "5px"
    field.parentNode.appendChild(errorDiv)
  }
  errorDiv.textContent = message
}

function clearValidationErrors() {
  const fields = ["apartament", "serviciu", "suma", "luna"]
  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    if (!field) return

    field.style.borderColor = "#e1e5e9"

    const errorDiv = field.parentNode.querySelector(".error-message")
    if (errorDiv) {
      errorDiv.remove()
    }
  })
}

// Funcții utilitare
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function showSuccess(message) {
  showToast(message, "success")
}

function showError(message) {
  showToast(message, "error")
}

function showToast(message, type) {
  // Elimină toast-urile existente
  const existingToasts = document.querySelectorAll(".toast")
  existingToasts.forEach((toast) => toast.remove())

  // Creează noul toast
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `
    ${message}
    <button class="close-toast" onclick="this.parentElement.remove()">×</button>
  `

  document.body.appendChild(toast)

  // Afișează toast-ul
  setTimeout(() => toast.classList.add("show"), 100)

  // Elimină toast-ul automat după 4 secunde
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => toast.remove(), 300)
  }, 4000)
}

// Inițializare când DOM-ul este gata
function initializeApp() {
  console.log("=== Inițializare aplicație plăți ===")

  // Verifică dacă elementele există înainte de a adăuga event listeners
  const addBtn = document.getElementById("addPlataBtn")
  const form = document.getElementById("plataForm")
  const closeBtn = document.getElementById("closeModal")
  const cancelBtn = document.getElementById("cancelBtn")
  const modal = document.getElementById("modal")
  const confirmDeleteBtn = document.getElementById("confirmDelete")
  const cancelDeleteBtn = document.getElementById("cancelDelete")
  const confirmModal = document.getElementById("confirmModal")

  if (addBtn) {
    addBtn.addEventListener("click", addPlata)
    console.log("Event listener adăugat pentru butonul Adaugă")
  } else {
    console.error("Butonul addPlataBtn nu a fost găsit!")
  }

  if (form) {
    form.addEventListener("submit", savePlata)
    console.log("Event listener adăugat pentru formă")
  } else {
    console.error("Formularul plataForm nu a fost găsit!")
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal)
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal)
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", deletePlata)
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeConfirmModal)

  // Închidere modal la click pe backdrop
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal()
      }
    })
  }

  if (confirmModal) {
    confirmModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeConfirmModal()
      }
    })
  }

  // Închidere modal cu ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal()
      closeConfirmModal()
    }
  })

  console.log("Încep încărcarea datelor...")
  Promise.all([fetchApartamente(), fetchServicii()]).then(() => {
    fetchPlati()
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  initializeApp()
}

window.testAPI = fetchPlati
window.plati = plati
window.apartamente = apartamente
window.servicii = servicii