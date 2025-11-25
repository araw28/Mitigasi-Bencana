// Dataset CSV
const csvData = `Tanggal,Curah_Hujan_mm,Kelembapan_persen,Kecepatan_Angin_km_jam,Suhu_Rata2_C,Tinggi_Gelombang_m,Aktivitas_Gempa_skala,Status_Bencana
2023-01-15,35,82,20,29.2,1.1,2.1,Aman
2023-02-03,150,90,38,27.1,2.5,3.2,Banjir_Berat
2023-03-12,28,79,25,28.8,1.3,4.1,Tanah_Longsor
2023-04-05,180,93,42,26.5,3.2,5.2,Banjir_Berat
2023-05-20,12,75,18,30.1,0.9,1.8,Aman
2023-06-08,95,87,34,27.8,2.1,3.5,Banjir_Sedang
2023-07-14,8,70,16,31.2,0.6,2.0,Aman
2023-08-22,60,84,28,28.5,1.7,4.3,Banjir_Ringan
2023-09-30,22,78,22,29.4,1.2,2.7,Aman
2023-10-11,130,89,36,27.3,2.8,4.8,Banjir_Sedang
2023-11-25,45,81,24,28.9,1.4,3.9,Aman
2023-12-19,160,91,39,26.8,2.9,5.0,Banjir_Berat
2024-01-01,45,85,25,28.5,1.2,2.3,Banjir_Ringan
2024-01-02,12,78,18,29.1,0.8,1.5,Aman
2024-01-03,8,72,22,30.2,1.5,3.1,Aman
2024-01-04,120,92,35,27.8,2.8,2.8,Banjir_Berat
2024-01-05,25,81,28,28.9,1.8,4.2,Tanah_Longsor
2024-01-06,5,68,15,31.0,0.5,1.2,Aman
2024-01-07,85,88,32,27.5,2.2,3.8,Banjir_Sedang
2024-01-08,15,75,20,29.5,1.0,5.1,Tsunami_Ringan
2024-01-09,200,95,40,26.2,3.5,4.5,Banjir_Berat_Longsor
2024-01-10,10,70,16,30.5,0.7,2.1,Aman
2025-01-08,30,80,21,29.0,1.0,2.4,Aman
2025-02-14,140,88,37,27.2,2.6,3.8,Banjir_Sedang
2025-03-22,18,76,19,30.3,0.8,2.9,Aman
2025-04-10,90,86,33,27.9,2.0,4.6,Banjir_Ringan
2025-05-05,190,94,41,26.4,3.3,5.3,Banjir_Berat
2025-06-18,7,69,14,31.5,0.4,1.9,Aman
2025-07-25,55,83,26,28.7,1.6,3.7,Aman
2025-08-12,110,87,31,27.6,2.4,4.9,Banjir_Sedang
2025-09-03,38,82,23,29.3,1.3,3.3,Aman
2025-10-29,75,85,29,28.3,1.9,4.1,Banjir_Ringan
2025-11-16,165,92,40,26.7,3.0,5.4,Banjir_Berat_Tsunami
2025-12-07,15,74,17,30.8,0.7,2.5,Aman`;

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