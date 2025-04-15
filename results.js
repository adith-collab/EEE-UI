document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch data from the JSON file
    const response = await fetch("forecast_results.json");
    const data = await response.json();

    // Log data to debug
    console.log("Loaded Data:", data);

    // Extract data from the JSON object
    const actual = data.ActualLoad;
    const forecast = data.ForecastedLoad;
    const error = data.Error;
    const labels = Array.from({ length: actual.length }, (_, i) => `T${i + 1}`);

    // Full clear rendering for Forecast vs Actual Load Chart
    new Chart(document.getElementById("forecastChart").getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Actual Load",
            data: actual,
            borderColor: "green",
            backgroundColor: "rgba(0, 128, 0, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 0,  // No circles for points
          },
          {
            label: "Forecasted Load",
            data: forecast,
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 0,  // No circles for points
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: {
                size: 18,
                weight: "bold",
                color: "black",
                family: "Arial",
                lineHeight: 1.2
              },
              boxWidth: 20,
              padding: 20
            }
          },
          tooltip: {
            enabled: true,
            mode: "nearest",
            intersect: false,
            backgroundColor: "rgb(3, 3, 3)",
            borderColor: "black",
            borderWidth: 2,
            titleFont: {
              size: 22,
              weight: "bold",
              color: "black"
            },
            bodyFont: {
              size: 20,
              weight: "bold",
              color: "black"
            },
            padding: 25,
            caretSize: 12,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: (${context.label}, ${context.formattedValue})`;
              }
            }
          },
          zoom: {
            pan: {
              enabled: true,
              mode: "x"
            },
            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              mode: "x"
            }
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 25
            }
          },
          y: {
            beginAtZero: false
          }
        },
        // High DPI rendering
        devicePixelRatio: window.devicePixelRatio || 2
      }
    });

    // Full clear rendering for Error Chart
    new Chart(document.getElementById("errorChart").getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Absolute Error",
            data: error,
            backgroundColor: "orange"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: {
                size: 18,
                weight: "bold",
                color: "black",
                family: "Arial",
                lineHeight: 1.2
              },
              boxWidth: 20,
              padding: 20
            }
          },
          tooltip: {
            enabled: true,
            mode: "nearest",
            intersect: false,
            backgroundColor: "rgb(14, 12, 12)",
            borderColor: "black",
            borderWidth: 2,
            titleFont: {
              size: 22,
              weight: "bold",
              color: "black"
            },
            bodyFont: {
              size: 20,
              weight: "bold",
              color: "black"
            },
            padding: 25,
            caretSize: 12,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: (${context.label}, ${context.formattedValue})`;
              }
            }
          },
          zoom: {
            pan: {
              enabled: true,
              mode: "x"
            },
            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              mode: "x"
            }
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 25
            }
          },
          y: {
            beginAtZero: true
          }
        },
        // High DPI rendering
        devicePixelRatio: window.devicePixelRatio || 2
      }
    });

  } catch (error) {
    console.error("⚠️ Error loading forecast_results.json:", error);
  }
});
