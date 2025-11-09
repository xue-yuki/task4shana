// ============================================
// MESSAGE TO ELL FORM - WEB3FORMS INTEGRATION
// ============================================

import { WEB3FORMS_ACCESS_KEY, soundEnabled } from './config.js';
import { showNotification } from './ui.js';
import { playSoundEffect, createFloatingHeart } from './utils.js';

export function initMessageToEllForm() {
    const messageForm = document.getElementById('messageEllForm');
    const messageSubject = document.getElementById('messageSubject');
    const messageContent = document.getElementById('messageContent');
    const charCount = document.getElementById('charCount');
    const clearMessageBtn = document.getElementById('clearMessageBtn');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const messageSuccess = document.getElementById('messageSuccess');
    
    if (!messageForm) return;
    
    if (messageContent && charCount) {
        messageContent.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = length;
            
            if (length > 900) {
                charCount.style.color = 'var(--danger)';
            } else if (length > 800) {
                charCount.style.color = 'var(--warning)';
            } else {
                charCount.style.color = 'var(--accent)';
            }
            
            if (length > 1000) {
                this.value = this.value.substring(0, 1000);
                charCount.textContent = 1000;
            }
        });
    }
    
    if (clearMessageBtn) {
        clearMessageBtn.addEventListener('click', function() {
            if (messageSubject) messageSubject.value = '';
            if (messageContent) {
                messageContent.value = '';
                if (charCount) charCount.textContent = '0';
            }
            
            const defaultMood = document.getElementById('mood-happy');
            if (defaultMood) defaultMood.checked = true;
            
            if (messageSuccess) messageSuccess.style.display = 'none';
            if (messageForm) messageForm.style.display = 'flex';
            
            if (soundEnabled) {
                playSoundEffect('click');
            }
        });
    }
    
    if (messageForm) {
        messageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const subject = messageSubject?.value.trim() || '';
            const content = messageContent?.value.trim() || '';
            const moodRadio = document.querySelector('input[name="mood"]:checked');
            const mood = moodRadio?.value || '😊 Happy';
            
            if (!subject || !content) {
                showNotification('Mohon isi semua field yang wajib!', 'error');
                return;
            }
            
            if (content.length < 10) {
                showNotification('Pesan terlalu pendek. Minimal 10 karakter!', 'error');
                return;
            }
            
            if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === '' || WEB3FORMS_ACCESS_KEY === '2e13140b-70bd-44b7-a587-af1b3c731bc1                      ') {
                showNotification('⚠️ Web3Forms Access Key belum diatur! Silakan set di config.js', 'warning');
                console.error('Web3Forms Access Key belum diatur. Dapatkan di: https://web3forms.com/');
                return;
            }
            
            if (sendMessageBtn) {
                sendMessageBtn.disabled = true;
                const btnText = sendMessageBtn.querySelector('.btn-text');
                const btnLoading = sendMessageBtn.querySelector('.btn-loading');
                if (btnText) btnText.style.display = 'none';
                if (btnLoading) btnLoading.style.display = 'flex';
            }
            
            try {
                const formData = {
                    access_key: WEB3FORMS_ACCESS_KEY,
                    subject: `💕 Pesan dari Shana: ${subject}`,
                    message: `Mood: ${mood}\n\nSubjek: ${subject}\n\nPesan:\n${content}\n\n---\nDikirim dari Task4Shana App 💖`,
                    from_name: 'Shana - Task4Shana',
                };
                
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    let errorText;
                    try {
                        errorText = await response.text();
                    } catch (e) {
                        errorText = 'Unknown error';
                    }
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                let result;
                try {
                    const responseText = await response.text();
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error('Invalid response from server');
                }
                
                if (result.success) {
                    if (messageForm) messageForm.style.display = 'none';
                    if (messageSuccess) messageSuccess.style.display = 'block';
                    
                    if (soundEnabled) {
                        playSoundEffect('success');
                    }
                    
                    showNotification('Pesan berhasil dikirim ke Ell! 💕', 'success');
                    
                    if (messageSuccess) {
                        messageSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    
                    setTimeout(() => {
                        if (messageSubject) messageSubject.value = '';
                        if (messageContent) {
                            messageContent.value = '';
                            if (charCount) charCount.textContent = '0';
                        }
                        const defaultMood = document.getElementById('mood-happy');
                        if (defaultMood) defaultMood.checked = true;
                        if (messageSuccess) messageSuccess.style.display = 'none';
                        if (messageForm) messageForm.style.display = 'flex';
                    }, 5000);
                } else {
                    const errorMsg = result.message || result.error || 'Failed to send message';
                    showNotification(`Gagal mengirim: ${errorMsg}`, 'error');
                    throw new Error(errorMsg);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                const errorMessage = error.message || 'Gagal mengirim pesan. Silakan coba lagi nanti.';
                showNotification(errorMessage, 'error');
            } finally {
                if (sendMessageBtn) {
                    sendMessageBtn.disabled = false;
                    const btnText = sendMessageBtn.querySelector('.btn-text');
                    const btnLoading = sendMessageBtn.querySelector('.btn-loading');
                    if (btnText) btnText.style.display = 'flex';
                    if (btnLoading) btnLoading.style.display = 'none';
                }
            }
        });
    }
    
    if (messageContent) {
        let typingTimeout;
        messageContent.addEventListener('input', function() {
            clearTimeout(typingTimeout);
            
            if (this.value.length % 10 === 0 && this.value.length > 0) {
                createFloatingHeart(this);
            }
            
            typingTimeout = setTimeout(() => {
                // Stop effects after 2 seconds of no typing
            }, 2000);
        });
    }
}

