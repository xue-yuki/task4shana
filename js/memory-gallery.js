export function initMemoryGallery() {
    const openGoogleDriveBtn = document.getElementById('openGoogleDriveBtn');
    const memoryGalleryContainer = document.getElementById('memoryGalleryContainer');
    
    if (!openGoogleDriveBtn || !memoryGalleryContainer) return;
    
    const googleDriveLink = 'https://drive.google.com/drive/folders/folders/1WjPcGD6t6o0X_NXgYX-BZGkqxhiR3UbU'; // GANTI DENGAN LINK GOOGLE DRIVE
    
    // Event listener untuk tombol buka Google Drive
    openGoogleDriveBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Mencegah event bubbling
        window.open(googleDriveLink, '_blank');
    });
    
    // Event listener untuk klik di container (seluruh area bisa diklik)
    memoryGalleryContainer.addEventListener('click', (e) => {
        // Jika yang diklik bukan tombol, tetap buka Google Drive
        if (!e.target.closest('.memory-upload-btn')) {
            window.open(googleDriveLink, '_blank');
        }
    });
    
    // Tambahkan efek pointer pada container
    memoryGalleryContainer.style.cursor = 'pointer';
}

