// Variabile globale
let apartamente = []
let editIndex = null

// Funcții pentru gestionarea datelor
async function fetchApartamente() {
  try {
    console.log("=== Încărcare apartamente ===")
    const response = await fetch("http://localhost:5176/apartamente/getAll")

    console.log("Response status:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Date apartamente primite:", data)

    apartamente = data.apartamente || []
    console.log("Apartamente procesate:", apartamente)
    renderTable()
  } catch (error) {
    console.error("Eroare la încărcarea apartamentelor:", error)
    showError("Nu s-au putut încărca datele. Verificați conexiunea la server.")
  }
}

function renderTable() {
  const tableBody = document.getElementById("apartamenteTableBody")

  if (!tableBody) {
    console.error("Element apartamenteTableBody nu a fost găsit!")
    return
  }

  if (apartamente.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="loading">Nu există apartamente înregistrate</td>
      </tr>
    `
    return
  }

  tableBody.innerHTML = ""

  apartamente.forEach((apartament, index) => {
    const row = document.createElement("tr")

    // DOAR BUTONUL DE EDITARE - FĂRĂ ȘTERGERE
    row.innerHTML = `
      <td>${apartament.numar}</td>
      <td>${apartament.etaj}</td>
      <td>${apartament.suprafata} m²</td>
      <td>${apartament.numarCamere}</td>
      <td>
        <span class="status-badge ${apartament.incalzireCentralizata ? "da" : "nu"}">
          ${apartament.incalzireCentralizata ? "Da" : "Nu"}
        </span>
      </td>
      <td>
        <span class="status-badge ${apartament.incalzireAutonoma ? "da" : "nu"}">
          ${apartament.incalzireAutonoma ? "Da" : "Nu"}
        </span>
      </td>
      <td>
        <button class="btn-icon edit" onclick="editApartament(${index})" title="Editează">
          <i class="fas fa-edit"></i>
        </button>
      </td>
    `
    tableBody.appendChild(row)
  })

  console.log(`Tabel randat cu ${apartamente.length} apartamente`)
}

// Funcții pentru modal
function openModal(title = "Adaugă Apartament") {
  const modalTitle = document.getElementById("modal-title")
  const modal = document.getElementById("modal")

  if (modalTitle) modalTitle.textContent = title
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"

    // Focus pe primul input
    setTimeout(() => {
      const numarInput = document.getElementById("numar")
      if (numarInput) numarInput.focus()
    }, 100)
  }
}

function closeModal() {
  const modal = document.getElementById("modal")
  const form = document.getElementById("apartmentForm")

  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  if (form) form.reset()
  editIndex = null
  clearValidationErrors()
}

// Funcții CRUD (FĂRĂ DELETE)
function addApartament() {
  editIndex = null
  openModal("Adaugă Apartament")
}

function editApartament(index) {
  if (index < 0 || index >= apartamente.length) {
    showError("Apartament invalid!")
    return
  }

  const apartament = apartamente[index]
  console.log("=== Editare apartament ===")
  console.log("Apartament selectat:", apartament)

  // Verifică dacă toate câmpurile există înainte de a le popula
  const numarInput = document.getElementById("numar")
  const etajInput = document.getElementById("etaj")
  const suprafataInput = document.getElementById("suprafata")
  const numarCamereInput = document.getElementById("numarCamere")
  const incalzireCentralizataInput = document.getElementById("incalzireCentralizata")
  const incalzireAutonomaInput = document.getElementById("incalzireAutonoma")

  if (
    !numarInput ||
    !etajInput ||
    !suprafataInput ||
    !numarCamereInput ||
    !incalzireCentralizataInput ||
    !incalzireAutonomaInput
  ) {
    showError("Eroare: Nu s-au găsit toate câmpurile formularului!")
    return
  }

  // Populează câmpurile cu datele apartamentului
  numarInput.value = apartament.numar || ""
  etajInput.value = apartament.etaj || ""
  // Suprafața este acum string, dar o convertim pentru input
  suprafataInput.value = apartament.suprafata ? Number.parseFloat(apartament.suprafata) : ""
  numarCamereInput.value = apartament.numarCamere || ""
  incalzireCentralizataInput.checked = apartament.incalzireCentralizata || false
  incalzireAutonomaInput.checked = apartament.incalzireAutonoma || false

  editIndex = index
  openModal("Editează Apartament")

  console.log("Câmpuri populate pentru editare")
}

// FUNCȚIILE DE ȘTERGERE AU FOST ELIMINATE

async function saveApartament(event) {
  event.preventDefault()

  console.log("=== Salvare apartament ===")

  if (!validateForm()) {
    return
  }

  const numarInput = document.getElementById("numar")
  const etajInput = document.getElementById("etaj")
  const suprafataInput = document.getElementById("suprafata")
  const numarCamereInput = document.getElementById("numarCamere")
  const incalzireCentralizataInput = document.getElementById("incalzireCentralizata")
  const incalzireAutonomaInput = document.getElementById("incalzireAutonoma")

  const formData = {
    numar: numarInput ? Number.parseInt(numarInput.value) : 0,
    etaj: etajInput ? Number.parseInt(etajInput.value) : 0,
    suprafata: suprafataInput ? Number.parseFloat(suprafataInput.value) : 0.0, // Va fi convertit la string în backend
    numarCamere: numarCamereInput ? Number.parseInt(numarCamereInput.value) : 0,
    incalzireCentralizata: incalzireCentralizataInput ? incalzireCentralizataInput.checked : false,
    incalzireAutonoma: incalzireAutonomaInput ? incalzireAutonomaInput.checked : false,
  }

  const isEdit = editIndex !== null
  const endpoint = isEdit ? "/apartamente/update" : "/apartamente/add"

  console.log("Date formular:", formData)
  console.log("Este editare:", isEdit)
  console.log("Endpoint:", endpoint)

  try {
    let requestBody
    if (isEdit) {
      requestBody = JSON.stringify({
        id: apartamente[editIndex].id,
        apartament: formData,
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
      showSuccess(`Apartament ${isEdit ? "editat" : "adăugat"} cu succes!`)
      await fetchApartamente()
    } else {
      showError(result.error || "Eroare necunoscută")
    }
  } catch (error) {
    console.error("Eroare la salvare:", error)
    showError(`Eroare la ${isEdit ? "editarea" : "adăugarea"} apartamentului!`)
  }
}

// Funcții de validare
function validateForm() {
  clearValidationErrors()
  let isValid = true

  const numarInput = document.getElementById("numar")
  const etajInput = document.getElementById("etaj")
  const suprafataInput = document.getElementById("suprafata")
  const numarCamereInput = document.getElementById("numarCamere")

  const numar = numarInput ? numarInput.value : ""
  const etaj = etajInput ? etajInput.value : ""
  const suprafata = suprafataInput ? suprafataInput.value : ""
  const numarCamere = numarCamereInput ? numarCamereInput.value : ""

  if (!numar || numar <= 0) {
    showFieldError("numar", "Numărul apartamentului trebuie să fie pozitiv")
    isValid = false
  }

  if (!etaj || etaj < 0) {
    showFieldError("etaj", "Etajul nu poate fi negativ")
    isValid = false
  }

  if (!suprafata || suprafata <= 0) {
    showFieldError("suprafata", "Suprafața trebuie să fie pozitivă")
    isValid = false
  }

  if (!numarCamere || numarCamere <= 0) {
    showFieldError("numarCamere", "Numărul de camere trebuie să fie pozitiv")
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
  const fields = ["numar", "etaj", "suprafata", "numarCamere"]
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
  console.log("=== Inițializare aplicație apartamente ===")

  // Verifică dacă elementele există înainte de a adăuga event listeners
  const addBtn = document.getElementById("addApartmentBtn")
  const form = document.getElementById("apartmentForm")
  const closeBtn = document.getElementById("closeModal")
  const cancelBtn = document.getElementById("cancelBtn")
  const modal = document.getElementById("modal")

  if (addBtn) {
    addBtn.addEventListener("click", addApartament)
    console.log("Event listener adăugat pentru butonul Adaugă")
  } else {
    console.error("Butonul addApartmentBtn nu a fost găsit!")
  }

  if (form) {
    form.addEventListener("submit", saveApartament)
    console.log("Event listener adăugat pentru formă")
  } else {
    console.error("Formularul apartmentForm nu a fost găsit!")
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal)
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal)

  // Închidere modal la click pe backdrop
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal()
      }
    })
  }

  // Închidere modal cu ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal()
    }
  })

  // Încărcare inițială
  console.log("Încep încărcarea apartamentelor...")
  fetchApartamente()
}

// Event listener pentru DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  // DOM-ul este deja încărcat
  initializeApp()
}

// Expunere funcții pentru debugging
window.testAPI = fetchApartamente
window.apartamente = apartamente

// Test manual pentru debugging
window.testAddApartament = () => {
  const testData = {
    numar: 999,
    etaj: 1,
    suprafata: 50.5,
    numarCamere: 2,
    incalzireCentralizata: true,
    incalzireAutonoma: false,
  }

  fetch("http://localhost:5176/apartamente/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(testData),
  })
    .then((response) => response.json())
    .then((data) => console.log("Test result:", data))
    .catch((error) => console.error("Test error:", error))
}