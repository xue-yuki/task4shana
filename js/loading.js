// ============================================
// LOADING SCREEN
// ============================================

import { loadingTips } from './data.js';

export function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const loadingStatus = document.getElementById('loadingStatus');
    const loadingTip = document.getElementById('loadingTip');
    
    if (!loadingScreen || !loadingBar || !loadingStatus || !loadingTip) return;
    
    // Tambahkan data-text untuk efek glitch
    const loadingTitle = document.querySelector('.loading-title');
    if (loadingTitle) {
        loadingTitle.setAttribute('data-text', 'Task4Shana');
    }
    
    // Tampilkan tip acak
    loadingTip.textContent = loadingTips[Math.floor(Math.random() * loadingTips.length)];
    
    // Buat pixel particles
    createLoadingPixels(loadingScreen);
    
    // Simulasi loading dengan tahapan
    const loadingSteps = [
        { progress: 10, message: "Memuat komponen UI..." },
        { progress: 25, message: "Menginisialisasi data..." },
        { progress: 40, message: "Menyiapkan tema..." },
        { progress: 60, message: "Memuat tugas kamu..." },
        { progress: 75, message: "Menyusun jadwal..." },
        { progress: 90, message: "Hampir selesai..." },
        { progress: 100, message: "Selamat datang di Task4Shana!" }
    ];
    
    let currentStep = 0;
    
    function updateLoadingStatus() {
        if (currentStep < loadingSteps.length) {
            const step = loadingSteps[currentStep];
            loadingBar.style.width = step.progress + '%';
            loadingStatus.textContent = step.message;
            currentStep++;
            
            // Jadwalkan langkah berikutnya
            setTimeout(updateLoadingStatus, 500);
        } else {
            // Loading selesai
            setTimeout(function() {
                loadingScreen.classList.add('fade-out');
                // Hapus loading screen setelah fade out
                setTimeout(function() {
                    loadingScreen.remove();
                }, 500);
            }, 500);
        }
    }
    
    // Mulai animasi loading
    setTimeout(updateLoadingStatus, 500);
}

// Buat pixel particles untuk efek visual
function createLoadingPixels(container) {
    if (!container) return;
    
    const pixelCount = 15;
    
    for (let i = 0; i < pixelCount; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'loading-pixel';
        
        // Posisi acak
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        
        // Warna acak
        const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Ukuran acak
        const size = Math.random() * 6 + 2;
        
        // Durasi animasi acak
        const duration = Math.random() * 3 + 2;
        
        // Delay acak
        const delay = Math.random() * 2;
        
        // Set style
        pixel.style.left = posX + 'px';
        pixel.style.top = posY + 'px';
        pixel.style.backgroundColor = color;
        pixel.style.width = size + 'px';
        pixel.style.height = size + 'px';
        pixel.style.animationDuration = duration + 's';
        pixel.style.animationDelay = delay + 's';
        
        container.appendChild(pixel);
    }
}

