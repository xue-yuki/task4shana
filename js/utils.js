// ============================================
// UTILITY FUNCTIONS
// ============================================

import { soundEnabled, soundEffectsConfig } from './config.js';

// Get or create audioContext
function getAudioContext() {
    if (typeof window !== 'undefined') {
        if (!window.audioContext) {
            try {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return null;
            }
        }
        return window.audioContext;
    }
    return null;
}

// Format date to Indonesian format
export function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// Format date to YYYY-MM-DD string without timezone issues
export function formatDateToString(year, month, day) {
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0'); // month is 0-indexed
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Get today's date in YYYY-MM-DD format without timezone issues
export function getTodayDateString() {
    const now = new Date();
    return formatDateToString(now.getFullYear(), now.getMonth(), now.getDate());
}

// Play sound effect
export function playSoundEffect(type) {
    if (!soundEnabled) return;

    const effectName = soundEffectsConfig[type] || 'success1';
    const audioContext = getAudioContext();

    if (!audioContext) {
        try {
            createSimpleBeep(effectName);
            return;
        } catch (e) {
            console.log('Web Audio API not supported');
            return;
        }
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    let frequency, duration, type_wave;

    switch (effectName) {
        case 'success1':
        case 'success2':
            frequency = type === 'achievement' ? 800 : 600;
            duration = 0.2;
            type_wave = 'sine';
            break;
        case 'bell':
            frequency = 800;
            duration = 0.5;
            type_wave = 'sine';
            break;
        case 'ding':
            frequency = 600;
            duration = 0.15;
            type_wave = 'sine';
            break;
        case 'pop':
            frequency = 400;
            duration = 0.1;
            type_wave = 'sine';
            break;
        case 'click':
            frequency = 1000;
            duration = 0.05;
            type_wave = 'square';
            break;
        case 'whoosh':
            frequency = 300;
            duration = 0.3;
            type_wave = 'sawtooth';
            break;
        case 'trash':
            frequency = 200;
            duration = 0.2;
            type_wave = 'sawtooth';
            break;
        case 'swoosh':
            frequency = 400;
            duration = 0.25;
            type_wave = 'sine';
            break;
        case 'celebration':
        case 'fanfare':
        case 'victory':
            playCelebrationSound();
            return;
        case 'tick':
            frequency = 1000;
            duration = 0.05;
            type_wave = 'square';
            break;
        case 'tock':
            frequency = 800;
            duration = 0.05;
            type_wave = 'square';
            break;
        case 'alarm':
            frequency = 800;
            duration = 0.3;
            type_wave = 'sine';
            break;
        default:
            frequency = 600;
            duration = 0.2;
            type_wave = 'sine';
    }

    oscillator.type = type_wave;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

export function playCelebrationSound() {
    const audioContext = getAudioContext();
    if (!audioContext) {
        return;
    }

    const tones = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C

    tones.forEach((freq, index) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = freq;

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }, index * 100);
    });
}

export function createSimpleBeep(type) {
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZijcIGWi77+WfTQ='; // Simple beep
    audio.volume = 0.3;
    audio.play().catch(() => {});
}

export function createFloatingHeart(element) {
    const heart = document.createElement('div');
    heart.innerHTML = '💕';
    heart.style.cssText = `
        position: absolute;
        font-size: 20px;
        pointer-events: none;
        z-index: 1000;
        animation: floatHeart 2s ease-out forwards;
    `;

    const rect = element.getBoundingClientRect();
    heart.style.left = (rect.left + rect.width / 2) + 'px';
    heart.style.top = (rect.top + 20) + 'px';

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 2000);
}

// Add CSS for floating heart animation
const floatHeartStyle = document.createElement('style');
floatHeartStyle.textContent = `
    @keyframes floatHeart {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(1.5);
        }
    }
`;
document.head.appendChild(floatHeartStyle);

