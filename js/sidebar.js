// ============================================
// SIDEBAR COMPONENTS (Achievements, Events, Quick Note, Focus Today, Quotes)
// ============================================

import { tasks, achievements, events, quickNoteContent, focusToday, focusCompleted, currentQuote, setQuickNoteContent, setFocusToday, setFocusCompleted, setCurrentQuote } from './config.js';
import { showNotification, createConfetti } from './ui.js';
import { quotes } from './data.js';

// Inisialisasi data contoh
export function initSidebarComponents() {
    // Inisialisasi pencapaian - menggunakan splice untuk mengubah array
    achievements.splice(0, achievements.length, 
        { 
            id: 1, 
            title: 'Pemula Produktif', 
            description: 'Selesaikan 5 tugas', 
            progress: 0, 
            target: 5, 
            icon: 'fa-star' 
        },
        { 
            id: 2, 
            title: 'Streak Harian', 
            description: '0/5 hari berturut-turut', 
            progress: 0, 
            target: 5, 
            icon: 'fa-fire' 
        },
        { 
            id: 3, 
            title: 'Master Penyelesai', 
            description: '0/20 tugas selesai', 
            progress: 0, 
            target: 20, 
            icon: 'fa-check-double' 
        }
    );
    
    // Dapatkan tanggal hari ini dan beberapa hari ke depan
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Inisialisasi events contoh - menggunakan splice untuk mengubah array
    events.splice(0, events.length,
        {
            id: 1,
            title: 'Ulang Tahun Ell',
            date: new Date(today.getFullYear(), 2, 11),
            time: 'Seharian'
        },
        {
            id: 2,
            title: 'Deadline Tugas Matematika',
            date: new Date(today.getFullYear(), 4, 5),
            time: '23:59'
        },
        {
            id: 3,
            title: 'Ujian Tengah Semester',
            date: new Date(today.getFullYear(), 4, 10),
            time: '08:00 - 11:00'
        }
    );
    
    // Render komponen
    renderAchievements();
    renderEvents();
    renderQuickNote();
    renderFocusToday();
    renderQuote();
    
    // Update pencapaian berdasarkan tugas
    updateAchievements();
}

// ===== FUNGSI UNTUK PENCAPAIAN =====
function renderAchievements() {
    const container = document.querySelector('.achievements-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    achievements.forEach(achievement => {
        const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
        
        const item = document.createElement('div');
        item.className = 'achievement-item';
        item.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-progress">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="achievement-desc">${achievement.progress}/${achievement.target} ${achievement.description.split(' ').slice(-2).join(' ')}</div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

export function updateAchievements() {
    // Pencapaian 1: Pemula Produktif - Selesaikan 5 tugas
    const completedTasksCount = tasks.filter(task => task.completed).length;
    achievements[0].progress = Math.min(achievements[0].target, completedTasksCount);
    
    // Pencapaian 2: Streak Harian - 5 hari berturut-turut
    achievements[1].progress = 2; // Contoh: 2 hari streak
    achievements[1].description = `${achievements[1].progress}/${achievements[1].target} hari berturut-turut`;
    
    // Pencapaian 3: Master Penyelesai - 20 tugas selesai
    achievements[2].progress = Math.min(achievements[2].target, completedTasksCount);
    achievements[2].description = `${achievements[2].progress}/${achievements[2].target} tugas selesai`;
    
    renderAchievements();
}

// ===== FUNGSI UNTUK EVENTS =====
function renderEvents() {
    const container = document.querySelector('.events-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Urutkan events berdasarkan tanggal
    const sortedEvents = [...events].sort((a, b) => a.date - b.date);
    
    // Tampilkan hanya 3 event terdekat
    sortedEvents.slice(0, 3).forEach(event => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        
        const item = document.createElement('div');
        item.className = 'event-item';
        item.innerHTML = `
            <div class="event-date">
                <div class="event-month">${months[event.date.getMonth()]}</div>
                <div class="event-day">${event.date.getDate()}</div>
            </div>
            <div class="event-info">
                <div class="event-title">${event.title}</div>
                <div class="event-time"><i class="far fa-clock"></i> ${event.time}</div>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // Event listener untuk tombol tambah jadwal
    const addEventBtn = document.querySelector('.add-event-btn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            alert('Fitur tambah jadwal akan segera hadir!');
        });
    }
}

// ===== FUNGSI UNTUK CATATAN CEPAT =====
function renderQuickNote() {
    const quickNote = document.getElementById('quickNote');
    if (!quickNote) return;
    
    quickNote.value = quickNoteContent;
    
    // Event listener untuk menyimpan catatan
    const saveNoteBtn = document.querySelector('.save-note');
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', () => {
            setQuickNoteContent(quickNote.value);
            localStorage.setItem('quickNote', quickNote.value);
            showNotification('Catatan berhasil disimpan!', 'success');
        });
    }
    
    // Event listener untuk menghapus catatan
    const clearNoteBtn = document.querySelector('.clear-note');
    if (clearNoteBtn) {
        clearNoteBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
                quickNote.value = '';
                setQuickNoteContent('');
                localStorage.setItem('quickNote', '');
                showNotification('Catatan berhasil dihapus!', 'info');
            }
        });
    }
    
    // Auto save saat keluar dari textarea
    quickNote.addEventListener('blur', () => {
        setQuickNoteContent(quickNote.value);
        localStorage.setItem('quickNote', quickNote.value);
    });
}

// ===== FUNGSI UNTUK FOKUS HARI INI =====
function renderFocusToday() {
    const focusInput = document.getElementById('focusInput');
    const setFocusBtn = document.getElementById('setFocusBtn');
    const focusDisplay = document.querySelector('.focus-display');
    const focusText = document.querySelector('.focus-text');
    
    if (!focusInput || !setFocusBtn || !focusDisplay || !focusText) return;
    
    // Tampilkan fokus jika ada
    if (focusToday) {
        focusInput.style.display = 'none';
        setFocusBtn.style.display = 'none';
        focusDisplay.style.display = 'block';
        focusText.textContent = focusToday;
        
        // Tandai sebagai selesai jika sudah selesai
        if (focusCompleted) {
            focusText.style.textDecoration = 'line-through';
            focusText.style.opacity = '0.7';
        } else {
            focusText.style.textDecoration = 'none';
            focusText.style.opacity = '1';
        }
    } else {
        focusInput.style.display = 'block';
        setFocusBtn.style.display = 'block';
        focusDisplay.style.display = 'none';
    }
    
    // Event listener untuk tombol set fokus
    setFocusBtn.addEventListener('click', () => {
        const value = focusInput.value.trim();
        if (value) {
            setFocusToday(value);
            setFocusCompleted(false);
            localStorage.setItem('focusToday', value);
            localStorage.setItem('focusCompleted', 'false');
            renderFocusToday();
            showNotification('Fokus hari ini berhasil ditetapkan!', 'success');
        } else {
            showNotification('Harap masukkan fokus hari ini!', 'error');
            focusInput.focus();
        }
    });
    
    // Event listener untuk input fokus dengan enter
    focusInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            setFocusBtn.click();
        }
    });
    
    // Event listener untuk tombol selesai
    const completeFocusBtn = document.querySelector('.complete-focus');
    if (completeFocusBtn) {
        completeFocusBtn.addEventListener('click', () => {
            const newValue = !focusCompleted;
            setFocusCompleted(newValue);
            localStorage.setItem('focusCompleted', newValue);
            renderFocusToday();
            
            if (newValue) {
                showNotification('Fokus hari ini selesai! Hebat!', 'success');
                createConfetti();
            } else {
                showNotification('Fokus hari ini belum selesai.', 'info');
            }
        });
    }
    
    // Event listener untuk tombol edit
    const editFocusBtn = document.querySelector('.edit-focus');
    if (editFocusBtn) {
        editFocusBtn.addEventListener('click', () => {
            focusInput.value = focusToday;
            focusInput.style.display = 'block';
            setFocusBtn.style.display = 'block';
            focusDisplay.style.display = 'none';
            focusInput.focus();
        });
    }
    
    // Event listener untuk tombol hapus
    const deleteFocusBtn = document.querySelector('.delete-focus');
    if (deleteFocusBtn) {
        deleteFocusBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin menghapus fokus hari ini?')) {
                setFocusToday('');
                setFocusCompleted(false);
                localStorage.setItem('focusToday', '');
                localStorage.setItem('focusCompleted', 'false');
                renderFocusToday();
                showNotification('Fokus hari ini berhasil dihapus!', 'info');
            }
        });
    }
}

// ===== FUNGSI UNTUK QUOTE =====
function renderQuote() {
    const quoteText = document.querySelector('.quote-text');
    const quoteAuthor = document.querySelector('.quote-author');
    const newQuoteBtn = document.querySelector('.new-quote-btn');
    
    if (!quoteText || !quoteAuthor || !newQuoteBtn) return;
    
    // Tampilkan quote saat ini
    quoteText.textContent = `"${quotes[currentQuote].text}"`;
    quoteAuthor.textContent = `— ${quotes[currentQuote].author}`;
    
    // Event listener untuk tombol quote baru
    newQuoteBtn.addEventListener('click', () => {
        // Pilih quote acak yang berbeda dari quote saat ini
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * quotes.length);
        } while (newIndex === currentQuote && quotes.length > 1);
        
        setCurrentQuote(newIndex);
        
        // Animasi fade out dan fade in
        quoteText.style.opacity = 0;
        quoteAuthor.style.opacity = 0;
        
        setTimeout(() => {
            quoteText.textContent = `"${quotes[currentQuote].text}"`;
            quoteAuthor.textContent = `— ${quotes[currentQuote].author}`;
            
            quoteText.style.opacity = 1;
            quoteAuthor.style.opacity = 1;
        }, 300);
    });
}

