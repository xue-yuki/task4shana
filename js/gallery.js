// ============================================
// PHOTO GALLERY COMPONENT
// ============================================

import { showNotification } from './ui.js';
import { createFloatingHeart } from './utils.js';

export function initPhotoGallery() {
    const galleryCarousel = document.getElementById('galleryCarousel');
    const galleryIndicators = document.getElementById('galleryIndicators');
    const galleryPrev = document.getElementById('galleryPrev');
    const galleryNext = document.getElementById('galleryNext');
    const photoTitle = document.getElementById('photoTitle');
    const photoDate = document.getElementById('photoDate');
    const photoDescription = document.getElementById('photoDescription');
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    const editPhotoBtn = document.getElementById('editPhotoBtn');
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    const photoModal = document.getElementById('photoModal');
    const photoModalClose = document.getElementById('photoModalClose');
    const photoModalTitle = document.getElementById('photoModalTitle');
    const photoPreview = document.getElementById('photoPreview');
    const photoInput = document.getElementById('photoInput');
    const photoTitleInput = document.getElementById('photoTitleInput');
    const photoDescriptionInput = document.getElementById('photoDescriptionInput');
    const savePhotoBtn = document.getElementById('savePhotoBtn');
    const viewPhotoModal = document.getElementById('viewPhotoModal');
    const viewPhotoModalClose = document.getElementById('viewPhotoModalClose');
    const largePhotoContainer = document.getElementById('largePhotoContainer');
    const largePhotoTitle = document.getElementById('largePhotoTitle');
    const largePhotoDate = document.getElementById('largePhotoDate');
    const largePhotoDesc = document.getElementById('largePhotoDesc');
    
    let photos = JSON.parse(localStorage.getItem('galleryPhotos')) || [];
    let currentPhotoIndex = 0;
    let editingPhotoIndex = -1;
    
    function updateCarousel() {
        if (photos.length === 0) {
            if (galleryCarousel) {
                galleryCarousel.innerHTML = `
                    <div class="carousel-item active">
                        <div class="gallery-placeholder">
                            <i class="fas fa-image"></i>
                            <p>Belum ada foto</p>
                        </div>
                    </div>
                `;
            }
            if (galleryIndicators) galleryIndicators.innerHTML = '';
            if (photoTitle) photoTitle.textContent = 'Galeri Kenangan';
            if (photoDate) photoDate.textContent = '';
            if (photoDescription) photoDescription.textContent = '';
            if (editPhotoBtn) editPhotoBtn.style.display = 'none';
            if (deletePhotoBtn) deletePhotoBtn.style.display = 'none';
            return;
        }
        
        if (editPhotoBtn) editPhotoBtn.style.display = 'flex';
        if (deletePhotoBtn) deletePhotoBtn.style.display = 'flex';
        
        if (galleryCarousel) galleryCarousel.innerHTML = '';
        if (galleryIndicators) galleryIndicators.innerHTML = '';
        
        photos.forEach((photo, index) => {
            if (galleryCarousel) {
                const item = document.createElement('div');
                item.className = 'carousel-item';
                if (index === currentPhotoIndex) item.classList.add('active');
                item.innerHTML = `<img src="${photo.dataUrl}" alt="${photo.title}">`;
                item.querySelector('img').addEventListener('click', () => {
                    showLargePhoto(index);
                });
                galleryCarousel.appendChild(item);
            }
            
            if (galleryIndicators) {
                const indicator = document.createElement('div');
                indicator.className = 'indicator';
                if (index === currentPhotoIndex) indicator.classList.add('active');
                indicator.addEventListener('click', () => {
                    goToSlide(index);
                });
                galleryIndicators.appendChild(indicator);
            }
        });
        
        updatePhotoDetails();
    }
    
    function updatePhotoDetails() {
        if (photos.length === 0) return;
        
        const currentPhoto = photos[currentPhotoIndex];
        if (photoTitle) photoTitle.textContent = currentPhoto.title;
        
        if (photoDate && currentPhoto.date) {
            const date = new Date(currentPhoto.date);
            photoDate.textContent = date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        } else if (photoDate) {
            photoDate.textContent = '';
        }
        
        if (photoDescription) photoDescription.textContent = currentPhoto.description || '';
    }
    
    function goToSlide(index) {
        if (index < 0) index = photos.length - 1;
        if (index >= photos.length) index = 0;
        
        currentPhotoIndex = index;
        
        if (galleryCarousel) {
            const items = galleryCarousel.querySelectorAll('.carousel-item');
            items.forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });
        }
        
        if (galleryIndicators) {
            const indicators = galleryIndicators.querySelectorAll('.indicator');
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        }
        
        updatePhotoDetails();
    }
    
    function goToPrevSlide() {
        goToSlide(currentPhotoIndex - 1);
    }
    
    function goToNextSlide() {
        goToSlide(currentPhotoIndex + 1);
    }
    
    function showLargePhoto(index) {
        if (photos.length === 0 || index < 0 || index >= photos.length) return;
        
        const photo = photos[index];
        
        if (largePhotoContainer) {
            largePhotoContainer.innerHTML = `<img src="${photo.dataUrl}" alt="${photo.title}">`;
        }
        if (largePhotoTitle) largePhotoTitle.textContent = photo.title;
        
        if (largePhotoDate && photo.date) {
            const date = new Date(photo.date);
            largePhotoDate.textContent = date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        } else if (largePhotoDate) {
            largePhotoDate.textContent = '';
        }
        
        if (largePhotoDesc) largePhotoDesc.textContent = photo.description || '';
        
        if (viewPhotoModal) viewPhotoModal.classList.add('show');
    }
    
    function openAddPhotoModal() {
        if (!photoModal || !photoModalTitle || !photoPreview || !photoTitleInput || !photoDescriptionInput) return;
        
        photoModalTitle.textContent = 'Tambah Foto Baru';
        photoPreview.innerHTML = `
            <div class="photo-placeholder">
                <i class="fas fa-image"></i>
                <p>Pratinjau Foto</p>
            </div>
        `;
        photoTitleInput.value = '';
        photoDescriptionInput.value = '';
        editingPhotoIndex = -1;
        photoModal.classList.add('show');
    }
    
    function openEditPhotoModal() {
        if (photos.length === 0 || !photoModal || !photoModalTitle || !photoPreview || !photoTitleInput || !photoDescriptionInput) return;
        
        const photo = photos[currentPhotoIndex];
        photoModalTitle.textContent = 'Edit Foto';
        photoPreview.innerHTML = `<img src="${photo.dataUrl}" alt="${photo.title}">`;
        photoTitleInput.value = photo.title;
        photoDescriptionInput.value = photo.description || '';
        editingPhotoIndex = currentPhotoIndex;
        photoModal.classList.add('show');
    }
    
    function confirmDeletePhoto() {
        if (photos.length === 0) return;
        
        if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
            deletePhoto();
        }
    }
    
    function deletePhoto() {
        if (photos.length === 0 || currentPhotoIndex < 0 || currentPhotoIndex >= photos.length) return;
        
        photos.splice(currentPhotoIndex, 1);
        localStorage.setItem('galleryPhotos', JSON.stringify(photos));
        
        if (currentPhotoIndex >= photos.length) {
            currentPhotoIndex = Math.max(0, photos.length - 1);
        }
        
        updateCarousel();
        showNotification('Foto berhasil dihapus!', 'info');
    }
    
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('Silakan pilih file gambar yang valid.');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimum 2MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (photoPreview) {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                photoPreview.dataset.dataUrl = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
    
    function savePhoto() {
        if (!photoTitleInput || !photoDescriptionInput) return;
        
        const title = photoTitleInput.value.trim();
        const description = photoDescriptionInput.value.trim();
        
        if (!title) {
            alert('Silakan masukkan judul foto.');
            return;
        }
        
        if (editingPhotoIndex >= 0 && editingPhotoIndex < photos.length) {
            photos[editingPhotoIndex].title = title;
            photos[editingPhotoIndex].description = description;
            localStorage.setItem('galleryPhotos', JSON.stringify(photos));
            updateCarousel();
            if (photoModal) photoModal.classList.remove('show');
            showNotification('Foto berhasil diperbarui!', 'success');
            return;
        }
        
        if (!photoPreview || !photoPreview.dataset.dataUrl) {
            alert('Silakan pilih foto terlebih dahulu.');
            return;
        }
        
        const newPhoto = {
            id: Date.now(),
            title: title,
            description: description,
            dataUrl: photoPreview.dataset.dataUrl,
            date: new Date().toISOString()
        };
        
        photos.push(newPhoto);
        localStorage.setItem('galleryPhotos', JSON.stringify(photos));
        
        currentPhotoIndex = photos.length - 1;
        updateCarousel();
        
        if (photoModal) photoModal.classList.remove('show');
        showNotification('Foto berhasil ditambahkan!', 'success');
    }
    
    if (galleryPrev) galleryPrev.addEventListener('click', goToPrevSlide);
    if (galleryNext) galleryNext.addEventListener('click', goToNextSlide);
    if (addPhotoBtn) addPhotoBtn.addEventListener('click', openAddPhotoModal);
    if (editPhotoBtn) editPhotoBtn.addEventListener('click', openEditPhotoModal);
    if (deletePhotoBtn) deletePhotoBtn.addEventListener('click', confirmDeletePhoto);
    if (photoModalClose) photoModalClose.addEventListener('click', () => {
        if (photoModal) photoModal.classList.remove('show');
    });
    if (viewPhotoModalClose) viewPhotoModalClose.addEventListener('click', () => {
        if (viewPhotoModal) viewPhotoModal.classList.remove('show');
    });
    if (photoInput) photoInput.addEventListener('change', handleFileSelect);
    if (savePhotoBtn) savePhotoBtn.addEventListener('click', savePhoto);
    
    document.addEventListener('keydown', function(e) {
        if (viewPhotoModal && viewPhotoModal.classList.contains('show')) {
            if (e.key === 'ArrowLeft') {
                goToPrevSlide();
                showLargePhoto(currentPhotoIndex);
            } else if (e.key === 'ArrowRight') {
                goToNextSlide();
                showLargePhoto(currentPhotoIndex);
            } else if (e.key === 'Escape') {
                viewPhotoModal.classList.remove('show');
            }
        }
    });
    
    updateCarousel();
}

