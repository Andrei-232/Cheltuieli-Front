document.addEventListener("DOMContentLoaded", () => {
  console.log("Pagina s-a încărcat, încep să încarc datele...")
  loadTotalApartments()
  loadTotalPlati()
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

  // Numele lunilor în română
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

  // Culori diferite pentru fiecare apartament
  var culori = [
    "#FF6384", // Roz
    "#36A2EB", // Albastru
    "#FFCE56", // Galben
    "#4BC0C0", // Turcoaz
    "#9966FF", // Violet
    "#FF9F40", // Portocaliu
    "#FF6B6B", // Roșu deschis
    "#4ECDC4", // Verde-albastru
    "#45B7D1", // Albastru deschis
    "#96CEB4", // Verde mentă
    "#FFEAA7", // Galben deschis
    "#DDA0DD", // Violet deschis
    "#87CEEB", // Albastru cer
    "#F0E68C", // Khaki
    "#FFB6C1", // Roz deschis
  ]

  var datasets = []

  if (apiData && apiData.apartamente && apiData.apartamente.length > 0) {
    console.log("Folosesc datele de la API")

    // Creez un dataset pentru fiecare apartament
    for (var i = 0; i < apiData.apartamente.length; i++) {
      var apt = apiData.apartamente[i]
      var culoare = culori[i % culori.length]

      datasets.push({
        label: "Apartament Nr." + apt.numar,
        data: apt.plati,
        borderColor: culoare,
        backgroundColor: culoare + "20", // Transparență 20%
        tension: 0.4, // Linii curbate
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: culoare,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: culoare,
        pointHoverBorderWidth: 3,
        borderWidth: 3,
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

  // Creează noua diagramă Line Chart
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
            size: 20,
            weight: "bold",
          },
          padding: 25,
          color: "#333",
        },
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
            },
            color: "#333",
          },
        },
        tooltip: {
          mode: "point",
          intersect: false,
          backgroundColor: "rgba(0,0,0,0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#ddd",
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (context) => {
              return context[0].label
            },
            label: (context) => context.dataset.label + ": " + context.parsed.y.toLocaleString() + " lei",
            afterLabel: (context) => "Luna: " + context.label,
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
            color: "#666",
          },
          grid: {
            display: true,
            color: "#e0e0e0",
            lineWidth: 1,
          },
          ticks: {
            font: {
              size: 11,
            },
            color: "#666",
            maxRotation: 45,
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
            color: "#666",
          },
          min: 0,
          ticks: {
            stepSize: 500,
            font: {
              size: 11,
            },
            color: "#666",
            callback: (value) => {

              return value.toLocaleString() + " lei"
            },
          },
          grid: {
            display: true,
            color: "#e0e0e0",
            lineWidth: 1,
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
          hoverBorderWidth: 3,
        },
        line: {
          borderWidth: 3,
        },
      },
      animation: {
        duration: 1000,
        easing: "easeInOutQuart",
      },
    },
  })
}

function refreshChart() {
  console.log("Refresh diagrama...")
  loadChartData()
  loadTotalApartments()
  loadTotalPlati()
}

function testAPI() {
  console.log("Test manual API...")
  loadTotalApartments()
  loadTotalPlati()
  loadChartData()
}

window.refreshChart = refreshChart
window.testAPI = testAPI

console.log("JavaScript-ul cheltuieli.js s-a încărcat cu succes!")
console.log("Diagrama Line Chart este configurată pentru:")
console.log("- Axa X: 12 luni în română")
console.log("- Axa Y: Valori automate cu formatare pentru mii de lei")
console.log("- Titlu: 'Raport de plăți per lună'")
console.log("- Linii colorate pentru fiecare apartament")
console.log("- Tooltip cu numărul apartamentului la hover")