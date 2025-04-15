document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("demandForm");
  const result = document.getElementById("result");
  const chartCanvas = document.getElementById("demandChart");
  const downloadBtn = document.getElementById("downloadChart");
  let demandChart;

  // Load theme from localStorage
  const themeToggle = document.getElementById("themeToggle");
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light", currentTheme === "light");
  themeToggle.checked = currentTheme === "light";

  themeToggle.addEventListener("change", () => {
    const theme = themeToggle.checked ? "light" : "dark";
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      data[key] = parseFloat(value);
    });

    // Predict demand (custom formula)
    const predictedDemand = (
      0.35 * data.week_X2 +
      0.25 * data.week_X3 +
      0.15 * data.week_X4 +
      0.1 * data.ma_X4 +
      0.05 * data.T2M_toc +
      0.03 * data.hourOfDay -
      0.05 * data.holiday -
      0.03 * data.weekend +
      0.02 * data.dayOfWeek
    );

    const demand = predictedDemand.toFixed(2);
    result.innerText = ` Predicted Demand: ${demand}`;

    const historicalData = [
      data.week_X4.toFixed(2),
      data.week_X3.toFixed(2),
      data.week_X2.toFixed(2),
    ];

    const chartData = {
      labels: ["Week X-4", "Week X-3", "Week X-2", "Predicted"],
      datasets: [{
        label: "Demand (kWh)",
        data: [...historicalData, demand],
        backgroundColor: ["#2196F3", "#2196F3", "#2196F3", "#4CAF50"],
        borderColor: "#4CAF50",
        fill: false,
        tension: 0.3
      }]
    };

    if (demandChart) demandChart.destroy();
    demandChart = new Chart(chartCanvas, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: getComputedStyle(document.body).color
            }
          },
          x: {
            ticks: {
              color: getComputedStyle(document.body).color
            }
          }
        }
      }
    });
  });

  // Download chart as image
  downloadBtn.addEventListener("click", () => {
    const link = document.createElement('a');
    link.download = 'demand_chart.png';
    link.href = chartCanvas.toDataURL("image/png");
    link.click();
  });
});
