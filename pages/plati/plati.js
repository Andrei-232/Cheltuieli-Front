let plati = []
let apartamente = []
let servicii = []
let editIndex = null
let deleteIndex = null
async function fetchApartamente() {
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
async function fetchServicii() {
  try {
    const response = await fetch("http://localhost:5176/servicii/getAll")
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    servicii = data.servicii || []
    populateServiciuDropdown()
  } catch (error) {
    showError("Nu s-au putut încărca serviciile. Verificați conexiunea la server.")
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
function populateServiciuDropdown() {
  const serviciuSelect = document.getElementById("serviciu")
  if (!serviciuSelect) return
  serviciuSelect.innerHTML = '<option value="">Selectează serviciul...</option>'
  servicii.forEach((serv) => {
    const option = document.createElement("option")
    option.value = serv.id
    option.textContent = `${serv.nume} (${serv.cod})`
    serviciuSelect.appendChild(option)
  })
}
async function fetchPlati() {
  try {
    const response = await fetch("http://localhost:5176/plati/getAll")
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    plati = data.plati || []
    renderTable()
  } catch (error) {
    showError("Nu s-au putut încărca datele. Verificați conexiunea la server.")
  }
}
function renderTable() {
  const tableBody = document.getElementById("platiTableBody")
  if (!tableBody) return
  if (plati.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="loading">Nu există plăți înregistrate</td></tr>`
    return
  }
  tableBody.innerHTML = ""
  plati.forEach((plata, index) => {
    const row = document.createElement("tr")
    const apartamentDisplay = plata.numarApartament ? `Apartament ${plata.numarApartament}` : "Necunoscut"
    const serviciuDisplay = plata.numeServiciu || "Necunoscut"
    row.innerHTML = `<td>${apartamentDisplay}</td><td>${escapeHtml(serviciuDisplay)}</td><td>${plata.suma.toFixed(2)} lei</td><td>${plata.luna}</td><td><button class="btn-icon edit" onclick="editPlata(${index})" title="Editează"><i class="fas fa-edit"></i></button></td>`
    tableBody.appendChild(row)
  })
}
function openModal(title = "Adaugă Plată") {
  const modalTitle = document.getElementById("modal-title")
  const modal = document.getElementById("modal")
  if (modalTitle) modalTitle.textContent = title
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"
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
  const apartamentSelect = document.getElementById("apartament")
  const serviciuSelect = document.getElementById("serviciu")
  const sumaInput = document.getElementById("suma")
  const lunaInput = document.getElementById("luna")
  if (!apartamentSelect || !serviciuSelect || !sumaInput || !lunaInput) {
    showError("Eroare: Nu s-au găsit toate câmpurile formularului!")
    return
  }
  apartamentSelect.value = plata.idApartament || ""
  serviciuSelect.value = plata.idServiciu || ""
  sumaInput.value = plata.suma || ""
  lunaInput.value = plata.luna || ""
  editIndex = index
  openModal("Editează Plată")
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
    const response = await fetch("http://localhost:5176/plati/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: id }),
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const result = await response.json()
    closeConfirmModal()
    showSuccess("Plată ștearsă cu succes!")
    await fetchPlati()
  } catch (error) {
    showError("Eroare la ștergerea plății!")
  }
}
async function savePlata(event) {
  event.preventDefault()
  if (!validateForm()) return
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
  try {
    let requestBody
    if (isEdit) {
      requestBody = JSON.stringify({ id: plati[editIndex].id, plata: formData })
    } else {
      requestBody = JSON.stringify(formData)
    }
    const response = await fetch(`http://localhost:5176${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: requestBody,
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const result = await response.json()
    if (result.success) {
      closeModal()
      showSuccess(`Plată ${isEdit ? "editată" : "adăugată"} cu succes!`)
      await fetchPlati()
    } else {
      showError(result.error || "Eroare necunoscută")
    }
  } catch (error) {
    showError(`Eroare la ${isEdit ? "editarea" : "adăugarea"} plății!`)
  }
}
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
  const addBtn = document.getElementById("addPlataBtn")
  const form = document.getElementById("plataForm")
  const closeBtn = document.getElementById("closeModal")
  const cancelBtn = document.getElementById("cancelBtn")
  const modal = document.getElementById("modal")
  const confirmDeleteBtn = document.getElementById("confirmDelete")
  const cancelDeleteBtn = document.getElementById("cancelDelete")
  const confirmModal = document.getElementById("confirmModal")
  if (addBtn) addBtn.addEventListener("click", addPlata)
  if (form) form.addEventListener("submit", savePlata)
  if (closeBtn) closeBtn.addEventListener("click", closeModal)
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal)
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", deletePlata)
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