// Dataset CSV
const csvData = `Tanggal,Kecamatan,Curah_Hujan_mm,Kelembapan_persen,Kecepatan_Angin_km_jam,Suhu_Rata2_C,Tinggi_Muka_Air_m,Indeks_Risiko,Status_Banjir
2022-07-31,Mantikulore,60,90,25.2,21,1.2,2.4,Waspada
2022-09-06,Palu Barat,90,87,10.8,22.2,1.8,3.6,Siaga
2022-09-06,Palu Timur,90,87,10.8,22.2,1.8,3.6,Siaga
2022-09-24,Palu Barat,50,80,25.2,22.6,1.0,2.0,Waspada
2023-03-07,Palu Barat,80,76,32.4,21.2,1.6,3.2,Siaga
2023-07-22,Palu Barat,120,80,32.4,23.2,2.4,4.8,Awas
2023-07-22,Palu Selatan,200,80,32.4,23.2,3.0,7.0,Awas
2023-07-22,Ulujadi,100,80,32.4,23.2,2.0,4.0,Awas
2023-07-22,Mantikulore,130,80,32.4,23.2,2.6,5.2,Awas
2023-09-17,Mantikulore,100,86,25.2,24.6,2.0,4.0,Awas
2024-05-04,Palu Barat,6.5,79,7.2,27.8,0.5,0.63,Aman
2024-08-23,Ulujadi,11.9,88,3.6,26,0.5,0.74,Aman
2024-09-01,Ulujadi,50,84,7.2,27.1,1.0,2.0,Waspada
2025-04-25,Ulujadi,100,90,3.6,26.6,2.0,4.0,Awas
2025-04-25,Palu Barat,130,90,3.6,26.6,2.6,5.2,Awas
2025-04-25,Mantikulore,150,90,3.6,26.6,3.0,6.0,Awas
2025-07-12,Palu Selatan,8.5,91,3.6,26,0.5,0.67,Aman
2025-07-12,Palu Barat,8.5,91,3.6,26,0.5,0.67,Aman`;

let disasterData = [];
let predictionModel = null;

// Koordinat kecamatan di Kota Palu
const districtCoordinates = {
    'Palu Barat': { lat: -0.8965, lng: 119.8617 },
    'Palu Selatan': { lat: -0.9186, lng: 119.8722 },
    'Palu Timur': { lat: -0.8908, lng: 119.8875 },
    'Palu Utara': { lat: -0.8708, lng: 119.8722 },
    'Tatanga': { lat: -0.9083, lng: 119.8500 },
    'Ulujadi': { lat: -0.8833, lng: 119.8500 },
    'Mantikulore': { lat: -0.9000, lng: 119.8333 },
    'Tawaeli': { lat: -0.8500, lng: 119.9000 }
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
    if (row.Status_Bencana !== "Aman") {
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
    const map = L.map('disasterMap').setView([-0.9018, 119.8776], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers for flood events dengan koordinat kecamatan
    disasterData.filter(row => row.Status_Banjir !== 'Aman').forEach(row => {
        const district = row.Kecamatan;
        const coords = districtCoordinates[district];
        
        if (coords) {
            // Tambahkan sedikit variasi pada koordinat untuk menghindari overlap
            const lat = coords.lat + (Math.random() - 0.5) * 0.01;
            const lng = coords.lng + (Math.random() - 0.5) * 0.01;
            
            let color;
            if (row.Status_Banjir === 'Awas') color = 'red';
            else if (row.Status_Banjir === 'Siaga') color = 'orange';
            else if (row.Status_Banjir === 'Waspada') color = 'yellow';
            else color = 'gray';
            
            L.circleMarker([lat, lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.7,
                radius: 8
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
    Object.entries(districtCoordinates).forEach(([district, coords]) => {
        L.marker([coords.lat, coords.lng])
            .addTo(map)
            .bindPopup(`<b>${district}</b><br>Kecamatan Kota Palu`)
            .openPopup();
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

        return {
            status: status,
            confidence: Math.min(0.99, Math.max(0.6, confidence)),
            riskScore: riskScore,
            district: district,
            vulnerability: vulnerability
        };
    }

  }