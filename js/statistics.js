// ============================================
// STATISTICS COMPONENT
// ============================================

import { tasks } from './config.js';
import { showNotification } from './ui.js';
import { getTodayDateString, formatDateToString } from './utils.js';

// Fungsi untuk inisialisasi komponen statistik
export function initStatisticsComponent() {
    // Referensi elemen tab
    const analyticsTabs = document.querySelectorAll('.analytics-tab');
    const analyticsPanels = document.querySelectorAll('.analytics-panel');
    const dateRangeBtns = document.querySelectorAll('.date-range-btn');
    const exportStatsBtn = document.querySelector('.export-stats-btn');
    
    // Inisialisasi variabel untuk menyimpan data statistik
    let statisticsData = {
        currentRange: 'week',
        productivity: {},
        categories: {},
        completion: {},
        timePatterns: {}
    };
    
    // Event listener untuk tab
    analyticsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            analyticsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabId = tab.dataset.tab;
            analyticsPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${tabId}-panel`) {
                    panel.classList.add('active');
                }
            });
            
            updateActiveChart();
        });
    });
    
    // Event listener untuk selector rentang waktu
    dateRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dateRangeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            statisticsData.currentRange = btn.dataset.range;
            
            generateStatisticsData();
            updateAllCharts();
        });
    });
    
    // Event listener untuk tombol ekspor
    if (exportStatsBtn) {
        exportStatsBtn.addEventListener('click', exportStatistics);
    }
    
    // Fungsi untuk menghasilkan data statistik
    function generateStatisticsData() {
        const currentTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const filteredTasks = filterTasksByDateRange(currentTasks, statisticsData.currentRange);
        
        statisticsData.productivity = calculateProductivityData(filteredTasks);
        statisticsData.categories = calculateCategoryDistribution(filteredTasks);
        statisticsData.completion = calculateCompletionStats(filteredTasks);
        statisticsData.timePatterns = calculateTimePatterns(filteredTasks);
        
        updateStatisticsValues();
    }
    
    // Filter tugas berdasarkan rentang tanggal
    function filterTasksByDateRange(tasks, range) {
        const today = new Date();
        let startDate;
        
        switch(range) {
            case 'week':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - today.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(today.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
        }
        
        return tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= startDate && taskDate <= today;
        });
    }
    
    // Menghitung data produktivitas
    function calculateProductivityData(tasks) {
        const today = new Date();
        const dayLabels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        
        let labels = [];
        let completedData = [];
        let addedData = [];
        
        if (statisticsData.currentRange === 'week') {
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - 6 + i);
                labels.push(dayLabels[date.getDay()]);
                
                const dayTasks = tasks.filter(task => {
                    const taskDate = new Date(task.date);
                    return taskDate.getDate() === date.getDate() && 
                           taskDate.getMonth() === date.getMonth() && 
                           taskDate.getFullYear() === date.getFullYear();
                });
                
                completedData.push(dayTasks.filter(task => task.completed).length);
                addedData.push(dayTasks.length);
            }
        } else if (statisticsData.currentRange === 'month') {
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(today.getFullYear(), today.getMonth(), i);
                
                if (date > today) break;
                
                labels.push(i);
                
                const dayTasks = tasks.filter(task => {
                    const taskDate = new Date(task.date);
                    return taskDate.getDate() === i && 
                           taskDate.getMonth() === today.getMonth() && 
                           taskDate.getFullYear() === today.getFullYear();
                });
                
                completedData.push(dayTasks.filter(task => task.completed).length);
                addedData.push(dayTasks.length);
            }
        } else if (statisticsData.currentRange === 'year') {
            for (let i = 0; i < 12; i++) {
                labels.push(monthLabels[i]);
                
                const monthTasks = tasks.filter(task => {
                    const taskDate = new Date(task.date);
                    return taskDate.getMonth() === i && 
                           taskDate.getFullYear() === today.getFullYear();
                });
                
                completedData.push(monthTasks.filter(task => task.completed).length);
                addedData.push(monthTasks.length);
            }
        }
        
        let totalCompleted = completedData.reduce((sum, val) => sum + val, 0);
        let totalAdded = addedData.reduce((sum, val) => sum + val, 0);
        let avgCompletionRate = totalAdded > 0 ? Math.round((totalCompleted / totalAdded) * 100) : 0;
        
        let mostProductiveIdx = 0;
        let maxCompleted = 0;
        for (let i = 0; i < completedData.length; i++) {
            if (completedData[i] > maxCompleted) {
                maxCompleted = completedData[i];
                mostProductiveIdx = i;
            }
        }
        
        return {
            labels,
            completedData,
            addedData,
            avgCompletionRate,
            mostProductiveDay: labels[mostProductiveIdx],
            streak: calculateCurrentStreak(tasks)
        };
    }
    
    // Menghitung streak saat ini
    function calculateCurrentStreak(tasks) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
            const dateStr = formatDateToString(
                currentDate.getFullYear(), 
                currentDate.getMonth(), 
                currentDate.getDate()
            );
            
            const hasCompletedTask = tasks.some(task => {
                return task.date === dateStr && task.completed;
            });
            
            if (hasCompletedTask) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // Menghitung distribusi kategori
    function calculateCategoryDistribution(tasks) {
        const categories = {};
        const categoryColors = {
            'Sekolah': 'var(--secondary)',
            'Pribadi': 'var(--primary)',
            'Game': 'var(--accent)',
            'Lainnya': 'var(--warning)'
        };
        
        tasks.forEach(task => {
            if (!categories[task.category]) {
                categories[task.category] = {
                    count: 0,
                    completed: 0,
                    color: categoryColors[task.category] || 'var(--dark-accent)'
                };
            }
            
            categories[task.category].count++;
            
            if (task.completed) {
                categories[task.category].completed++;
            }
        });
        
        const labels = Object.keys(categories);
        const data = labels.map(cat => categories[cat].count);
        const completedData = labels.map(cat => categories[cat].completed);
        const colors = labels.map(cat => categories[cat].color);
        
        const completionRates = {};
        labels.forEach(cat => {
            const rate = categories[cat].count > 0 
                ? Math.round((categories[cat].completed / categories[cat].count) * 100) 
                : 0;
            completionRates[cat] = rate;
        });
        
        return {
            labels,
            data,
            completedData,
            colors,
            categories,
            completionRates
        };
    }
    
    // Menghitung statistik penyelesaian
    function calculateCompletionStats(tasks) {
        let completionTimes = [];
        tasks.forEach(task => {
            if (task.completed && task.completedAt && task.createdAt) {
                const created = new Date(task.createdAt);
                const completed = new Date(task.completedAt);
                const timeDiff = Math.abs(completed - created) / (1000 * 60 * 60);
                completionTimes.push(timeDiff);
            }
        });
        
        const avgCompletionTime = completionTimes.length > 0 
            ? (completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length).toFixed(1)
            : null;
        
        const priorityStats = {
            'high': { total: 0, completed: 0 },
            'medium': { total: 0, completed: 0 },
            'low': { total: 0, completed: 0 }
        };
        
        tasks.forEach(task => {
            const priority = task.priority || 'medium';
            priorityStats[priority].total++;
            
            if (task.completed) {
                priorityStats[priority].completed++;
            }
        });
        
        const priorityCompletion = {};
        Object.keys(priorityStats).forEach(priority => {
            priorityCompletion[priority] = priorityStats[priority].total > 0 
                ? Math.round((priorityStats[priority].completed / priorityStats[priority].total) * 100)
                : 0;
        });
        
        const completionData = [
            tasks.filter(task => task.completed).length,
            tasks.filter(task => !task.completed).length
        ];
        
        return {
            avgCompletionTime,
            priorityStats,
            priorityCompletion,
            completionData
        };
    }
    
    // Menghitung pola waktu
    function calculateTimePatterns(tasks) {
        const timePeriods = {
            'Pagi (5-11)': { total: 0, completed: 0 },
            'Siang (11-15)': { total: 0, completed: 0 },
            'Sore (15-19)': { total: 0, completed: 0 },
            'Malam (19-5)': { total: 0, completed: 0 }
        };
        
        tasks.forEach(task => {
            if (task.completedAt) {
                const completedTime = new Date(task.completedAt);
                const hour = completedTime.getHours();
                
                let period;
                if (hour >= 5 && hour < 11) {
                    period = 'Pagi (5-11)';
                } else if (hour >= 11 && hour < 15) {
                    period = 'Siang (11-15)';
                } else if (hour >= 15 && hour < 19) {
                    period = 'Sore (15-19)';
                } else {
                    period = 'Malam (19-5)';
                }
                
                timePeriods[period].total++;
                
                if (task.completed) {
                    timePeriods[period].completed++;
                }
            }
        });
        
        let bestTime = '';
        let bestRate = 0;
        
        Object.keys(timePeriods).forEach(period => {
            if (timePeriods[period].total > 0) {
                const rate = timePeriods[period].completed / timePeriods[period].total;
                if (rate > bestRate) {
                    bestRate = rate;
                    bestTime = period;
                }
            }
        });
        
        const uniqueDates = new Set();
        tasks.forEach(task => {
            uniqueDates.add(task.date);
        });
        
        const tasksPerDay = uniqueDates.size > 0 
            ? Math.round((tasks.length / uniqueDates.size) * 10) / 10
            : 0;
        
        const labels = Object.keys(timePeriods);
        const data = labels.map(period => timePeriods[period].total);
        const completedData = labels.map(period => timePeriods[period].completed);
        
        return {
            timePeriods,
            bestTime: bestTime || 'Belum cukup data',
            tasksPerDay,
            labels,
            data,
            completedData
        };
    }
    
    // Update nilai-nilai statistik pada UI
    function updateStatisticsValues() {
        const avgCompletionRateEl = document.getElementById('avgCompletionRate');
        const mostProductiveDayEl = document.getElementById('mostProductiveDay');
        const currentStreakEl = document.getElementById('currentStreak');
        
        if (avgCompletionRateEl) avgCompletionRateEl.textContent = `${statisticsData.productivity.avgCompletionRate}%`;
        if (mostProductiveDayEl) mostProductiveDayEl.textContent = statisticsData.productivity.mostProductiveDay || '-';
        if (currentStreakEl) currentStreakEl.textContent = statisticsData.productivity.streak || '0';
        
        const categoryStatsList = document.getElementById('categoryStatsList');
        if (categoryStatsList) {
            categoryStatsList.innerHTML = '';
            
            if (statisticsData.categories.labels && statisticsData.categories.labels.length > 0) {
                statisticsData.categories.labels.forEach((category, index) => {
                    const count = statisticsData.categories.data[index];
                    const completed = statisticsData.categories.completedData[index];
                    const rate = count > 0 ? Math.round((completed / count) * 100) : 0;
                    const color = statisticsData.categories.colors[index];
                    
                    const categoryItem = document.createElement('div');
                    categoryItem.className = 'category-stat-item';
                    categoryItem.style.borderLeftColor = color;
                    
                    categoryItem.innerHTML = `
                        <div class="category-color" style="background-color: ${color};"></div>
                        <div class="category-stat-info">
                            <div class="category-name">${category}</div>
                            <div class="category-count">${completed}/${count} (${rate}%)</div>
                        </div>
                    `;
                    
                    categoryStatsList.appendChild(categoryItem);
                });
            } else {
                categoryStatsList.innerHTML = '<div class="empty-state">Belum ada data tugas</div>';
            }
        }
        
        const avgCompletionTimeEl = document.getElementById('avgCompletionTime');
        const completionRateByPriorityEl = document.getElementById('completionRateByPriority');
        
        if (avgCompletionTimeEl) {
            if (statisticsData.completion.avgCompletionTime) {
                const hours = statisticsData.completion.avgCompletionTime;
                
                if (hours < 1) {
                    avgCompletionTimeEl.textContent = `${Math.round(hours * 60)} menit`;
                } else if (hours < 24) {
                    avgCompletionTimeEl.textContent = `${hours} jam`;
                } else {
                    avgCompletionTimeEl.textContent = `${Math.round(hours / 24)} hari`;
                }
            } else {
                avgCompletionTimeEl.textContent = 'Belum ada data';
            }
        }
        
        if (completionRateByPriorityEl) {
            if (statisticsData.completion.priorityCompletion) {
                const high = statisticsData.completion.priorityCompletion.high || 0;
                const medium = statisticsData.completion.priorityCompletion.medium || 0;
                const low = statisticsData.completion.priorityCompletion.low || 0;
                
                completionRateByPriorityEl.innerHTML = `<span style="color:var(--danger)">Tinggi: ${high}%</span>, <span style="color:var(--warning)">Sedang: ${medium}%</span>, <span style="color:var(--accent)">Rendah: ${low}%</span>`;
            } else {
                completionRateByPriorityEl.textContent = 'Belum ada data';
            }
        }
        
        const bestTimeOfDayEl = document.getElementById('bestTimeOfDay');
        const tasksPerDayEl = document.getElementById('tasksPerDay');
        
        if (bestTimeOfDayEl) bestTimeOfDayEl.textContent = statisticsData.timePatterns.bestTime || 'Belum cukup data';
        if (tasksPerDayEl) tasksPerDayEl.textContent = statisticsData.timePatterns.tasksPerDay;
    }
    
    // Update grafik yang aktif saat ini
    function updateActiveChart() {
        const activePanel = document.querySelector('.analytics-panel.active');
        if (!activePanel) return;
        
        const panelId = activePanel.id;
        
        switch(panelId) {
            case 'productivity-panel':
                updateProductivityChart();
                break;
            case 'categories-panel':
                updateCategoriesChart();
                break;
            case 'completion-panel':
                updateCompletionChart();
                break;
            case 'time-panel':
                updateTimePatternChart();
                break;
        }
    }
    
    // Update semua grafik
    function updateAllCharts() {
        updateProductivityChart();
        updateCategoriesChart();
        updateCompletionChart();
        updateTimePatternChart();
    }
    
    // Variabel untuk menyimpan instance grafik
    let productivityChart = null;
    let categoriesChart = null;
    let completionChart = null;
    let timePatternChart = null;
    
    // Fungsi untuk membersihkan dan memperbarui grafik produktivitas
    function updateProductivityChart() {
        const ctx = document.getElementById('weeklyProductivityChart');
        if (!ctx) return;
        
        if (productivityChart) {
            productivityChart.destroy();
        }
        
        productivityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statisticsData.productivity.labels || [],
                datasets: [
                    {
                        label: 'Tugas Diselesaikan',
                        data: statisticsData.productivity.completedData || [],
                        backgroundColor: 'rgba(5, 255, 161, 0.7)',
                        borderColor: 'rgba(5, 255, 161, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Total Tugas',
                        data: statisticsData.productivity.addedData || [],
                        backgroundColor: 'rgba(255, 113, 206, 0.3)',
                        borderColor: 'rgba(255, 113, 206, 1)',
                        borderWidth: 1,
                        type: 'line',
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            precision: 0
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }
    
    // Fungsi untuk membersihkan dan memperbarui grafik kategori
    function updateCategoriesChart() {
        const ctx = document.getElementById('categoriesChart');
        if (!ctx) return;
        
        if (categoriesChart) {
            categoriesChart.destroy();
        }
        
        categoriesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: statisticsData.categories.labels || [],
                datasets: [{
                    data: statisticsData.categories.data || [],
                    backgroundColor: statisticsData.categories.colors || [],
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }
    
    // Fungsi untuk membersihkan dan memperbarui grafik penyelesaian
    function updateCompletionChart() {
        const ctx = document.getElementById('completionChart');
        if (!ctx) return;
        
        if (completionChart) {
            completionChart.destroy();
        }
        
        completionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Selesai', 'Belum Selesai'],
                datasets: [{
                    data: statisticsData.completion.completionData || [0, 0],
                    backgroundColor: [
                        'rgba(5, 255, 161, 0.7)',
                        'rgba(255, 113, 206, 0.7)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }
    
    // Fungsi untuk membersihkan dan memperbarui grafik pola waktu
    function updateTimePatternChart() {
        const ctx = document.getElementById('timePatternChart');
        if (!ctx) return;
        
        if (timePatternChart) {
            timePatternChart.destroy();
        }
        
        timePatternChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: statisticsData.timePatterns.labels || [],
                datasets: [
                    {
                        label: 'Tugas Diselesaikan',
                        data: statisticsData.timePatterns.completedData || [],
                        backgroundColor: 'rgba(5, 255, 161, 0.3)',
                        borderColor: 'rgba(5, 255, 161, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(5, 255, 161, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(5, 255, 161, 1)'
                    },
                    {
                        label: 'Total Tugas',
                        data: statisticsData.timePatterns.data || [],
                        backgroundColor: 'rgba(1, 205, 254, 0.3)',
                        borderColor: 'rgba(1, 205, 254, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(1, 205, 254, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(1, 205, 254, 1)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            backdropColor: 'transparent'
                        },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }
    
    // Ekspor statistik sebagai file JSON
    function exportStatistics() {
        const exportData = {
            exportDate: new Date().toISOString(),
            range: statisticsData.currentRange,
            productivity: statisticsData.productivity,
            categories: statisticsData.categories,
            completion: statisticsData.completion,
            timePatterns: statisticsData.timePatterns
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `task4shana_stats_${getTodayDateString()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Statistik berhasil diekspor!', 'success');
    }
    
    // Inisialisasi komponen
    function init() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.1/chart.min.js';
            script.onload = function() {
                generateStatisticsData();
                updateAllCharts();
            };
            document.head.appendChild(script);
        } else {
            generateStatisticsData();
            updateAllCharts();
        }
        
        setupTasksObserver();
    }
    
    // Pantau perubahan pada daftar tugas
    function setupTasksObserver() {
        setInterval(() => {
            const currentTasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const filteredTasks = filterTasksByDateRange(currentTasks, statisticsData.currentRange);
            
            const currentTaskCount = filteredTasks.length;
            const completedTaskCount = filteredTasks.filter(task => task.completed).length;
            
            if (currentTaskCount !== (statisticsData.productivity.addedData || []).reduce((sum, val) => sum + val, 0) ||
                completedTaskCount !== (statisticsData.productivity.completedData || []).reduce((sum, val) => sum + val, 0)) {
                generateStatisticsData();
                updateAllCharts();
            }
        }, 5000);
    }
    
    // Mulai inisialisasi
    init();
}

