import { Chart } from "@/components/ui/chart"
// JavaScript simplu pentru cheltuieli.html - FĂRĂ IMPORT STATEMENTS
document.addEventListener("DOMContentLoaded", () => {
  console.log("Pagina s-a încărcat, încep să încarc datele...")

  // Încărcarea statisticilor existente
  loadTotalApartments()
  loadTotalPlati()

  // Încărcarea datelor pentru diagramă
  loadChartData()
})

function loadTotalApartments() {
  console.log("Încarc total apartamente...")
  fetch("http://localhost:5176/cheltuieli/getTotalApartments")
    .then((response) => {
      console.log("Răspuns getTotalApartments:", response)
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Date apartamente primite:", data)
      document.getElementById("total-apartamente").textContent = data.totalApartments
    })
    .catch((error) => {
      console.error("Eroare la încărcarea apartamentelor:", error)
      document.getElementById("total-apartamente").textContent = "Eroare"
    })
}

function loadTotalPlati() {
  console.log("Încarc total plăți...")
  fetch("http://localhost:5176/cheltuieli/getTotalPlati")
    .then((response) => {
      console.log("Răspuns getTotalPlati:", response)
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Date plăți primite:", data)
      document.getElementById("total-plati").textContent = data.totalPlati
    })
    .catch((error) => {
      console.error("Eroare la încărcarea plăților:", error)
      document.getElementById("total-plati").textContent = "Eroare"
    })
}

function loadChartData() {
  console.log("Încarc datele pentru diagramă...")
  fetch("http://localhost:5176/cheltuieli/getPlatiPerLuna")
    .then((response) => {
      console.log("Răspuns getPlatiPerLuna:", response)
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status)
      }
      return response.json()
    })
    .then((data) => {
      console.log("Date diagramă primite:", data)
      createChart(data)
    })
    .catch((error) => {
      console.error("Eroare la încărcarea datelor pentru diagramă:", error)
      showErrorMessage("Nu s-au putut încărca datele. Verificați conexiunea la server.")
    })
}

function showErrorMessage(message) {
  var ctx = document.getElementById("platiChart").getContext("2d")
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.font = "16px Arial"
  ctx.fillStyle = "#d32f2f"
  ctx.textAlign = "center"
  ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2)
}

function createChart(apiData) {
  console.log("Creez diagrama cu datele:", apiData)

  var ctx = document.getElementById("platiChart").getContext("2d")

  var luni = [
    "Ianuarie",
    "Februarie",
    "Martie",
    "Aprilie",
    "Mai",
    "Iunie",
    "Iulie",
    "August",
    "Septembrie",
    "Octombrie",
    "Noiembrie",
    "Decembrie",
  ]

  var culori = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
  ]

  var datasets = []

  if (apiData && apiData.apartamente && apiData.apartamente.length > 0) {
    console.log("Folosesc datele de la API")

    for (var i = 0; i < apiData.apartamente.length; i++) {
      var apt = apiData.apartamente[i]
      datasets.push({
        label: "Apartament Nr." + apt.numar,
        data: apt.plati,
        borderColor: culori[i % culori.length],
        backgroundColor: culori[i % culori.length] + "20",
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 8,
      })
    }
  } else {
    console.warn("Nu s-au găsit date de la API")
    showErrorMessage("Nu există date disponibile pentru diagramă")
    return
  }

  var chartData = {
    labels: luni,
    datasets: datasets,
  }

  // Distruge diagrama existentă dacă există
  var existingChart = Chart.getChart(ctx)
  if (existingChart) {
    existingChart.destroy()
  }

  // Creează noua diagramă
  new Chart(ctx, {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Raport de plăți per lună",
          font: {
            size: 18,
            weight: "bold",
          },
          padding: 20,
        },
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          mode: "point",
          intersect: false,
          callbacks: {
            title: (context) => context[0].label,
            label: (context) => context.dataset.label + ": " + context.parsed.y + " lei",
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Luni",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          grid: {
            display: true,
            color: "#e0e0e0",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Valoare (lei)",
            font: {
              size: 14,
              weight: "bold",
            },
          },
          min: 0,
          ticks: {
            stepSize: 50,
          },
          grid: {
            display: true,
            color: "#e0e0e0",
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
      elements: {
        point: {
          hoverBackgroundColor: "#fff",
          hoverBorderWidth: 2,
        },
      },
    },
  })
}

function refreshChart() {
  console.log("Refresh diagrama...")
  loadChartData()
}

function testAPI() {
  console.log("Test manual API...")
  loadTotalApartments()
  loadTotalPlati()
  loadChartData()
}

// Expune funcțiile pentru debugging
window.refreshChart = refreshChart
window.testAPI = testAPI

// Test simplu pentru a verifica dacă JavaScript-ul se încarcă
console.log("JavaScript-ul cheltuieli.js s-a încărcat cu succes!")