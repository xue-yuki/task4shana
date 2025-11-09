// ============================================
// UI COMPONENTS (Notifications, Themes, Particles, etc.)
// ============================================

import {
    visualEffectsEnabled,
    soundEnabled,
    currentTheme,
    userName
} from './config.js';
import { productivityTips, motivationalQuotes } from './data.js';
import { formatDate, playSoundEffect } from './utils.js';

// Show notification
export function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    notificationText.textContent = message;
    
    // Remove all classes
    notification.className = 'notification';
    
    // Add type class
    notification.classList.add(type);
    
    // Show notification
    notification.classList.add('show');
    
    // Play sound if enabled
    if (soundEnabled) {
        playSoundEffect(type);
    }
    
    // Auto-hide after some time
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Initialize notification close button
export function initNotificationClose() {
    const notificationClose = document.getElementById('notificationClose');
    if (notificationClose) {
        notificationClose.addEventListener('click', () => {
            const notification = document.getElementById('notification');
            if (notification) {
                notification.classList.remove('show');
            }
        });
    }
}

// Create particles
export function createParticles() {
    if (!visualEffectsEnabled) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        
        // Random size
        const size = Math.random() * 4 + 2;
        
        // Random color
        const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--dark-accent)'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random opacity
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Random animation duration
        const duration = Math.random() * 20 + 10;
        
        // Set styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.backgroundColor = color;
        particle.style.opacity = opacity;
        
        // Create animation
        const keyframes = `
            @keyframes float-${i} {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 360}deg); }
                50% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 360}deg); }
                75% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) rotate(${Math.random() * 360}deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        particle.style.animation = `float-${i} ${duration}s ease-in-out infinite`;
        
        document.body.appendChild(particle);
    }
}

// Create confetti animation
export function createConfetti() {
    if (!visualEffectsEnabled) return;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random position at the top
        const posX = Math.random() * window.innerWidth;
        
        // Random color
        const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--dark-accent)', 'var(--warning)'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random size
        const size = Math.random() * 10 + 5;
        
        // Random rotation
        const rotation = Math.random() * 360;
        
        // Random animation duration
        const duration = Math.random() * 2 + 1;
        
        // Set styles
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.left = `${posX}px`;
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = color;
        confetti.style.transform = `rotate(${rotation}deg)`;
        confetti.style.animationDuration = `${duration}s`;
        
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}

// Apply theme
export function applyTheme(theme) {
    const root = document.documentElement;
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Clear selected class
    themeOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.theme === theme) {
            option.classList.add('selected');
        }
    });
    
    switch(theme) {
        case 'cyberpunk':
            root.style.setProperty('--primary', '#ff71ce');
            root.style.setProperty('--secondary', '#01cdfe');
            root.style.setProperty('--accent', '#05ffa1');
            root.style.setProperty('--dark-accent', '#b967ff');
            root.style.setProperty('--background', '#2a0038');
            document.body.style.background = 'linear-gradient(45deg, #2a0038, #1c0440)';
            break;
        case 'twilight':
            root.style.setProperty('--primary', '#e94057');
            root.style.setProperty('--secondary', '#f27121');
            root.style.setProperty('--accent', '#ffcc00');
            root.style.setProperty('--dark-accent', '#8a2387');
            root.style.setProperty('--background', '#240b36');
            document.body.style.background = 'linear-gradient(45deg, #240b36, #6c0a28)';
            break;
        case 'ocean':
            root.style.setProperty('--primary', '#00b4db');
            root.style.setProperty('--secondary', '#00d2ff');
            root.style.setProperty('--accent', '#a9ffcd');
            root.style.setProperty('--dark-accent', '#0083b0');
            root.style.setProperty('--background', '#004e92');
            document.body.style.background = 'linear-gradient(45deg, #004e92, #002040)';
            break;
        case 'forest':
            root.style.setProperty('--primary', '#71b280');
            root.style.setProperty('--secondary', '#134e5e');
            root.style.setProperty('--accent', '#b0ff9d');
            root.style.setProperty('--dark-accent', '#2c3e50');
            root.style.setProperty('--background', '#0f2027');
            document.body.style.background = 'linear-gradient(45deg, #0f2027, #1e3521)';
            break;
    }
    
    localStorage.setItem('appTheme', theme);
}

// Update daily motivation
export function updateDailyMotivation() {
    const dailyMotivation = document.getElementById('dailyMotivation');
    if (!dailyMotivation) return;
    
    const date = new Date();
    const day = date.getDate();
    const motivationIndex = day % motivationalQuotes.length;
    dailyMotivation.textContent = motivationalQuotes[motivationIndex];
}

// Update productivity tip
export function updateProductivityTip() {
    const productivityTip = document.getElementById('productivityTip');
    if (!productivityTip) return;
    
    const date = new Date();
    const day = date.getDate();
    const tipIndex = day % productivityTips.length;
    productivityTip.textContent = productivityTips[tipIndex];
}

// Handle weather widget (simulate API call)
export function updateWeatherWidget() {
    const weatherIcons = ['fa-sun', 'fa-cloud-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-cloud-showers-heavy'];
    const weatherTypes = ['Cerah', 'Cerah Berawan', 'Berawan', 'Hujan Ringan', 'Hujan Lebat'];
    const temperatures = [25, 26, 27, 28, 29, 30, 31, 32];
    
    // Random weather
    const randomIndex = Math.floor(Math.random() * weatherIcons.length);
    const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
    
    const weatherIcon = document.querySelector('.weather-icon i');
    const weatherTemp = document.querySelector('.weather-temp');
    const weatherDesc = document.querySelector('.weather-desc');
    
    if (!weatherIcon || !weatherTemp || !weatherDesc) return;
    
    // Remove all weather classes and add the new one
    weatherIcon.className = '';
    weatherIcon.classList.add('fas', weatherIcons[randomIndex]);
    
    weatherTemp.textContent = `${randomTemp}°C`;
    weatherDesc.textContent = weatherTypes[randomIndex];
}

// Initialize theme selection
export function initThemeSelection() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            applyTheme(theme);
        });
    });
}

// Show notification about ReplyFromEll.html
export function showReplyFromEllNotification() {
    // Check if user has seen notification today
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('replyFromEllNotificationDate');
    
    // Show notification if not shown today
    if (lastShown !== today) {
        // Check if ReplyFromEll.html exists
        fetch('ReplyFromEll.html', { method: 'HEAD' })
            .then(() => {
                // File exists, show notification
                setTimeout(() => {
                    const notification = document.getElementById('notification');
                    const notificationText = document.getElementById('notificationText');
                    const notificationIcon = document.querySelector('.notification-icon');
                    
                    if (notification && notificationText && notificationIcon) {
                        // Update icon to heart
                        notificationIcon.innerHTML = '<i class="fas fa-heart"></i>';
                        
                        // Create message with link
                        notificationText.innerHTML = '💫 Ada pesan spesial dari Ell untuk kamu! <a href="ReplyFromEll.html" style="color: #ffd700; text-decoration: underline; font-weight: bold; cursor: pointer;">Klik di sini</a>';
                        
                        // Add special styling for this notification
                        notification.className = 'notification';
                        notification.classList.add('special');
                        notification.classList.add('show');
                        
                        // Prevent notification from closing when clicking the link
                        const link = notificationText.querySelector('a');
                        if (link) {
                            link.addEventListener('click', (e) => {
                                e.stopPropagation();
                                // Save that notification was shown today when link is clicked
                                localStorage.setItem('replyFromEllNotificationDate', today);
                            });
                        }
                        
                        // Play sound if enabled
                        if (soundEnabled) {
                            playSoundEffect('notification');
                        }
                        
                        // Save that notification was shown today
                        localStorage.setItem('replyFromEllNotificationDate', today);
                        
                        // Auto-hide after 10 seconds (longer for important notification)
                        setTimeout(() => {
                            notification.classList.remove('show');
                        }, 10000);
                    }
                }, 3500); // Show after loading screen (3.5 seconds)
            })
            .catch(() => {
                // File doesn't exist, don't show notification
                console.log('ReplyFromEll.html not found');
            });
    }
}

