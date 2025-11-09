// ============================================
// ENHANCED INTERACTIVE DROPDOWNS
// ============================================

import { soundEnabled } from './config.js';
import { playSoundEffect } from './utils.js';

function wrapSelects() {
    const allSelects = document.querySelectorAll('select:not(.wrapped)');
    
    allSelects.forEach(select => {
        select.classList.add('wrapped');
        
        const wrapper = document.createElement('div');
        wrapper.className = 'select-wrapper-interactive';
        
        const parentStyle = window.getComputedStyle(select.parentElement);
        const parentDisplay = parentStyle.display;
        
        if (parentDisplay === 'flex') {
            wrapper.style.cssText = 'position: relative; flex: 1; width: 100%;';
        } else {
            wrapper.style.cssText = 'position: relative; display: inline-block; width: 100%;';
        }
        
        const glow = document.createElement('div');
        glow.className = 'select-glow';
        glow.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, rgba(5, 255, 161, 0.15), rgba(1, 205, 254, 0.1));
            border-radius: inherit;
            opacity: 0;
            z-index: -1;
            filter: blur(8px);
            transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        `;
        
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        wrapper.appendChild(glow);
        
        wrapper.addEventListener('mouseenter', function() {
            glow.style.opacity = '0.15';
        });
        
        wrapper.addEventListener('mouseleave', function() {
            glow.style.opacity = '0';
        });
        
        select.addEventListener('focus', function() {
            glow.style.opacity = '0.25';
            if (soundEnabled) {
                setTimeout(() => playSoundEffect('click'), 50);
            }
        });
        
        select.addEventListener('blur', function() {
            glow.style.opacity = '0';
        });
    });
}

export function initInteractiveDropdowns() {
    wrapSelects();
    
    const allSelects = document.querySelectorAll('select');
    
    allSelects.forEach(select => {
        select.addEventListener('change', function() {
            if (soundEnabled) {
                playSoundEffect('click');
            }
            
            const wrapper = this.closest('.select-wrapper-interactive');
            if (wrapper) {
                const glow = wrapper.querySelector('.select-glow');
                if (glow) {
                    glow.style.opacity = '0.3';
                    setTimeout(() => {
                        glow.style.opacity = '0';
                    }, 300);
                }
            }
        });
        
        select.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.97)';
        });
        
        select.addEventListener('mouseup', function() {
            if (this === document.activeElement) {
                this.style.transform = 'scale(1.03) translateY(-2px)';
            } else {
                this.style.transform = '';
            }
        });
    });
}

export function addDropdownAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        .select-wrapper-interactive {
            width: 100%;
        }
        
        .select-wrapper-interactive select {
            width: 100%;
        }
        
        .select-glow {
            border-radius: inherit;
        }
        
        select {
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
    `;
    document.head.appendChild(style);
}

