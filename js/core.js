// ============================================
// CORE FUNCTIONALITY (Tasks, Calendar, Timer, Progress, Stats)
// ============================================

import {
    tasks,
    currentEditTaskId,
    pomodoroInterval,
    timerMode,
    timerSeconds,
    timerRunning,
    soundEnabled,
    visualEffectsEnabled,
    currentMonth,
    currentYear,
    userName,
    setUserName,
    setSoundEnabled,
    setVisualEffectsEnabled,
    setTimerMode,
    setTimerSeconds,
    setTimerRunning,
    setCurrentMonth,
    setCurrentYear
} from './config.js';
import { showNotification, createConfetti, applyTheme, createParticles, updateDailyMotivation, updateProductivityTip, updateWeatherWidget } from './ui.js';
import { formatDate, formatDateToString, getTodayDateString, playSoundEffect } from './utils.js';

// DOM Elements - akan diinisialisasi saat DOM ready
let taskInput, categorySelect, taskDate, addTaskBtn, taskList, progressBar, progressText;
let calendarMonth, calendarGrid, prevMonth, nextMonth, searchInput;
let totalTasksEl, completedTasksEl, todayTasksEl, highPriorityTasksEl;
let timerDisplay, startTimer, pauseTimer, resetTimer, workMode, shortBreakMode, longBreakMode;
let taskModal, modalClose, editTaskName, editTaskCategory, editTaskDate, editTaskDesc, priorityBtns, saveTaskBtn;
let settingsModal, settingsIcon, settingsModalClose, userNameInput, soundNotification, visualEffects, saveSettingsBtn;
let toggleMusic, toggleSound;
let allFilter, schoolFilter, personalFilter, gameFilter, completedFilter, highPriorityFilter;

// Initialize DOM elements
function initDOMElements() {
    taskInput = document.getElementById('taskInput');
    categorySelect = document.getElementById('categorySelect');
    taskDate = document.getElementById('taskDate');
    addTaskBtn = document.getElementById('addTaskBtn');
    taskList = document.getElementById('taskList');
    progressBar = document.getElementById('progressBar');
    progressText = document.getElementById('progressText');
    calendarMonth = document.getElementById('calendarMonth');
    calendarGrid = document.getElementById('calendarGrid');
    prevMonth = document.getElementById('prevMonth');
    nextMonth = document.getElementById('nextMonth');
    searchInput = document.getElementById('searchInput');
    totalTasksEl = document.getElementById('totalTasks');
    completedTasksEl = document.getElementById('completedTasks');
    todayTasksEl = document.getElementById('todayTasks');
    highPriorityTasksEl = document.getElementById('highPriorityTasks');
    timerDisplay = document.getElementById('timerDisplay');
    startTimer = document.getElementById('startTimer');
    pauseTimer = document.getElementById('pauseTimer');
    resetTimer = document.getElementById('resetTimer');
    workMode = document.getElementById('workMode');
    shortBreakMode = document.getElementById('shortBreakMode');
    longBreakMode = document.getElementById('longBreakMode');
    taskModal = document.getElementById('taskModal');
    modalClose = document.getElementById('modalClose');
    editTaskName = document.getElementById('editTaskName');
    editTaskCategory = document.getElementById('editTaskCategory');
    editTaskDate = document.getElementById('editTaskDate');
    editTaskDesc = document.getElementById('editTaskDesc');
    priorityBtns = document.querySelectorAll('.priority-btn');
    saveTaskBtn = document.getElementById('saveTaskBtn');
    settingsModal = document.getElementById('settingsModal');
    settingsIcon = document.querySelector('.setting-icon');
    settingsModalClose = document.getElementById('settingsModalClose');
    userNameInput = document.getElementById('userNameInput');
    soundNotification = document.getElementById('soundNotification');
    visualEffects = document.getElementById('visualEffects');
    saveSettingsBtn = document.getElementById('saveSettingsBtn');
    toggleMusic = document.getElementById('toggleMusic');
    toggleSound = document.getElementById('toggleSound');
    allFilter = document.getElementById('allFilter');
    schoolFilter = document.getElementById('schoolFilter');
    personalFilter = document.getElementById('personalFilter');
    gameFilter = document.getElementById('gameFilter');
    completedFilter = document.getElementById('completedFilter');
    highPriorityFilter = document.getElementById('highPriorityFilter');
}

// Set default date to today
function setDefaultDate() {
    if (taskDate) {
        const today = new Date();
        taskDate.valueAsDate = today;
    }
}

// Update progress bar
export function updateProgress() {
    if (!progressBar || !progressText) return;
    
    if (tasks.length === 0) {
        progressBar.style.width = "0%";
        progressText.textContent = "Belum ada tugas yang selesai";
        return;
    }
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const progressPercentage = Math.round((completedTasks / tasks.length) * 100);
    
    progressBar.style.width = `${progressPercentage}%`;
    
    if (progressPercentage < 30) {
        progressText.textContent = `${progressPercentage}% selesai. Ayo semangat!`;
    } else if (progressPercentage < 70) {
        progressText.textContent = `${progressPercentage}% selesai. Hebat, terus lanjutkan!`;
    } else if (progressPercentage < 100) {
        progressText.textContent = `Yey! Udah ${progressPercentage}% selesai!`;
    } else {
        progressText.textContent = `Wow! Semua tugas selesai! 🎉`;
        if (typeof createConfetti === 'function') {
            createConfetti();
        }
    }
}

// Update statistics
export function updateStats() {
    if (!totalTasksEl || !completedTasksEl || !todayTasksEl || !highPriorityTasksEl) return;
    
    const today = getTodayDateString();
    
    totalTasksEl.textContent = tasks.length;
    completedTasksEl.textContent = tasks.filter(task => task.completed).length;
    todayTasksEl.textContent = tasks.filter(task => task.date === today).length;
    highPriorityTasksEl.textContent = tasks.filter(task => task.priority === 'high').length;
}

// Generate calendar
export function generateCalendar() {
    if (!calendarGrid || !calendarMonth) return;
    
    calendarGrid.innerHTML = '';
    
    const date = new Date(currentYear, currentMonth);
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    calendarMonth.textContent = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    
    // Add day headers
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    days.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Add blank spaces for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const blankDay = document.createElement('div');
        blankDay.className = 'calendar-date blank';
        calendarGrid.appendChild(blankDay);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dateElement = document.createElement('div');
        dateElement.className = 'calendar-date';
        dateElement.textContent = i;
        
        // Create date string for comparison (without timezone issues)
        const dateString = formatDateToString(currentYear, currentMonth, i);
        
        // Highlight current day
        const today = new Date();
        if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dateElement.classList.add('current');
        }
        
        // Highlight days with tasks
        const tasksOnThisDay = tasks.filter(task => task.date === dateString);
        if (tasksOnThisDay.length > 0) {
            dateElement.classList.add('has-task');
            
            // Add category identifier
            if (tasksOnThisDay.some(task => task.category === 'Sekolah')) {
                dateElement.classList.add('Sekolah');
            } else if (tasksOnThisDay.some(task => task.category === 'Pribadi')) {
                dateElement.classList.add('Pribadi');
            } else if (tasksOnThisDay.some(task => task.category === 'Game')) {
                dateElement.classList.add('Game');
            } else {
                dateElement.classList.add('Lainnya');
            }
        }
        
        // Add click event to show tasks for this date
        dateElement.addEventListener('click', () => {
            if (tasksOnThisDay.length > 0) {
                // Filter tasks for this date
                if (searchInput) searchInput.value = '';
                filterTasks('date', dateString);
                
                // Show notification
                showNotification(`Menampilkan tugas untuk tanggal ${formatDate(dateString)}`);
            } else {
                // Set this date in the task input and focus on task name
                if (taskDate) taskDate.value = dateString;
                if (taskInput) taskInput.focus();
                showNotification(`Tambahkan tugas untuk tanggal ${formatDate(dateString)}`);
            }
        });
        
        calendarGrid.appendChild(dateElement);
    }
}

// Previous month
function initCalendarNavigation() {
    if (prevMonth) {
        prevMonth.addEventListener('click', () => {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
            generateCalendar();
        });
    }
    
    if (nextMonth) {
        nextMonth.addEventListener('click', () => {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
            generateCalendar();
        });
    }
}

// Add task to the list
export function addTask() {
    if (!taskInput || !categorySelect || !taskDate) return;
    
    const taskText = taskInput.value.trim();
    const category = categorySelect.value;
    const date = taskDate.value;
    
    if (taskText === '') {
        showNotification('Nama tugas tidak boleh kosong!', 'error');
        taskInput.focus();
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        category: category,
        date: date,
        completed: false,
        priority: 'medium',
        description: '',
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateProgress();
    updateStats();
    generateCalendar();
    
    taskInput.value = '';
    
    // Show notification
    showNotification(`Tugas "${taskText}" berhasil ditambahkan!`, 'success');
    
    // Play sound effect if enabled
    if (soundEnabled) {
        playSoundEffect('add');
    }
}

// Open task modal for editing
export function openEditModal(task) {
    if (!taskModal || !editTaskName || !editTaskCategory || !editTaskDate || !editTaskDesc) return;
    
    currentEditTaskId = task.id;
    
    editTaskName.value = task.text;
    editTaskCategory.value = task.category;
    editTaskDate.value = task.date;
    editTaskDesc.value = task.description || '';
    
    // Reset priority buttons
    priorityBtns.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.priority === task.priority) {
            btn.classList.add('selected');
        }
    });
    
    taskModal.classList.add('show');
}

// Close task modal
function initTaskModal() {
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            if (taskModal) {
                taskModal.classList.remove('show');
            }
        });
    }
    
    // Handle priority button clicks
    priorityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            priorityBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // Save edited task
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', () => {
            if (!currentEditTaskId || !editTaskName || !editTaskCategory || !editTaskDate || !editTaskDesc) return;
            
            const taskText = editTaskName.value.trim();
            
            if (taskText === '') {
                showNotification('Nama tugas tidak boleh kosong!', 'error');
                editTaskName.focus();
                return;
            }
            
            const taskIndex = tasks.findIndex(task => task.id === currentEditTaskId);
            if (taskIndex !== -1) {
                // Get selected priority
                let selectedPriority = 'medium';
                priorityBtns.forEach(btn => {
                    if (btn.classList.contains('selected')) {
                        selectedPriority = btn.dataset.priority;
                    }
                });
                
                // Update task
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    text: taskText,
                    category: editTaskCategory.value,
                    date: editTaskDate.value,
                    description: editTaskDesc.value,
                    priority: selectedPriority,
                    updatedAt: new Date().toISOString()
                };
                
                saveTasks();
                renderTasks();
                updateStats();
                generateCalendar();
                
                if (taskModal) taskModal.classList.remove('show');
                
                showNotification(`Tugas "${taskText}" berhasil diperbarui!`, 'success');
            }
        });
    }
}

// Open settings modal
function initSettingsModal() {
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.add('show');
            }
        });
    }
    
    // Close settings modal
    if (settingsModalClose) {
        settingsModalClose.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.remove('show');
            }
        });
    }
    
    // Save settings
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            if (!userNameInput || !soundNotification || !visualEffects) return;
            
            const newUserName = userNameInput.value.trim() || 'Shana';
            setUserName(newUserName);
            localStorage.setItem('userName', newUserName);
            
            setSoundEnabled(soundNotification.checked);
            setVisualEffectsEnabled(visualEffects.checked);
            
            localStorage.setItem('soundEnabled', soundNotification.checked);
            localStorage.setItem('visualEffectsEnabled', visualEffects.checked);
            
            if (settingsModal) settingsModal.classList.remove('show');
            
            // Clear and recreate particles if needed
            const existingParticles = document.querySelectorAll('.particle');
            existingParticles.forEach(p => p.remove());
            
            if (visualEffectsEnabled) {
                createParticles();
            }
            
            showNotification('Pengaturan berhasil disimpan!', 'success');
        });
    }
}

// Toggle task completion
export function toggleTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return;
    
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    
    saveTasks();
    renderTasks();
    updateProgress();
    updateStats();
    
    // Show notification
    const action = tasks[taskIndex].completed ? 'selesai' : 'belum selesai';
    showNotification(`Tugas "${tasks[taskIndex].text}" ditandai ${action}!`, 'info');
    
    // Play confetti animation if completed
    if (tasks[taskIndex].completed) {
        createConfetti();
    }
}

// Delete task
export function deleteTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return;
    
    const taskText = tasks[taskIndex].text;
    
    // Confirm deletion
    if (confirm(`Apakah kamu yakin ingin menghapus tugas "${taskText}"?`)) {
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        updateProgress();
        updateStats();
        generateCalendar();
        
        // Show notification
        showNotification(`Tugas "${taskText}" berhasil dihapus!`, 'warning');
    }
}

// Save tasks to localStorage
export function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Filter tasks
export function filterTasks(type, value) {
    if (!allFilter || !schoolFilter || !personalFilter || !gameFilter || !completedFilter || !highPriorityFilter) return;
    
    // Clear existing active filters
    document.querySelectorAll('.filter-badge').forEach(badge => {
        badge.classList.remove('active');
    });
    
    // Set active filter
    switch(type) {
        case 'all':
            allFilter.classList.add('active');
            renderTasks();
            break;
        case 'category':
            if (value === 'Sekolah') schoolFilter.classList.add('active');
            if (value === 'Pribadi') personalFilter.classList.add('active');
            if (value === 'Game') gameFilter.classList.add('active');
            renderTasks(task => task.category === value);
            break;
        case 'completed':
            completedFilter.classList.add('active');
            renderTasks(task => task.completed);
            break;
        case 'priority':
            highPriorityFilter.classList.add('active');
            renderTasks(task => task.priority === 'high');
            break;
        case 'date':
            renderTasks(task => task.date === value);
            break;
        case 'search':
            renderTasks(task => task.text.toLowerCase().includes(value.toLowerCase()));
            break;
    }
}

// Render tasks
export function renderTasks(filterFn = null) {
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    
    // Apply filter if provided
    if (filterFn) {
        filteredTasks = tasks.filter(filterFn);
    }
    
    // Apply search filter
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm) ||
            task.description?.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        // Different empty state for search vs no tasks
        if (searchTerm || filterFn) {
            emptyState.innerHTML = `
                <div class="empty-image">
                    <i class="fas fa-search" style="font-size: 80px; opacity: 0.5;"></i>
                </div>
                <p class="empty-text">Tidak ditemukan tugas yang sesuai dengan filter</p>
                <button id="clearFilterBtn"><i class="fas fa-times"></i> Hapus Filter</button>
            `;
        } else {
            emptyState.innerHTML = `
                <div class="empty-image">
                    <i class="fas fa-tasks" style="font-size: 80px; opacity: 0.5;"></i>
                </div>
                <p class="empty-text">Belum ada tugas. Yuk tambahkan!</p>
                <button id="addFirstTaskBtn"><i class="fas fa-plus"></i> Tambah Tugas Pertama</button>
            `;
        }
        
        taskList.appendChild(emptyState);
        
        // Event listeners for empty state buttons
        const clearFilterBtn = document.getElementById('clearFilterBtn');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                filterTasks('all');
            });
        }
        
        const addFirstTaskBtn = document.getElementById('addFirstTaskBtn');
        if (addFirstTaskBtn) {
            addFirstTaskBtn.addEventListener('click', () => {
                if (taskInput) taskInput.focus();
            });
        }
        
        return;
    }
    
    // Sort tasks: incomplete first, then high priority, then by date
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        if (!a.completed && !b.completed) {
            // Both incomplete, sort by priority (high → medium → low)
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
        }
        
        // Then by date
        return new Date(a.date) - new Date(b.date);
    });
    
    sortedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.category}`;
        li.dataset.taskId = task.id;
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-text';
        
        // Add priority indicator
        const priorityIndicator = document.createElement('span');
        priorityIndicator.className = `priority-indicator priority-${task.priority}`;
        
        // Task name with priority indicator
        taskContent.appendChild(priorityIndicator);
        taskContent.appendChild(document.createTextNode(task.text));
        
        // Add priority tag
        if (task.priority === 'high') {
            const priorityTag = document.createElement('span');
            priorityTag.className = `task-priority priority-tag-${task.priority}`;
            priorityTag.textContent = 'Prioritas Tinggi';
            taskContent.appendChild(priorityTag);
        }
        
        const taskDetail = document.createElement('div');
        taskDetail.className = 'task-detail';
        
        const taskCategory = document.createElement('span');
        taskCategory.className = `task-category ${task.category}`;
        taskCategory.textContent = task.category;
        
        const taskDate = document.createElement('span');
        taskDate.className = 'task-date';
        taskDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDate(task.date)}`;
        
        taskDetail.appendChild(taskCategory);
        taskDetail.appendChild(taskDate);
        
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit tugas';
        editBtn.dataset.taskId = task.id;
        
        // Complete/Undo button
        const toggleBtn = document.createElement('button');
        toggleBtn.dataset.taskId = task.id;
        
        if (task.completed) {
            toggleBtn.className = 'undo-btn';
            toggleBtn.innerHTML = '<i class="fas fa-undo"></i>';
            toggleBtn.title = 'Tandai belum selesai';
        } else {
            toggleBtn.className = 'complete-btn';
            toggleBtn.innerHTML = '<i class="fas fa-check"></i>';
            toggleBtn.title = 'Tandai selesai';
        }
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Hapus tugas';
        deleteBtn.dataset.taskId = task.id;
        
        taskActions.appendChild(editBtn);
        taskActions.appendChild(toggleBtn);
        taskActions.appendChild(deleteBtn);
        
        li.appendChild(taskContent);
        li.appendChild(taskDetail);
        li.appendChild(taskActions);
        
        // Add description if available
        if (task.description) {
            const taskDesc = document.createElement('div');
            taskDesc.className = 'task-description';
            taskDesc.style.fontSize = '12px';
            taskDesc.style.color = 'rgba(255, 255, 255, 0.7)';
            taskDesc.style.marginTop = '5px';
            taskDesc.style.marginBottom = '5px';
            taskDesc.style.paddingLeft = '20px';
            taskDesc.style.borderLeft = '2px solid rgba(255, 255, 255, 0.2)';
            taskDesc.textContent = task.description;
            
            // Insert after task content
            li.insertBefore(taskDesc, taskDetail);
        }
        
        taskList.appendChild(li);
    });
}

// Update timer display
export function updateTimerDisplay() {
    if (!timerDisplay) return;
    
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize timer
function initTimer() {
    if (!startTimer || !pauseTimer || !resetTimer || !workMode || !shortBreakMode || !longBreakMode) return;
    
    // Start timer
    startTimer.addEventListener('click', () => {
        if (timerRunning) return;
        
        setTimerRunning(true);
        
        let currentSeconds = timerSeconds;
        pomodoroInterval = setInterval(() => {
            currentSeconds--;
            setTimerSeconds(currentSeconds);
            
            if (currentSeconds <= 0) {
                clearInterval(pomodoroInterval);
                setTimerRunning(false);
                
                // Play notification sound
                if (soundEnabled) {
                    playSoundEffect('timer');
                }
                
                // Show notification
                let message = '';
                if (timerMode === 'work') {
                    message = 'Waktu kerja selesai! Saatnya istirahat.';
                } else if (timerMode === 'shortBreak') {
                    message = 'Istirahat selesai! Kembali bekerja?';
                } else {
                    message = 'Istirahat panjang selesai! Siap untuk sesi baru?';
                }
                
                showNotification(message, 'timer');
            }
            
            updateTimerDisplay();
        }, 1000);
    });
    
    // Pause timer
    pauseTimer.addEventListener('click', () => {
        if (!timerRunning) return;
        
        clearInterval(pomodoroInterval);
        setTimerRunning(false);
    });
    
    // Reset timer
    resetTimer.addEventListener('click', () => {
        clearInterval(pomodoroInterval);
        setTimerRunning(false);
        
        // Reset based on current mode
        if (timerMode === 'work') {
            setTimerSeconds(25 * 60);
        } else if (timerMode === 'shortBreak') {
            setTimerSeconds(5 * 60);
        } else {
            setTimerSeconds(15 * 60);
        }
        
        updateTimerDisplay();
    });
    
    // Work mode
    workMode.addEventListener('click', () => {
        clearInterval(pomodoroInterval);
        setTimerRunning(false);
        setTimerMode('work');
        setTimerSeconds(25 * 60);
        updateTimerDisplay();
        
        // Update active mode
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        workMode.classList.add('active');
    });
    
    // Short break mode
    shortBreakMode.addEventListener('click', () => {
        clearInterval(pomodoroInterval);
        setTimerRunning(false);
        setTimerMode('shortBreak');
        setTimerSeconds(5 * 60);
        updateTimerDisplay();
        
        // Update active mode
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        shortBreakMode.classList.add('active');
    });
    
    // Long break mode
    longBreakMode.addEventListener('click', () => {
        clearInterval(pomodoroInterval);
        setTimerRunning(false);
        setTimerMode('longBreak');
        setTimerSeconds(15 * 60);
        updateTimerDisplay();
        
        // Update active mode
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        longBreakMode.classList.add('active');
    });
}

// Toggle music
function initAudioControls() {
    if (toggleMusic) {
        toggleMusic.addEventListener('click', () => {
            toggleMusic.classList.toggle('active');
        });
    }
    
    // Toggle sound effects
    if (toggleSound) {
        toggleSound.addEventListener('click', () => {
            toggleSound.classList.toggle('active');
            const newSoundEnabled = toggleSound.classList.contains('active');
            setSoundEnabled(newSoundEnabled);
            localStorage.setItem('soundEnabled', newSoundEnabled);
        });
    }
}

// Search tasks
function initSearch() {
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                filterTasks('search', searchTerm);
            } else {
                filterTasks('all');
            }
        });
    }
}

// Initialize event listeners
function initEventListeners() {
    // Add task
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }
    
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }
    
    // Filter event listeners
    if (allFilter) allFilter.addEventListener('click', () => filterTasks('all'));
    if (schoolFilter) schoolFilter.addEventListener('click', () => filterTasks('category', 'Sekolah'));
    if (personalFilter) personalFilter.addEventListener('click', () => filterTasks('category', 'Pribadi'));
    if (gameFilter) gameFilter.addEventListener('click', () => filterTasks('category', 'Game'));
    if (completedFilter) completedFilter.addEventListener('click', () => filterTasks('completed'));
    if (highPriorityFilter) highPriorityFilter.addEventListener('click', () => filterTasks('priority', 'high'));
}

// Event delegation for task list
function initTaskListDelegation() {
    if (!taskList) return;
    
    taskList.addEventListener('click', function(e) {
        let targetEl = e.target;
        
        while (targetEl && targetEl !== this) {
            if (targetEl.tagName === 'BUTTON') {
                const taskId = parseInt(targetEl.dataset.taskId);
                if (isNaN(taskId)) {
                    targetEl = targetEl.parentNode;
                    continue;
                }
                
                if (targetEl.classList.contains('complete-btn') || targetEl.classList.contains('undo-btn')) {
                    toggleTask(taskId);
                } else if (targetEl.classList.contains('edit-btn')) {
                    const task = tasks.find(t => t.id === taskId);
                    if (task) openEditModal(task);
                } else if (targetEl.classList.contains('delete-btn')) {
                    deleteTask(taskId);
                }
                break;
            }
            targetEl = targetEl.parentNode;
        }
    });
}

// Check for tasks that are due today
export function checkDueTasks() {
    const today = getTodayDateString();
    const dueTasks = tasks.filter(task => task.date === today && !task.completed);
    
    if (dueTasks.length > 0) {
        setTimeout(() => {
            showNotification(`Kamu punya ${dueTasks.length} tugas yang harus diselesaikan hari ini!`, 'warning');
        }, 1500);
    }
}

// Set up toggle states correctly
function initToggleStates() {
    if (toggleSound) {
        if (soundEnabled) {
            toggleSound.classList.add('active');
        } else {
            toggleSound.classList.remove('active');
        }
    }
    
    // Default music to on
    if (toggleMusic) {
        toggleMusic.classList.add('active');
    }
}

// Initialize core functionality
export function initCore() {
    initDOMElements();
    setDefaultDate();
    initCalendarNavigation();
    initTaskModal();
    initSettingsModal();
    initTimer();
    initAudioControls();
    initSearch();
    initEventListeners();
    initTaskListDelegation();
    initToggleStates();
    
    // Initialize app
    updateDailyMotivation();
    updateProductivityTip();
    renderTasks();
    updateProgress();
    updateStats();
    generateCalendar();
    updateTimerDisplay();
    updateWeatherWidget();
    checkDueTasks();
}

