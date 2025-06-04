// Variabile globale
let servicii = []
let editIndex = null
let deleteIndex = null

// Funcții pentru gestionarea datelor
async function fetchServicii() {
  try {
    console.log("=== Încărcare servicii ===")
    const response = await fetch("http://localhost:5176/servicii/getAll")

    console.log("Response status:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Date servicii primite:", data)

    servicii = data.servicii || []
    console.log("Servicii procesate:", servicii)
    renderTable()
  } catch (error) {
    console.error("Eroare la încărcarea serviciilor:", error)
    showError("Nu s-au putut încărca datele. Verificați conexiunea la server.")
  }
}

function renderTable() {
  const tableBody = document.getElementById("serviciiTableBody")

  if (!tableBody) {
    console.error("Element serviciiTableBody nu a fost găsit!")
    return
  }

  if (servicii.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3" class="loading">Nu există servicii înregistrate</td>
      </tr>
    `
    return
  }

  tableBody.innerHTML = ""

  servicii.forEach((serviciu, index) => {
    const row = document.createElement("tr")

    // CU BUTOANELE DE EDITARE ȘI ȘTERGERE
    row.innerHTML = `
      <td>${escapeHtml(serviciu.nume)}</td>
      <td>${escapeHtml(serviciu.cod)}</td>
      <td>
        <button class="btn-icon edit" onclick="editServiciu(${index})" title="Editează">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon delete" onclick="confirmDeleteServiciu(${index})" title="Șterge">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `
    tableBody.appendChild(row)
  })

  console.log(`Tabel randat cu ${servicii.length} servicii`)
}

// Funcții pentru modal
function openModal(title = "Adaugă Serviciu") {
  const modalTitle = document.getElementById("modal-title")
  const modal = document.getElementById("modal")

  if (modalTitle) modalTitle.textContent = title
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"

    // Focus pe primul input
    setTimeout(() => {
      const numeInput = document.getElementById("nume")
      if (numeInput) numeInput.focus()
    }, 100)
  }
}

function closeModal() {
  const modal = document.getElementById("modal")
  const form = document.getElementById("serviciuForm")

  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  if (form) form.reset()
  editIndex = null
  clearValidationErrors()
}

// Funcții CRUD (FĂRĂ DELETE)
function addServiciu() {
  editIndex = null
  openModal("Adaugă Serviciu")
}

function editServiciu(index) {
  if (index < 0 || index >= servicii.length) {
    showError("Serviciu invalid!")
    return
  }

  const serviciu = servicii[index]
  console.log("=== Editare serviciu ===")
  console.log("Serviciu selectat:", serviciu)

  // Verifică dacă toate câmpurile există înainte de a le popula
  const numeInput = document.getElementById("nume")
  const codInput = document.getElementById("cod")

  if (!numeInput || !codInput) {
    showError("Eroare: Nu s-au găsit toate câmpurile formularului!")
    return
  }

  // Populează câmpurile cu datele serviciului
  numeInput.value = serviciu.nume || ""
  codInput.value = serviciu.cod || ""

  editIndex = index
  openModal("Editează Serviciu")

  console.log("Câmpuri populate pentru editare")
}

function confirmDeleteServiciu(index) {
  deleteIndex = index
  openConfirmModal()
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

async function deleteServiciu() {
  if (deleteIndex === null || deleteIndex < 0 || deleteIndex >= servicii.length) {
    showError("Serviciu invalid!")
    return
  }

  const id = servicii[deleteIndex].id

  try {
    console.log("Ștergere serviciu cu ID:", id)

    const response = await fetch("http://localhost:5176/servicii/delete", {
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
    showSuccess("Serviciu șters cu succes!")
    await fetchServicii()
  } catch (error) {
    console.error("Eroare la ștergere:", error)
    showError("Eroare la ștergerea serviciului!")
  }
}

// FUNCȚIILE DE ȘTERGERE AU FOST ELIMINATE

async function saveServiciu(event) {
  event.preventDefault()

  console.log("=== Salvare serviciu ===")

  if (!validateForm()) {
    return
  }

  const numeInput = document.getElementById("nume")
  const codInput = document.getElementById("cod")

  const formData = {
    nume: numeInput ? numeInput.value.trim() : "",
    cod: codInput ? codInput.value.trim() : "",
  }

  const isEdit = editIndex !== null
  const endpoint = isEdit ? "/servicii/update" : "/servicii/add"

  console.log("Date formular:", formData)
  console.log("Este editare:", isEdit)
  console.log("Endpoint:", endpoint)

  try {
    let requestBody
    if (isEdit) {
      requestBody = JSON.stringify({
        id: servicii[editIndex].id,
        serviciu: formData,
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
      showSuccess(`Serviciu ${isEdit ? "editat" : "adăugat"} cu succes!`)
      await fetchServicii()
    } else {
      showError(result.error || "Eroare necunoscută")
    }
  } catch (error) {
    console.error("Eroare la salvare:", error)
    showError(`Eroare la ${isEdit ? "editarea" : "adăugarea"} serviciului!`)
  }
}

// Funcții de validare
function validateForm() {
  clearValidationErrors()
  let isValid = true

  const numeInput = document.getElementById("nume")
  const codInput = document.getElementById("cod")

  const nume = numeInput ? numeInput.value.trim() : ""
  const cod = codInput ? codInput.value.trim() : ""

  if (!nume) {
    showFieldError("nume", "Numele serviciului este obligatoriu")
    isValid = false
  } else if (nume.length < 2) {
    showFieldError("nume", "Numele trebuie să aibă cel puțin 2 caractere")
    isValid = false
  }

  if (!cod) {
    showFieldError("cod", "Codul serviciului este obligatoriu")
    isValid = false
  } else if (cod.length < 2) {
    showFieldError("cod", "Codul trebuie să aibă cel puțin 2 caractere")
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
  const fields = ["nume", "cod"]
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
  console.log("=== Inițializare aplicație servicii ===")

  // Verifică dacă elementele există înainte de a adăuga event listeners
  const addBtn = document.getElementById("addServiciuBtn")
  const form = document.getElementById("serviciuForm")
  const closeBtn = document.getElementById("closeModal")
  const cancelBtn = document.getElementById("cancelBtn")
  const modal = document.getElementById("modal")
  const confirmDeleteBtn = document.getElementById("confirmDelete")
  const cancelDeleteBtn = document.getElementById("cancelDelete")
  const confirmModal = document.getElementById("confirmModal")

  if (addBtn) {
    addBtn.addEventListener("click", addServiciu)
    console.log("Event listener adăugat pentru butonul Adaugă")
  } else {
    console.error("Butonul addServiciuBtn nu a fost găsit!")
  }

  if (form) {
    form.addEventListener("submit", saveServiciu)
    console.log("Event listener adăugat pentru formă")
  } else {
    console.error("Formularul serviciuForm nu a fost găsit!")
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal)
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal)

  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", deleteServiciu)
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeConfirmModal)

  // Închidere modal la click pe backdrop
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal()
      }
    })
  }

  // Închidere modal la click pe backdrop
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

  // Încărcare inițială
  console.log("Încep încărcarea serviciilor...")
  fetchServicii()
}

// Event listener pentru DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  // DOM-ul este deja încărcat
  initializeApp()
}

// Expunere funcții pentru debugging
window.testAPI = fetchServicii
window.servicii = servicii

// Test manual pentru debugging
window.testAddServiciu = () => {
  const testData = {
    nume: "Test Serviciu",
    cod: "TEST001",
  }

  fetch("http://localhost:5176/servicii/add", {
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