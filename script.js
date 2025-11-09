// ============================================
// MAIN APPLICATION ENTRY POINT
// ============================================

// Import all modules
import { productivityTips, motivationalQuotes, quotes, playlists, loadingTips } from './js/data.js';
import {
    tasks,
    currentEditTaskId,
    pomodoroInterval,
    timerMode,
    timerSeconds,
    timerRunning,
    soundEnabled,
    visualEffectsEnabled,
    userName,
    currentTheme,
    currentMonth,
    currentYear,
    achievements,
    events,
    quickNoteContent,
    focusToday,
    focusCompleted,
    currentQuote,
    musicState,
    ambientSounds,
    whiteNoise,
    whiteNoiseNode,
    audioContext,
    soundEffectsConfig,
    WEB3FORMS_ACCESS_KEY
} from './js/config.js';

import { formatDate, formatDateToString, getTodayDateString, playSoundEffect, createSimpleBeep, playCelebrationSound, createFloatingHeart } from './js/utils.js';
import {
    showNotification,
    initNotificationClose,
    createParticles,
    createConfetti,
    applyTheme,
    updateDailyMotivation,
    updateProductivityTip,
    updateWeatherWidget,
    initThemeSelection,
    showReplyFromEllNotification
} from './js/ui.js';
import {
    initCore,
    updateProgress,
    updateStats,
    generateCalendar,
    updateTimerDisplay,
    addTask,
    renderTasks,
    toggleTask,
    deleteTask,
    filterTasks,
    openEditModal,
    checkDueTasks,
    saveTasks
} from './js/core.js';
import { initSidebarComponents, updateAchievements } from './js/sidebar.js';
import { initLoadingScreen } from './js/loading.js';
import { initStatisticsComponent } from './js/statistics.js';
import { initPhotoGallery } from './js/gallery.js';
import { initMusicAndSound, updateMusicBadge } from './js/music-sound.js';
import { initInteractiveDropdowns, addDropdownAnimations } from './js/dropdowns.js';
import { initMessageToEllForm } from './js/message-form.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loading screen first
    initLoadingScreen();
    
    // Initialize notification close button
    initNotificationClose();
    
    // Initialize theme selection
    initThemeSelection();
    
    // Apply saved theme
    applyTheme(currentTheme);
    
    // Create particles if visual effects enabled
    if (visualEffectsEnabled) {
        createParticles();
    }
    
    // Initialize core functionality
    setTimeout(() => {
        initCore();
    }, 100);
    
    // Initialize sidebar components
    setTimeout(() => {
        initSidebarComponents();
    }, 200);
    
    // Initialize statistics component
    setTimeout(() => {
        initStatisticsComponent();
    }, 300);
    
    // Initialize photo gallery
    setTimeout(() => {
        initPhotoGallery();
    }, 300);
    
    // Initialize music and sound features
    setTimeout(() => {
        initMusicAndSound();
    }, 500);
    
    // Initialize interactive dropdowns
    setTimeout(() => {
        addDropdownAnimations();
        initInteractiveDropdowns();
    }, 300);
    
    // Initialize message form
    setTimeout(() => {
        initMessageToEllForm();
    }, 500);
    
    // Show notification about ReplyFromEll.html
    setTimeout(() => {
        showReplyFromEllNotification();
    }, 4000);
    
    // Update achievements when tasks change
    const originalAddTask = addTask;
    const originalToggleTask = toggleTask;
    const originalDeleteTask = deleteTask;
    
    // Wrap functions to update achievements
    window.addTask = function() {
        originalAddTask.apply(this, arguments);
        updateAchievements();
    };
    
    window.toggleTask = function() {
        originalToggleTask.apply(this, arguments);
        updateAchievements();
    };
    
    window.deleteTask = function() {
        originalDeleteTask.apply(this, arguments);
        updateAchievements();
    };
});

// Make some functions globally available for inline event handlers
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.renderTasks = renderTasks;
window.filterTasks = filterTasks;
window.openEditModal = openEditModal;
window.updateProgress = updateProgress;
window.updateStats = updateStats;
window.generateCalendar = generateCalendar;
window.updateTimerDisplay = updateTimerDisplay;
window.showNotification = showNotification;
window.createConfetti = createConfetti;
window.updateAchievements = updateAchievements;
window.updateMusicBadge = updateMusicBadge;
