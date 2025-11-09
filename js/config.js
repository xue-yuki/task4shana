// ============================================
// CONFIGURATION & GLOBAL VARIABLES
// ============================================

// Initialize data
export let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
export let currentEditTaskId = null;
export let pomodoroInterval = null;
export let timerMode = 'work';
export let timerSeconds = 25 * 60;
export let timerRunning = false;
export let soundEnabled = JSON.parse(localStorage.getItem('soundEnabled') || 'true');
export let visualEffectsEnabled = JSON.parse(localStorage.getItem('visualEffectsEnabled') || 'true');
export let userName = localStorage.getItem('userName') || 'Shana';
export let currentTheme = localStorage.getItem('appTheme') || 'cyberpunk';
export let currentMonth = new Date().getMonth();
export let currentYear = new Date().getFullYear();

// Sidebar components data
export let achievements = [];
export let events = [];
export let quickNoteContent = localStorage.getItem('quickNote') || '';
export let focusToday = localStorage.getItem('focusToday') || '';
export let focusCompleted = JSON.parse(localStorage.getItem('focusCompleted') || 'false');
export let currentQuote = 0;

// Music & Sound State
export let musicState = {
    currentPlaylist: null,
    currentTrackIndex: 0,
    isPlaying: false,
    volume: parseInt(localStorage.getItem('musicVolume') || '50'),
    customTracks: JSON.parse(localStorage.getItem('customTracks')) || [],
    currentAudio: null
};

export let ambientSounds = {};
export let whiteNoise = null;
export let whiteNoiseNode = null;
export let audioContext = null;

// Sound Effects Configuration
export let soundEffectsConfig = JSON.parse(localStorage.getItem('soundEffectsConfig')) || {
    complete: 'success1',
    add: 'pop',
    delete: 'trash',
    achievement: 'celebration',
    timer: 'tick'
};

// Web3Forms Access Key - GANTI INI DENGAN ACCESS KEY KAMU!
// Dapatkan di: https://web3forms.com/
export const WEB3FORMS_ACCESS_KEY = '2e13140b-70bd-44b7-a587-af1b3c731bc1'; // ⚠️ GANTI INI!

// Setter functions for sidebar variables
export function setQuickNoteContent(value) {
    quickNoteContent = value;
}

export function setFocusToday(value) {
    focusToday = value;
}

export function setFocusCompleted(value) {
    focusCompleted = value;
}

export function setCurrentQuote(value) {
    currentQuote = value;
}

// Setter functions for core variables
export function setUserName(value) {
    userName = value;
}

export function setSoundEnabled(value) {
    soundEnabled = value;
}

export function setVisualEffectsEnabled(value) {
    visualEffectsEnabled = value;
}

export function setTimerMode(value) {
    timerMode = value;
}

export function setTimerSeconds(value) {
    timerSeconds = value;
}

export function setTimerRunning(value) {
    timerRunning = value;
}

export function setCurrentMonth(value) {
    currentMonth = value;
}

export function setCurrentYear(value) {
    currentYear = value;
}

// Re-export playlists from data.js
export { playlists } from './data.js';

