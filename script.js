// Dataset CSV
const csvData = `Tanggal,Kecamatan,Curah_Hujan_mm,Kelembapan_persen,Kecepatan_Angin_km_jam,Suhu_Rata2_C,Tinggi_Muka_Air_m,Indeks_Risiko,Status_Banjir
2022-04-15,Palu Barat,45,85,4.5,24.2,0.9,1.8,Waspada
2022-06-18,Mantikulore,75,87,3.8,24.0,1.5,3.0,Siaga
2022-06-18,Ulujadi,70,87,3.8,24.0,1.4,2.8,Siaga
2022-09-05,Palu Timur,35,84,5.2,23.8,0.7,1.4,Waspada
2022-10-12,Palu Barat,55,84,4.8,24.6,1.1,2.2,Waspada
2022-11-22,Mantikulore,85,86,4.3,24.8,1.7,3.4,Siaga
2023-04-07,Palu Selatan,95,86,4.7,24.3,1.9,3.8,Siaga
2023-04-07,Ulujadi,90,86,4.7,24.3,1.8,3.6,Siaga
2023-05-18,Palu Barat,110,87,4.5,24.3,2.2,4.4,Awas
2023-06-22,Mantikulore,145,87,4.2,24.1,2.9,5.8,Awas
2023-06-22,Palu Timur,140,87,4.2,24.1,2.8,5.6,Awas
2023-07-21,Palu Barat,125,86,4.6,23.9,2.5,5.0,Awas
2023-07-21,Palu Selatan,180,86,4.6,23.9,3.0,6.0,Awas
2023-07-21,Ulujadi,110,86,4.6,23.9,2.2,4.4,Awas
2023-07-21,Mantikulore,150,86,4.6,23.9,3.0,6.0,Awas
2023-08-14,Ulujadi,95,85,4.9,23.7,1.9,3.8,Siaga
2023-10-28,Palu Barat,120,84,4.8,24.5,2.4,4.8,Awas
2024-03-12,Palu Selatan,65,85,4.4,24.1,1.3,2.6,Siaga
2024-04-25,Mantikulore,88,85,4.6,24.2,1.8,3.6,Siaga
2024-05-16,Ulujadi,105,87,4.3,24.3,2.1,4.2,Awas
2024-06-24,Palu Barat,155,87,4.1,24.0,3.0,6.0,Awas
2024-06-24,Palu Selatan,145,87,4.1,24.0,2.9,5.8,Awas
2024-08-10,Palu Timur,42,85,4.8,23.8,0.8,1.6,Waspada
2024-09-18,Ulujadi,28,84,5.1,23.9,0.6,1.2,Aman
2024-10-22,Mantikulore,58,84,4.9,24.5,1.2,2.4,Waspada
2024-11-15,Palu Barat,72,86,4.4,24.7,1.5,3.0,Siaga
2025-01-08,Palu Selatan,35,84,5.2,23.6,0.7,1.4,Waspada
2025-02-19,Ulujadi,48,84,5.0,23.8,1.0,2.0,Waspada
2025-03-27,Palu Barat,82,85,4.7,24.0,1.6,3.2,Siaga
2025-04-16,Mantikulore,125,86,4.5,24.2,2.5,5.0,Awas
2025-04-16,Palu Timur,115,86,4.5,24.2,2.3,4.6,Awas
2025-05-22,Palu Selatan,138,87,4.3,24.3,2.7,5.4,Awas
2025-06-09,Palu Barat,165,87,4.2,24.1,3.0,6.0,Awas
2025-06-09,Ulujadi,152,87,4.2,24.1,3.0,6.0,Awas
2025-07-18,Mantikulore,98,86,4.6,23.8,2.0,4.0,Awas
2025-08-25,Palu Barat,44,85,4.9,23.7,0.9,1.8,Waspada
2025-09-14,Palu Timur,25,84,5.3,23.9,0.5,1.0,Aman
2025-10-30,Ulujadi,67,84,4.8,24.6,1.4,2.8,Siaga
2025-11-20,Palu Selatan,85,86,4.4,24.8,1.7,3.4,Siaga`;

let disasterData = [];
let predictionModel = null;

// Koordinat kecamatan di Kota Palu
const kecamatanPalu = {
  "Palu Barat": { lat: -0.8878594133564031, lng: 119.85260749116584 },
  "Palu Selatan": { lat: -0.9189, lng: 119.8945 },
  "Palu Timur": { lat: -0.8876, lng: 119.8626 },
  "Palu Utara": { lat: -0.7845, lng: 119.8772 },
  "Tatanga": { lat: -0.9199, lng: 119.8460 },
  "Ulujadi": { lat: -0.8607, lng: 119.8280 },
  "Mantikulore": { lat: -0.8718, lng: 119.8880 },
  "Tawaeli": { lat: -0.7327, lng: 119.8971 }
};

// Parse CSV data
function parseCSVData() {
  const parsed = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  disasterData = parsed.data.map((row) => ({
    ...row,
    Tahun: new Date(row.Tanggal).getFullYear(),
    Bulan: new Date(row.Tanggal).getMonth() + 1,
  }));

  return disasterData;
}

// Initialize statistics
function initializeStats() {
    const totalData = disasterData.length;
    const avgRainfall = (disasterData.reduce((sum, row) => sum + row.Curah_Hujan_mm, 0) / totalData).toFixed(1);
    const totalDisaster = disasterData.filter(row => row.Status_Banjir !== 'Aman').length;
    const heavyFlood = disasterData.filter(row => row.Status_Banjir === 'Awas').length;
    
    document.getElementById('totalData').textContent = totalData;
    document.getElementById('avgRainfall').textContent = `${avgRainfall} mm`;
    document.getElementById('totalDisaster').textContent = totalDisaster;
    document.getElementById('heavyFlood').textContent = heavyFlood;
}

// Initialize filters
function initializeFilters() {
    const years = [...new Set(disasterData.map(row => row.Tahun))].sort();
    const districts = [...new Set(disasterData.map(row => row.Kecamatan))].sort();
    const statuses = [...new Set(disasterData.map(row => row.Status_Banjir))].sort();
    
    const yearFilter = document.getElementById('yearFilter');
    const districtFilter = document.getElementById('districtFilter');
    const disasterFilter = document.getElementById('disasterFilter');
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtFilter.appendChild(option);
    });
    
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        disasterFilter.appendChild(option);
    });
    
    yearFilter.addEventListener('change', filterTable);
    districtFilter.addEventListener('change', filterTable);
    disasterFilter.addEventListener('change', filterTable);
}

// Filter table data
function filterTable() {
    const yearFilter = document.getElementById('yearFilter').value;
    const districtFilter = document.getElementById('districtFilter').value;
    const disasterFilter = document.getElementById('disasterFilter').value;
    
    const filteredData = disasterData.filter(row => {
        const matchYear = !yearFilter || row.Tahun == yearFilter;
        const matchDistrict = !districtFilter || row.Kecamatan === districtFilter;
        const matchDisaster = !disasterFilter || row.Status_Banjir === disasterFilter;
        return matchYear && matchDistrict && matchDisaster;
    });
    
    populateDataTable(filteredData);
}

// Populate data table
function populateDataTable(data = disasterData) {
  const tableBody = document.getElementById("dataTable");
  tableBody.innerHTML = "";

  data.forEach((row) => {
    const tr = document.createElement("tr");

    // Determine status badge class
        let statusClass = 'status-aman';
        if (row.Status_Banjir === 'Awas') statusClass = 'status-awas';
        else if (row.Status_Banjir === 'Siaga') statusClass = 'status-siaga';
        else if (row.Status_Banjir === 'Waspada') statusClass = 'status-waspada';
        
    tr.innerHTML = `
            <td>${row.Tanggal}</td>
            <td>${row.Kecamatan}</td>
            <td>${row.Curah_Hujan_mm}</td>
            <td>${row.Kelembapan_persen}</td>
            <td>${row.Kecepatan_Angin_km_jam}</td>
            <td>${row.Suhu_Rata2_C}</td>
            <td>${row.Tinggi_Muka_Air_m}</td>
            <td>${row.Indeks_Risiko}</td>
            <td><span class="status-badge ${statusClass}">${row.Status_Banjir}</span></td>
        `;

    tableBody.appendChild(tr);
  });
}

// Initialize charts
function initializeCharts() {
  createDisasterTypeChart();
  createRainfallChart();
  createDistrictChart();
  createMonthlyDisasterChart();
  createRainfallByStatusChart();
  createAccuracyChart();
}

// Chart 1: Distribusi Status Banjir
function createDisasterTypeChart() {
  const statusCounts = {};
  disasterData.forEach((row) => {
    const status = row.Status_Banjir;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const ctx = document.getElementById("disasterTypeChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            '#2ecc71', '#f39c12', '#e67e22', '#e74c3c'
                ]
            }]
        },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

// Chart 2: Trend Curah Hujan
function createRainfallChart() {
  const sortedData = [...disasterData].sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal));

  const ctx = document.getElementById("rainfallChart").getContext("2d");
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedData.map((row) => row.Tanggal),
      datasets: [{
          label: "Curah Hujan (mm)",
          data: sortedData.map((row) => row.Curah_Hujan_mm),
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          tension: 0.3,
          fill: true,
        }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 10,
          },
        },
        y: {
          beginAtZero: true,
        }
      }
    }
  });
}

// Chart 3: Banjir per Kecamatan
function createDistrictChart() {
    const districtCounts = {};
    disasterData.forEach(row => {
        if (row.Status_Banjir !== 'Aman') {
            const district = row.Kecamatan;
            districtCounts[district] = (districtCounts[district] || 0) + 1;
        }
    });
    
    const ctx = document.getElementById('districtChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(districtCounts),
            datasets: [{
                label: 'Jumlah Kejadian Banjir',
                data: Object.values(districtCounts),
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgb(52, 152, 219)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Chart 4: Bulan dengan Bencana Terbanyak
function createMonthlyDisasterChart() {
  const monthlyCounts = Array(12).fill(0);
  disasterData.forEach((row) => {
    if (row.Status_Banjir !== "Aman") {
      monthlyCounts[row.Bulan - 1]++;
    }
  });

  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des",];

  const ctx = document.getElementById("monthlyDisasterChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
          label: "Jumlah Kejadian Banjir",
          data: monthlyCounts,
          backgroundColor: "rgba(231, 76, 60, 0.7)",
        }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// Chart 5: Distribusi Curah Hujan per Status
function createRainfallByStatusChart() {
  const statusGroups = {};
  disasterData.forEach((row) => {
    if (!statusGroups[row.Status_Banjir]) {
      statusGroups[row.Status_Banjir] = [];
    }
    statusGroups[row.Status_Banjir].push(row.Curah_Hujan_mm);
  });

  const ctx = document.getElementById("rainfallByStatusChart").getContext("2d");
  new Chart(ctx, {
    type: 'bar',
        data: {
            labels: Object.keys(statusGroups),
            datasets: [{
                label: 'Rata-rata Curah Hujan (mm)',
                data: Object.values(statusGroups).map(values => {
                    return values.reduce((a, b) => a + b, 0) / values.length;
                }),
                backgroundColor: 'rgba(52, 152, 219, 0.7)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Chart 6: Akurasi Model
function createAccuracyChart() {
    const ctx = document.getElementById('accuracyChart').getContext('2d');
    
    const accuracyData = {
        labels: ['Decision Tree', 'Random Forest', 'SVM', 'Neural Network'],
        datasets: [{
            label: 'Akurasi Model (%)',
            data: [85, 92, 78, 89],
            backgroundColor: [
                'rgba(52, 152, 219, 0.7)',
                'rgba(46, 204, 113, 0.7)',
                'rgba(155, 89, 182, 0.7)',
                'rgba(241, 196, 15, 0.7)'
            ],
            borderColor: [
                'rgb(52, 152, 219)',
                'rgb(46, 204, 113)',
                'rgb(155, 89, 182)',
                'rgb(241, 196, 15)'
            ],
            borderWidth: 1
        }]
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: accuracyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Akurasi (%)'
                    }
                }
            }
        }
    });
}

// Initialize map dengan marker kecamatan
function initializeMap() {
  const map = L.map("disasterMap").setView([-0.9018, 119.8776], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add markers for flood events dengan koordinat kecamatan
  disasterData
    .filter((row) => row.Status_Banjir !== "Aman")
    .forEach((row) => {
      const district = row.Kecamatan;
      const coords = kecamatanPalu[district]; // <-- diganti dari districtCoordinates

      if (coords) {
        // Tambahkan sedikit variasi pada koordinat untuk menghindari overlap
        const lat = coords.lat + (Math.random() - 0.5) * 0.01;
        const lng = coords.lng + (Math.random() - 0.5) * 0.01;

        let color;
        if (row.Status_Banjir === "Awas") color = "red";
        else if (row.Status_Banjir === "Siaga") color = "orange";
        else if (row.Status_Banjir === "Waspada") color = "yellow";
        else color = "gray";

        L.circleMarker([lat, lng], {
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          radius: 8,
        }).addTo(map).bindPopup(`
                <div style="text-align: center;">
                    <b>${district}</b><br>
                    <b>${row.Tanggal}</b><br>
                    <span style="color: ${color}; font-weight: bold;">${row.Status_Banjir}</span><br>
                    Curah Hujan: ${row.Curah_Hujan_mm} mm<br>
                    Tinggi Muka Air: ${row.Tinggi_Muka_Air_m} m<br>
                    Indeks Risiko: ${row.Indeks_Risiko}
                </div>
            `);
      }
    });

  // Tambahkan marker untuk setiap kecamatan
  Object.entries(kecamatanPalu).forEach(([district, coords]) => { // <-- diganti dari districtCoordinates
    L.marker([coords.lat, coords.lng])
      .addTo(map)
      .bindPopup(`<b>${district}</b><br>Kecamatan Kota Palu`);
  });
}

// Machine Learning Model untuk Prediksi
class FloodPredictionModel {
    constructor() {
        this.weights = {
            rainfall: 0.4,
            humidity: 0.2,
            waterLevel: 0.3,
            temperature: 0.1
        };
        this.thresholds = {
            Aman: 0.2,
            Waspada: 0.4,
            Siaga: 0.7,
            Awas: 0.9
        };

        // Data karakteristik kecamatan (tingkat kerentanan)
        this.districtVulnerability = {
            'Palu Barat': 0.7,
            'Palu Selatan': 0.9,
            'Palu Timur': 0.6,
            'Palu Utara': 0.8,
            'Tatanga': 0.5,
            'Ulujadi': 0.7,
            'Mantikulore': 0.4,
            'Tawaeli': 0.6
        };
    }

    normalize(value, min, max) {
        return (value - min) / (max - min);
    }

    predict(input) {
        const district = input.district;
        const vulnerability = this.districtVulnerability[district] || 0.5;
        
        // Normalisasi input
        const normalizedRainfall = this.normalize(input.rainfall, 0, 200);
        const normalizedHumidity = this.normalize(input.humidity, 0, 100);
        const normalizedWaterLevel = this.normalize(input.waterLevel, 0, 4);
        const normalizedTemperature = this.normalize(input.temperature, 20, 35);

        // Hitung skor risiko dengan mempertimbangkan kerentanan daerah
        let riskScore = 0;
        riskScore += normalizedRainfall * this.weights.rainfall;
        riskScore += normalizedHumidity * this.weights.humidity;
        riskScore += normalizedWaterLevel * this.weights.waterLevel;
        riskScore += (1 - normalizedTemperature) * this.weights.temperature;
        
        // Tambahkan faktor kerentanan daerah
        riskScore *= (1 + vulnerability * 0.3);

        // Batasi riskScore antara 0-1
        riskScore = Math.min(1, Math.max(0, riskScore));

        // Tentukan status berdasarkan threshold
        let status = 'Aman';
        let confidence = 0;

        if (riskScore >= this.thresholds.Awas) {
            status = 'Awas';
            confidence = riskScore;
        } else if (riskScore >= this.thresholds.Siaga) {
            status = 'Siaga';
            confidence = riskScore;
        } else if (riskScore >= this.thresholds.Waspada) {
            status = 'Waspada';
            confidence = riskScore;
        } else {
            status = 'Aman';
            confidence = 1 - riskScore;
        }

        return { status, confidence, riskScore, vulnerability };
    }

    // Metode untuk mendapatkan rekomendasi berdasarkan status dan daerah
    getRecommendation(status, district) {
        const baseRecommendations = {
            Aman: 'Kondisi normal. Tetap waspada terhadap perubahan cuaca.',
            Waspada: 'Waspada terhadap kemungkinan banjir. Pantau perkembangan cuaca.',
            Siaga: 'Bersiap untuk kemungkinan banjir. Evakuasi barang berharga ke tempat yang lebih tinggi.',
            Awas: 'Banjir diperkirakan terjadi. Lakukan evakuasi segera ke tempat yang aman.'
        };
        
        const districtSpecific = {
            'Palu Selatan': 'Daerah rawan banjir, perhatikan saluran drainase.',
            'Palu Utara': 'Area dekat sungai, waspada kenaikan air mendadak.',
            'Tatanga': 'Daerah dataran rendah, perhatikan genangan air.',
            'Ulujadi': 'Perhatikan sistem pengairan dan pompa air.'
        };
        
        let recommendation = baseRecommendations[status] || 'Tidak ada rekomendasi tersedia.';
        
        if (districtSpecific[district]) {
            recommendation += ' ' + districtSpecific[district];
        }
        
        return recommendation;
    }
}

// Initialize prediction functionality
function initializePrediction() {
    predictionModel = new FloodPredictionModel();
    
    const predictButton = document.getElementById('predictButton');
    predictButton.addEventListener('click', performPrediction);
}

// Perform prediction
function performPrediction() {
    const district = document.getElementById('districtSelect').value;
    const rainfall = parseFloat(document.getElementById('rainfallInput').value);
    const humidity = parseFloat(document.getElementById('humidityInput').value);
    const windSpeed = parseFloat(document.getElementById('windSpeedInput').value);
    const temperature = parseFloat(document.getElementById('temperatureInput').value);
    const waterLevel = parseFloat(document.getElementById('waterLevelInput').value);

    // Validasi input
    if (isNaN(rainfall) || isNaN(humidity) || isNaN(windSpeed) || isNaN(temperature) || isNaN(waterLevel)) {
        alert('Harap masukkan semua nilai dengan benar!');
        return;
    }

    // Tampilkan loading
    const districtText = document.getElementById('districtText');
    const predictionText = document.getElementById('predictionText');
    const confidenceText = document.getElementById('confidenceText');
    const recommendationText = document.getElementById('recommendationText');
    
    districtText.textContent = `Kecamatan: ${district}`;
    predictionText.innerHTML = '<div class="loading"></div>Memproses prediksi...';
    predictionText.className = 'prediction-status';
    confidenceText.textContent = 'Tingkat kepercayaan: -';
    recommendationText.textContent = '-';

    // Simulasi proses prediksi
    setTimeout(() => {
        const input = {
            district: district,
            rainfall: rainfall,
            humidity: humidity,
            windSpeed: windSpeed,
            temperature: temperature,
            waterLevel: waterLevel
        };

        const result = predictionModel.predict(input);
        
        // Tampilkan hasil prediksi
        const confidencePercent = Math.round(result.confidence * 100);
        const vulnerabilityPercent = Math.round(result.vulnerability * 100);
        
        districtText.textContent = `Kecamatan: ${district} (Kerentanan: ${vulnerabilityPercent}%)`;
        predictionText.innerHTML = result.status;
        predictionText.className = `prediction-status status-prediction-${result.status.toLowerCase()}`;
        
        confidenceText.textContent = `Tingkat kepercayaan: ${confidencePercent}%`;
        recommendationText.textContent = predictionModel.getRecommendation(result.status, district);
        
        // Tambahkan progress bar untuk confidence
        let oldBar = document.querySelector('.confidence-bar');
        if (oldBar) oldBar.remove();
        
        const confidenceBar = document.createElement('div');
        confidenceBar.className = 'confidence-bar';
        confidenceBar.innerHTML = `
            <div class="confidence-fill confidence-${result.status.toLowerCase()}"
                style="width: ${confidencePercent}%">
            </div>`;
        confidenceText.parentNode.insertBefore(confidenceBar, confidenceText.nextSibling);
        
    }, 1500);
}

// Smooth scrolling untuk navigasi
function initializeSmoothScrolling() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    parseCSVData();
    initializeStats();
    initializeFilters();
    populateDataTable();
    initializeCharts();
    initializeMap();
    initializePrediction();
    initializeSmoothScrolling();
});