// ============================================
// MUSIC & SOUND INTERACTIVE FEATURES
// ============================================

import {
    musicState,
    ambientSounds,
    soundEffectsConfig,
    playlists,
    soundEnabled
} from './config.js';
import { showNotification } from './ui.js';
import { playSoundEffect, createSimpleBeep, playCelebrationSound } from './utils.js';

// Initialize Music & Sound Features
export function initMusicAndSound() {
    const musicModal = document.getElementById('musicModal');
    const musicModalClose = document.getElementById('musicModalClose');
    const musicTabs = document.querySelectorAll('.music-tab');
    const musicPanels = document.querySelectorAll('.music-panel');
    
    const toggleMusicBtn = document.getElementById('toggleMusic');
    if (toggleMusicBtn) {
        toggleMusicBtn.addEventListener('click', () => {
            if (musicModal) musicModal.classList.add('show');
        });
    }
    
    if (musicModalClose) {
        musicModalClose.addEventListener('click', () => {
            if (musicModal) musicModal.classList.remove('show');
        });
    }
    
    musicTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            musicTabs.forEach(t => t.classList.remove('active'));
            musicPanels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const panel = document.getElementById(`${targetTab}-panel`);
            if (panel) panel.classList.add('active');
        });
    });
    
    initBackgroundMusic();
    initAmbientSounds();
    initWhiteNoise();
    initSoundEffects();
    loadCustomTracks();
    updateMusicBadge();
}

// Background Music Player
function initBackgroundMusic() {
    const playlistCards = document.querySelectorAll('.playlist-card');
    const playPauseBtn = document.getElementById('playPauseMusic');
    const prevTrackBtn = document.getElementById('prevTrack');
    const nextTrackBtn = document.getElementById('nextTrack');
    const musicVolumeSlider = document.getElementById('musicVolume');
    const musicVolumeValue = document.getElementById('musicVolumeValue');
    const currentTrackTitle = document.getElementById('currentTrackTitle');
    const currentTrackType = document.getElementById('currentTrackType');
    const uploadPlaylistBtn = document.getElementById('uploadPlaylistBtn');
    const playlistFileInput = document.getElementById('playlistFileInput');
    
    playlistCards.forEach(card => {
        card.addEventListener('click', () => {
            const playlistId = card.getAttribute('data-playlist');
            
            playlistCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            loadPlaylist(playlistId);
        });
    });
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            toggleMusicPlayback();
        });
    }
    
    if (prevTrackBtn) {
        prevTrackBtn.addEventListener('click', () => {
            playPreviousTrack();
        });
    }
    
    if (nextTrackBtn) {
        nextTrackBtn.addEventListener('click', () => {
            playNextTrack();
        });
    }
    
    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            musicState.volume = volume;
            if (musicVolumeValue) musicVolumeValue.textContent = `${volume}%`;
            if (musicState.currentAudio) {
                musicState.currentAudio.volume = volume / 100;
            }
            localStorage.setItem('musicVolume', volume);
        });
        
        const savedVolume = localStorage.getItem('musicVolume');
        if (savedVolume) {
            musicVolumeSlider.value = savedVolume;
            musicState.volume = savedVolume;
            if (musicVolumeValue) musicVolumeValue.textContent = `${savedVolume}%`;
        }
    }
    
    if (uploadPlaylistBtn) {
        uploadPlaylistBtn.addEventListener('click', () => {
            if (playlistFileInput) playlistFileInput.click();
        });
    }
    
    if (playlistFileInput) {
        playlistFileInput.addEventListener('change', (e) => {
            handlePlaylistUpload(e.target.files);
        });
    }
}

function loadPlaylist(playlistId) {
    if (!playlists[playlistId]) return;
    
    musicState.currentPlaylist = playlists[playlistId];
    musicState.currentTrackIndex = 0;
    
    updateCurrentTrackDisplay();
    
    if (musicState.currentAudio) {
        musicState.currentAudio.pause();
        musicState.currentAudio = null;
    }
    
    playCurrentTrack();
}

function playCurrentTrack() {
    if (!musicState.currentPlaylist) return;
    
    const playlist = musicState.currentPlaylist;
    const track = playlist.tracks[musicState.currentTrackIndex];
    
    if (!track) return;
    
    if (musicState.currentAudio) {
        musicState.currentAudio.pause();
    }
    
    const audio = new Audio(track.url);
    audio.volume = musicState.volume / 100;
    audio.loop = false;
    
    audio.addEventListener('ended', () => {
        playNextTrack();
    });
    
    audio.play().catch(err => {
        console.log('Audio play failed:', err);
        showNotification('Tidak dapat memutar musik. Silakan upload file musik sendiri.', 'warning');
    });
    
    musicState.currentAudio = audio;
    musicState.isPlaying = true;
    updatePlayButton();
    updateCurrentTrackDisplay();
}

function toggleMusicPlayback() {
    if (!musicState.currentAudio) {
        if (musicState.currentPlaylist) {
            playCurrentTrack();
        } else {
            showNotification('Pilih playlist terlebih dahulu!', 'warning');
        }
        return;
    }
    
    if (musicState.isPlaying) {
        musicState.currentAudio.pause();
        musicState.isPlaying = false;
    } else {
        musicState.currentAudio.play();
        musicState.isPlaying = true;
    }
    updatePlayButton();
}

function playPreviousTrack() {
    if (!musicState.currentPlaylist) return;
    
    musicState.currentTrackIndex--;
    if (musicState.currentTrackIndex < 0) {
        musicState.currentTrackIndex = musicState.currentPlaylist.tracks.length - 1;
    }
    playCurrentTrack();
}

function playNextTrack() {
    if (!musicState.currentPlaylist) return;
    
    musicState.currentTrackIndex++;
    if (musicState.currentTrackIndex >= musicState.currentPlaylist.tracks.length) {
        musicState.currentTrackIndex = 0;
    }
    playCurrentTrack();
}

function updatePlayButton() {
    const playPauseBtn = document.getElementById('playPauseMusic');
    if (!playPauseBtn) return;
    
    const icon = playPauseBtn.querySelector('i');
    if (icon) {
        if (musicState.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }
}

function updateCurrentTrackDisplay() {
    const currentTrackTitle = document.getElementById('currentTrackTitle');
    const currentTrackType = document.getElementById('currentTrackType');
    
    if (!musicState.currentPlaylist) {
        if (currentTrackTitle) currentTrackTitle.textContent = 'Pilih lagu...';
        if (currentTrackType) currentTrackType.textContent = '-';
        return;
    }
    
    const track = musicState.currentPlaylist.tracks[musicState.currentTrackIndex];
    if (currentTrackTitle) currentTrackTitle.textContent = track.name;
    if (currentTrackType) currentTrackType.textContent = musicState.currentPlaylist.type;
}

function handlePlaylistUpload(files) {
    const customTracks = [];
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            customTracks.push({
                name: file.name.replace(/\.[^/.]+$/, ''),
                url: url,
                file: file
            });
        }
    });
    
    musicState.customTracks = [...musicState.customTracks, ...customTracks];
    localStorage.setItem('customTracks', JSON.stringify(musicState.customTracks.map(t => ({ name: t.name, url: t.url }))));
    
    renderCustomTracks();
    showNotification(`${customTracks.length} file musik berhasil ditambahkan!`, 'success');
}

function renderCustomTracks() {
    const customTracksList = document.getElementById('customTracksList');
    if (!customTracksList) return;
    
    customTracksList.innerHTML = '';
    
    musicState.customTracks.forEach((track, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = 'custom-track-item';
        trackItem.innerHTML = `
            <div class="track-item-info">
                <div class="track-item-name">${track.name}</div>
            </div>
            <div class="track-item-actions">
                <button class="track-action-btn" data-index="${index}">
                    <i class="fas fa-play"></i>
                </button>
                <button class="track-action-btn delete-track" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        const playBtn = trackItem.querySelector('.track-action-btn:not(.delete-track)');
        const deleteBtn = trackItem.querySelector('.delete-track');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => playCustomTrack(index));
        }
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteCustomTrack(index));
        }
        
        customTracksList.appendChild(trackItem);
    });
}

function playCustomTrack(index) {
    const track = musicState.customTracks[index];
    if (!track) return;
    
    if (musicState.currentAudio) {
        musicState.currentAudio.pause();
    }
    
    const audio = new Audio(track.url);
    audio.volume = musicState.volume / 100;
    
    audio.addEventListener('ended', () => {
        musicState.isPlaying = false;
        updatePlayButton();
    });
    
    audio.play().catch(err => {
        console.log('Audio play failed:', err);
        showNotification('Tidak dapat memutar file ini.', 'warning');
    });
    
    musicState.currentAudio = audio;
    musicState.isPlaying = true;
    musicState.currentPlaylist = { name: 'Custom', type: 'Custom', tracks: [track] };
    musicState.currentTrackIndex = 0;
    
    updatePlayButton();
    updateCurrentTrackDisplay();
}

function deleteCustomTrack(index) {
    musicState.customTracks.splice(index, 1);
    localStorage.setItem('customTracks', JSON.stringify(musicState.customTracks.map(t => ({ name: t.name, url: t.url }))));
    renderCustomTracks();
    showNotification('File musik dihapus!', 'success');
}

function loadCustomTracks() {
    renderCustomTracks();
}

// Ambient Sounds
function initAmbientSounds() {
    const soundCards = document.querySelectorAll('.ambient-sound-card');
    
    soundCards.forEach(card => {
        const soundId = card.getAttribute('data-sound');
        const toggleBtn = card.querySelector('.sound-toggle-btn');
        const volumeSlider = card.querySelector('.sound-volume');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                toggleAmbientSound(soundId, card, toggleBtn);
            });
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                if (ambientSounds[soundId]) {
                    ambientSounds[soundId].volume = volume;
                }
            });
        }
    });
}

function toggleAmbientSound(soundId, card, toggleBtn) {
    if (ambientSounds[soundId]) {
        ambientSounds[soundId].pause();
        ambientSounds[soundId] = null;
        card.classList.remove('playing');
        toggleBtn.classList.remove('playing');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-play';
    } else {
        const audio = generateAmbientSound(soundId);
        audio.loop = true;
        const volumeSlider = card.querySelector('.sound-volume');
        audio.volume = volumeSlider ? volumeSlider.value / 100 : 0.5;
        audio.play().catch(err => {
            console.log('Ambient sound play failed:', err);
        });
        
        ambientSounds[soundId] = audio;
        card.classList.add('playing');
        toggleBtn.classList.add('playing');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
    }
}

function generateAmbientSound(type) {
    const audio = new Audio();
    
    const soundUrls = {
        rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        cafe: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        ocean: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        fire: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        city: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    };
    
    audio.src = soundUrls[type] || soundUrls.rain;
    return audio;
}

// White Noise Generator
function initWhiteNoise() {
    const noiseToggleBtn = document.getElementById('noiseToggleBtn');
    const noiseTypeSelect = document.getElementById('noiseType');
    const noiseVolumeSlider = document.getElementById('noiseVolume');
    const noiseVolumeValue = document.getElementById('noiseVolumeValue');
    
    try {
        if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    } catch (e) {
        console.log('Web Audio API not supported');
    }
    
    if (noiseToggleBtn) {
        noiseToggleBtn.addEventListener('click', () => {
            toggleWhiteNoise();
        });
    }
    
    if (noiseTypeSelect) {
        noiseTypeSelect.addEventListener('change', () => {
            if (window.whiteNoise) {
                stopWhiteNoise();
                setTimeout(() => toggleWhiteNoise(), 100);
            }
        });
    }
    
    if (noiseVolumeSlider) {
        noiseVolumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            if (noiseVolumeValue) noiseVolumeValue.textContent = `${volume}%`;
            if (window.whiteNoiseNode) {
                window.whiteNoiseNode.gain.value = volume / 100;
            }
        });
    }
}

function toggleWhiteNoise() {
    if (window.whiteNoise) {
        stopWhiteNoise();
    } else {
        startWhiteNoise();
    }
}

function startWhiteNoise() {
    const audioCtx = window.audioContext;
    if (!audioCtx) {
        showNotification('Web Audio API tidak didukung di browser ini.', 'warning');
        return;
    }
    
    const noiseTypeSelect = document.getElementById('noiseType');
    const noiseVolumeSlider = document.getElementById('noiseVolume');
    const noiseToggleBtn = document.getElementById('noiseToggleBtn');
    
    const noiseType = noiseTypeSelect ? noiseTypeSelect.value : 'white';
    const volume = noiseVolumeSlider ? noiseVolumeSlider.value / 100 : 0.5;
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        let value;
        switch (noiseType) {
            case 'white':
                value = Math.random() * 2 - 1;
                break;
            case 'pink':
                value = (Math.random() * 2 - 1) * 0.5;
                break;
            case 'brown':
                value = (Math.random() * 2 - 1) * 0.3;
                break;
            default:
                value = Math.random() * 2 - 1;
        }
        data[i] = value;
    }
    
    const source = audioCtx.createBufferSource();
    const gainNode = audioCtx.createGain();
    
    source.buffer = buffer;
    source.loop = true;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    source.start();
    
    window.whiteNoise = source;
    window.whiteNoiseNode = gainNode;
    
    if (noiseToggleBtn) {
        noiseToggleBtn.classList.add('playing');
        const span = noiseToggleBtn.querySelector('span');
        const icon = noiseToggleBtn.querySelector('i');
        if (span) span.textContent = 'Hentikan White Noise';
        if (icon) icon.className = 'fas fa-stop';
    }
}

function stopWhiteNoise() {
    if (window.whiteNoise) {
        window.whiteNoise.stop();
        window.whiteNoise = null;
        window.whiteNoiseNode = null;
    }
    
    const noiseToggleBtn = document.getElementById('noiseToggleBtn');
    if (noiseToggleBtn) {
        noiseToggleBtn.classList.remove('playing');
        const span = noiseToggleBtn.querySelector('span');
        const icon = noiseToggleBtn.querySelector('i');
        if (span) span.textContent = 'Mulai White Noise';
        if (icon) icon.className = 'fas fa-play';
    }
}

// Sound Effects
function initSoundEffects() {
    const enableSoundEffects = document.getElementById('enableSoundEffects');
    const testEffectBtns = document.querySelectorAll('.test-effect-btn');
    const effectSelects = document.querySelectorAll('.effect-select');
    
    if (enableSoundEffects) {
        enableSoundEffects.checked = JSON.parse(localStorage.getItem('soundEffectsEnabled') || 'true');
        
        enableSoundEffects.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('soundEffectsEnabled', enabled);
        });
    }
    
    effectSelects.forEach(select => {
        const effectType = select.getAttribute('data-effect');
        select.value = soundEffectsConfig[effectType] || select.options[0].value;
        
        select.addEventListener('change', (e) => {
            soundEffectsConfig[effectType] = e.target.value;
            localStorage.setItem('soundEffectsConfig', JSON.stringify(soundEffectsConfig));
        });
    });
    
    testEffectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const effectType = btn.getAttribute('data-effect');
            playSoundEffect(effectType);
        });
    });
}

export function updateMusicBadge() {
    const musicBadge = document.getElementById('musicBadge');
    if (musicBadge && musicState.isPlaying) {
        musicBadge.classList.add('active');
        musicBadge.textContent = '♪';
    } else if (musicBadge) {
        musicBadge.classList.remove('active');
    }
}

// Update music badge periodically
setInterval(updateMusicBadge, 1000);

