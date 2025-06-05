let locatari = []
let apartamente = []
let editIndex = null
let deleteIndex = null
async function fetchApartments() {
  try {
    const response = await fetch("http://localhost:5176/locatari/getApartments")
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    apartamente = data.apartamente || []
    populateApartmentDropdown()
  } catch (error) {
    showError("Nu s-au putut încărca apartamentele. Verificați conexiunea la server.")
  }
}
function populateApartmentDropdown() {
  const apartamentSelect = document.getElementById("apartament")
  if (!apartamentSelect) return
  apartamentSelect.innerHTML = '<option value="">Selectează apartamentul...</option>'
  apartamente.forEach((apt) => {
    const option = document.createElement("option")
    option.value = apt.id
    option.textContent = `Apartament ${apt.numar}`
    apartamentSelect.appendChild(option)
  })
}
async function fetchLocatari() {
  try {
    const response = await fetch("http://localhost:5176/locatari/getResidents")
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    locatari = data.locatari || []
    renderTable()
  } catch (error) {
    showError("Nu s-au putut încărca datele. Verificați conexiunea la server.")
  }
}
function renderTable() {
  const tableBody = document.getElementById("locatariTableBody")
  if (!tableBody) return
  if (locatari.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="loading">Nu există locatari înregistrați</td></tr>`
    return
  }
  tableBody.innerHTML = ""
  locatari.forEach((locatar, index) => {
    const row = document.createElement("tr")
    const apartamentDisplay = locatar.numarApartament ? `Apartament ${locatar.numarApartament}` : "Necunoscut"
    row.innerHTML = `<td>${escapeHtml(locatar.nume)}</td><td>${escapeHtml(locatar.cnp)}</td><td>${locatar.varsta}</td><td><span class="status-badge ${locatar.pensionar ? "da" : "nu"}">${locatar.pensionar ? "Da" : "Nu"}</span></td><td>${apartamentDisplay}</td><td><button class="btn-icon edit" onclick="editLocatar(${index})" title="Editează"><i class="fas fa-edit"></i></button><button class="btn-icon delete" onclick="confirmDeleteLocatar(${index})" title="Șterge"><i class="fas fa-trash-alt"></i></button></td>`
    tableBody.appendChild(row)
  })
}
function openModal(title = "Adaugă Locatar") {
  const modalTitle = document.getElementById("modal-title")
  const modal = document.getElementById("modal")
  if (modalTitle) modalTitle.textContent = title
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"
    setTimeout(() => {
      const numeInput = document.getElementById("nume")
      if (numeInput) numeInput.focus()
    }, 100)
  }
}
function closeModal() {
  const modal = document.getElementById("modal")
  const form = document.getElementById("locatarForm")
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
function addLocatar() {
  editIndex = null
  openModal("Adaugă Locatar")
}
function editLocatar(index) {
  if (index < 0 || index >= locatari.length) {
    showError("Locatar invalid!")
    return
  }
  const locatar = locatari[index]
  const numeInput = document.getElementById("nume")
  const cnpInput = document.getElementById("cnp")
  const varstaInput = document.getElementById("varsta")
  const pensionarInput = document.getElementById("pensionar")
  const apartamentSelect = document.getElementById("apartament")
  if (!numeInput || !cnpInput || !varstaInput || !pensionarInput || !apartamentSelect) {
    showError("Eroare: Nu s-au găsit toate câmpurile formularului!")
    return
  }
  numeInput.value = locatar.nume || ""
  cnpInput.value = locatar.cnp || ""
  varstaInput.value = locatar.varsta || ""
  pensionarInput.checked = locatar.pensionar || false
  apartamentSelect.value = locatar.apartament || ""
  editIndex = index
  openModal("Editează Locatar")
}
function confirmDeleteLocatar(index) {
  deleteIndex = index
  openConfirmModal()
}
async function deleteLocatar() {
  if (deleteIndex === null || deleteIndex < 0 || deleteIndex >= locatari.length) {
    showError("Locatar invalid!")
    return
  }
  const cnp = locatari[deleteIndex].cnp
  try {
    const response = await fetch("http://localhost:5176/locatari/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ cnp: cnp }),
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const result = await response.json()
    closeConfirmModal()
    showSuccess("Locatar șters cu succes!")
    await fetchLocatari()
  } catch (error) {
    showError("Eroare la ștergerea locatarului!")
  }
}
async function saveLocatar(event) {
  event.preventDefault()
  if (!validateForm()) return
  const numeInput = document.getElementById("nume")
  const cnpInput = document.getElementById("cnp")
  const varstaInput = document.getElementById("varsta")
  const pensionarInput = document.getElementById("pensionar")
  const apartamentSelect = document.getElementById("apartament")
  const formData = {
    nume: numeInput ? numeInput.value.trim() : "",
    cnp: cnpInput ? cnpInput.value.trim() : "",
    varsta: varstaInput ? Number.parseInt(varstaInput.value) : 0,
    pensionar: pensionarInput ? pensionarInput.checked : false,
    apartament: apartamentSelect ? apartamentSelect.value : "",
  }
  const isEdit = editIndex !== null
  const endpoint = isEdit ? "/locatari/update" : "/locatari/add"
  try {
    const response = await fetch(`http://localhost:5176${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(formData),
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const result = await response.json()
    if (result.success) {
      closeModal()
      showSuccess(`Locatar ${isEdit ? "editat" : "adăugat"} cu succes!`)
      await fetchLocatari()
    } else {
      showError(result.error || "Eroare necunoscută")
    }
  } catch (error) {
    showError(`Eroare la ${isEdit ? "editarea" : "adăugarea"} locatarului!`)
  }
}
function validateForm() {
  clearValidationErrors()
  let isValid = true
  const numeInput = document.getElementById("nume")
  const cnpInput = document.getElementById("cnp")
  const varstaInput = document.getElementById("varsta")
  const apartamentSelect = document.getElementById("apartament")
  const nume = numeInput ? numeInput.value.trim() : ""
  const cnp = cnpInput ? cnpInput.value.trim() : ""
  const varsta = varstaInput ? varstaInput.value : ""
  const apartament = apartamentSelect ? apartamentSelect.value : ""
  if (!nume) {
    showFieldError("nume", "Numele este obligatoriu")
    isValid = false
  } else if (nume.length < 2) {
    showFieldError("nume", "Numele trebuie să aibă cel puțin 2 caractere")
    isValid = false
  }
  if (!cnp) {
    showFieldError("cnp", "CNP-ul este obligatoriu")
    isValid = false
  } else if (!/^\d{13}$/.test(cnp)) {
    showFieldError("cnp", "CNP-ul trebuie să aibă exact 13 cifre")
    isValid = false
  }
  if (!varsta) {
    showFieldError("varsta", "Vârsta este obligatorie")
    isValid = false
  } else if (varsta < 1 || varsta > 120) {
    showFieldError("varsta", "Vârsta trebuie să fie între 1 și 120 ani")
    isValid = false
  }
  if (!apartament) {
    showFieldError("apartament", "Apartamentul este obligatoriu")
    isValid = false
  }
  return isValid
}
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId)
  if (!field) return
  field.style.borderColor = "#dc3545"
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
  const fields = ["nume", "cnp", "varsta", "apartament"]
  fields.forEach((fieldId) => {
    const field = document.getElementById(fieldId)
    if (!field) return
    field.style.borderColor = "#e1e5e9"
    const errorDiv = field.parentNode.querySelector(".error-message")
    if (errorDiv) errorDiv.remove()
  })
}
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
  const existingToasts = document.querySelectorAll(".toast")
  existingToasts.forEach((toast) => toast.remove())
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `${message}<button class="close-toast" onclick="this.parentElement.remove()">×</button>`
  document.body.appendChild(toast)
  setTimeout(() => toast.classList.add("show"), 100)
  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => toast.remove(), 300)
  }, 4000)
}
function initializeApp() {
  const addBtn = document.getElementById("addLocatarBtn")
  const form = document.getElementById("locatarForm")
  const closeBtn = document.getElementById("closeModal")
  const cancelBtn = document.getElementById("cancelBtn")
  const confirmDeleteBtn = document.getElementById("confirmDelete")
  const cancelDeleteBtn = document.getElementById("cancelDelete")
  const modal = document.getElementById("modal")
  const confirmModal = document.getElementById("confirmModal")
  if (addBtn) addBtn.addEventListener("click", addLocatar)
  if (form) form.addEventListener("submit", saveLocatar)
  if (closeBtn) closeBtn.addEventListener("click", closeModal)
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal)
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", deleteLocatar)
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeConfirmModal)
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) closeModal()
    })
  }
  if (confirmModal) {
    confirmModal.addEventListener("click", function (e) {
      if (e.target === this) closeConfirmModal()
    })
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal()
      closeConfirmModal()
    }
  })
  fetchApartments().then(() => {
    fetchLocatari()
  })
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp)
} else {
  initializeApp()
}
window.testAPI = fetchLocatari
window.locatari = locatari
window.apartamente = apartamente