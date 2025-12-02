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

// Parse CSV data
function parseCSVData() {
    const parsed = Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
    });
    
    disasterData = parsed.data.map(row => ({
        ...row,
        Tahun: new Date(row.Tanggal).getFullYear(),
        Bulan: new Date(row.Tanggal).getMonth() + 1
    }));
    
    return disasterData;
}
// Initialize statistics
function initializeStats() {
    const totalData = disasterData.length;
    const avgRainfall = (disasterData.reduce((sum, row) => sum + row.Curah_Hujan_mm, 0) / totalData).toFixed(1);
    const totalDisaster = disasterData.filter(row => row.Status_Bencana !== 'Aman').length;
    const heavyFlood = disasterData.filter(row => row.Status_Bencana.includes('Berat')).length;
    
    document.getElementById('totalData').textContent = totalData;
    document.getElementById('avgRainfall').textContent = `${avgRainfall} mm`;
    document.getElementById('totalDisaster').textContent = totalDisaster;
    document.getElementById('heavyFlood').textContent = heavyFlood;
}

// Initialize filters
function initializeFilters() {
    const years = [...new Set(disasterData.map(row => row.Tahun))].sort();
    const statuses = [...new Set(disasterData.map(row => row.Status_Bencana))].sort();
    
    const yearFilter = document.getElementById('yearFilter');
    const disasterFilter = document.getElementById('disasterFilter');
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        disasterFilter.appendChild(option);
    });
    
    yearFilter.addEventListener('change', filterTable);
    disasterFilter.addEventListener('change', filterTable);
}

// Filter table data
function filterTable() {
    const yearFilter = document.getElementById('yearFilter').value;
    const disasterFilter = document.getElementById('disasterFilter').value;
    
    const filteredData = disasterData.filter(row => {
        const matchYear = !yearFilter || row.Tahun == yearFilter;
        const matchDisaster = !disasterFilter || row.Status_Bencana === disasterFilter;
        return matchYear && matchDisaster;
    });
    
    populateDataTable(filteredData);
}
// Populate data table
function populateDataTable(data = disasterData) {
    const tableBody = document.getElementById('dataTable');
    tableBody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        
        // Determine status badge class
        let statusClass = 'status-aman';
        if (row.Status_Bencana.includes('Berat')) statusClass = 'status-berat';
        else if (row.Status_Bencana.includes('Sedang')) statusClass = 'status-sedang';
        else if (row.Status_Bencana.includes('Ringan')) statusClass = 'status-ringan';
        else if (row.Status_Bencana.includes('Longsor')) statusClass = 'status-longsor';
        else if (row.Status_Bencana.includes('Tsunami')) statusClass = 'status-tsunami';
        
        tr.innerHTML = `
            <td>${row.Tanggal}</td>
            <td>${row.Curah_Hujan_mm}</td>
            <td>${row.Kelembapan_persen}</td>
            <td>${row.Kecepatan_Angin_km_jam}</td>
            <td>${row.Suhu_Rata2_C}</td>
            <td>${row.Tinggi_Gelombang_m}</td>
            <td>${row.Aktivitas_Gempa_skala}</td>
            <td><span class="status-badge ${statusClass}">${row.Status_Bencana}</span></td>
        `;
        
        tableBody.appendChild(tr);
    });
}
// Initialize charts
function initializeCharts() {
    createDisasterTypeChart();
    createRainfallChart();
    createCorrelationChart();
    createMonthlyDisasterChart();
    createRainfallByStatusChart();
}

// Chart 1: Distribusi Jenis Bencana
function createDisasterTypeChart() {
    const statusCounts = {};
    disasterData.forEach(row => {
        const status = row.Status_Bencana;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const ctx = document.getElementById('disasterTypeChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#2ecc71', '#f39c12', '#e67e22', '#e74c3c', 
                    '#8e44ad', '#9b59b6', '#34495e'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Chart 2: Trend Curah Hujan
function createRainfallChart() {
    const sortedData = [...disasterData].sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal));
    
    const ctx = document.getElementById('rainfallChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedData.map(row => row.Tanggal),
            datasets: [{
                label: 'Curah Hujan (mm)',
                data: sortedData.map(row => row.Curah_Hujan_mm),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        maxTicksLimit: 10
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
// Chart 3: Korelasi Parameter
function createCorrelationChart() {
    const ctx = document.getElementById('correlationChart').getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Curah Hujan vs Kelembapan',
                data: disasterData.map(row => ({
                    x: row.Curah_Hujan_mm,
                    y: row.Kelembapan_persen
                })),
                backgroundColor: 'rgba(231, 76, 60, 0.7)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Curah Hujan (mm)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Kelembapan (%)'
                    }
                }
            }
        }
    });
}
// Chart 4: Bulan dengan Bencana Terbanyak
function createMonthlyDisasterChart() {
    const monthlyCounts = Array(12).fill(0);
    disasterData.forEach(row => {
        if (row.Status_Bencana !== 'Aman') {
            monthlyCounts[row.Bulan - 1]++;
        }
    });
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const ctx = document.getElementById('monthlyDisasterChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Jumlah Bencana',
                data: monthlyCounts,
                backgroundColor: 'rgba(231, 76, 60, 0.7)'
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
    disasterData.forEach(row => {
        if (!statusGroups[row.Status_Bencana]) {
            statusGroups[row.Status_Bencana] = [];
        }
        statusGroups[row.Status_Bencana].push(row.Curah_Hujan_mm);
    });
    
    const ctx = document.getElementById('rainfallByStatusChart').getContext('2d');
    new Chart(ctx, {
        type: 'boxplot',
        data: {
            labels: Object.keys(statusGroups),
            datasets: [{
                label: 'Distribusi Curah Hujan',
                data: Object.values(statusGroups).map(values => ({
                    min: Math.min(...values),
                    q1: calculatePercentile(values, 25),
                    median: calculatePercentile(values, 50),
                    q3: calculatePercentile(values, 75),
                    max: Math.max(...values)
                })),
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: '#3498db',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
// Helper function for percentiles
function calculatePercentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = lower + 1;
    const weight = index - lower;
    
    if (upper >= sorted.length) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}
// Initialize map
function initializeMap() {
    const map = L.map('disasterMap').setView([-0.9018, 119.8776], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers for disaster events
    disasterData.filter(row => row.Status_Bencana !== 'Aman').forEach(row => {
        const lat = -0.9018 + (Math.random() - 0.5) * 0.1;
        const lng = 119.8776 + (Math.random() - 0.5) * 0.1;
        
        let color;
        if (row.Status_Bencana.includes('Berat')) color = 'red';
        else if (row.Status_Bencana.includes('Sedang')) color = 'orange';
        else if (row.Status_Bencana.includes('Ringan')) color = 'yellow';
        else if (row.Status_Bencana.includes('Longsor')) color = 'brown';
        else if (row.Status_Bencana.includes('Tsunami')) color = 'blue';
        else color = 'gray';
        
        L.circleMarker([lat, lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: 8
        }).addTo(map).bindPopup(`
            <div style="text-align: center;">
                <b>${row.Tanggal}</b><br>
                <span style="color: ${color}; font-weight: bold;">${row.Status_Bencana}</span><br>
                Curah Hujan: ${row.Curah_Hujan_mm} mm<br>
                Kelembapan: ${row.Kelembapan_persen}%<br>
                Gelombang: ${row.Tinggi_Gelombang_m} m
            </div>
        `);
    });
}

// Smooth scrolling untuk navigasi
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

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    parseCSVData();
    initializeStats();
    initializeFilters();
    populateDataTable();
    initializeCharts();
    initializeMap();
});