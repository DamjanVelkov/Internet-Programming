// Image Gallery JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Gallery state and elements
    let currentImageIndex = 0;
    let images = [];
    let filteredImages = [];
    let isModalOpen = false;
    
    // DOM elements
    const gallery = document.getElementById('image-gallery');
    const modal = document.getElementById('image-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const imageCounter = document.getElementById('image-counter');
    const imageName = document.getElementById('image-name');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const gridViewBtn = document.getElementById('grid-view');
    const listViewBtn = document.getElementById('list-view');
    const closeModalBtn = document.getElementById('close-modal');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const infoBtn = document.getElementById('info-btn');
    
    // Image data (based on the files in the images folder)
    const imageData = [
        {
            filename: 'advanced-stupid.jpg',
            title: 'Advanced Stupid',
            description: 'A humorous meme image'
        },
        {
            filename: 'austr-aliens.jpg',
            title: 'Austrian Aliens',
            description: 'Extraterrestrial visitors from Austria'
        },
        {
            filename: 'beer-good.jpg',
            title: 'Beer Good',
            description: 'The universal truth about beer'
        },
        {
            filename: 'big-hart-small-johnson.png',
            title: 'Big Hart Small Johnson',
            description: 'A funny comparison meme'
        },
        {
            filename: 'boom-boom-boom.jpg',
            title: 'Boom Boom Boom',
            description: 'Explosive reactions'
        },
        {
            filename: 'both-wrong.jpg',
            title: 'Both Wrong',
            description: 'When everyone is incorrect'
        },
        {
            filename: 'burned-area.jpeg',
            title: 'Burned Area',
            description: 'A scorched landscape or situation'
        },
        {
            filename: 'cannot-brain.jpg',
            title: 'Cannot Brain',
            description: 'When thinking becomes impossible'
        },
        {
            filename: 'de-jovanke-medalja.jpg',
            title: 'De Jovanke Medalja',
            description: 'A special medal or achievement'
        },
        {
            filename: 'elektronski-bonove.jpg',
            title: 'Elektronski Bonove',
            description: 'Electronic vouchers or tickets'
        },
        {
            filename: 'HaHaHaNo.jpg',
            title: 'Ha Ha Ha No',
            description: 'A definitive rejection with humor'
        },
        {
            filename: 'HowAboutNo.jpg',
            title: 'How About No',
            description: 'Another way to say absolutely not'
        }
    ];
    
    // Initialize gallery
    function initGallery() {
        images = [...imageData];
        filteredImages = [...images];
        loadImages();
        setupEventListeners();
        
        // Hide loading and show gallery
        setTimeout(() => {
            loading.classList.add('hidden');
            gallery.classList.add('loaded');
        }, 1000);
    }
    
    // Load images into gallery
    function loadImages() {
        gallery.innerHTML = '';
        
        filteredImages.forEach((image, index) => {
            const galleryItem = createGalleryItem(image, index);
            gallery.appendChild(galleryItem);
        });
        
        // Add stagger animation delay
        const items = gallery.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    // Create gallery item element
    function createGalleryItem(image, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-index', index);
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View ${image.title} in full size`);
        
        item.innerHTML = `
            <img src="images/${image.filename}" alt="${image.title}" loading="lazy">
            <div class="overlay">
                <h3>${image.title}</h3>
                <p>Click to view larger</p>
            </div>
            <div class="info">
                <h3>${image.title}</h3>
                <p>${image.description}</p>
            </div>
        `;
        
        return item;
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Gallery item clicks
        gallery.addEventListener('click', handleImageClick);
        gallery.addEventListener('keydown', handleImageKeydown);
        
        // Modal controls
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        prevBtn.addEventListener('click', showPreviousImage);
        nextBtn.addEventListener('click', showNextImage);
        
        // View toggle buttons
        gridViewBtn.addEventListener('click', () => setView('grid'));
        listViewBtn.addEventListener('click', () => setView('list'));
        
        // Search functionality
        searchInput.addEventListener('input', handleSearch);
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Action buttons
        downloadBtn.addEventListener('click', downloadImage);
        shareBtn.addEventListener('click', shareImage);
        infoBtn.addEventListener('click', showImageInfo);
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
        
        // Prevent modal close when clicking inside modal content
        modal.querySelector('.modal-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Handle image click
    function handleImageClick(e) {
        const galleryItem = e.target.closest('.gallery-item');
        if (galleryItem) {
            const index = parseInt(galleryItem.dataset.index);
            openModal(index);
        }
    }
    
    // Handle keyboard navigation on gallery items
    function handleImageKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const index = parseInt(galleryItem.dataset.index);
                openModal(index);
            }
        }
    }
    
    // Open modal with specific image
    function openModal(index) {
        currentImageIndex = index;
        const image = filteredImages[index];
        
        if (!image) return;
        
        // Update modal content
        modalImage.src = `images/${image.filename}`;
        modalImage.alt = image.title;
        modalTitle.textContent = image.title;
        imageName.textContent = image.filename;
        imageCounter.textContent = `${index + 1} of ${filteredImages.length}`;
        
        // Show modal
        modal.classList.add('active');
        modalOverlay.classList.add('active');
        isModalOpen = true;
        
        // Disable body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus on modal for keyboard navigation
        modal.focus();
        
        // Update navigation buttons
        updateNavigationButtons();
    }
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        modalOverlay.classList.remove('active');
        isModalOpen = false;
        
        // Re-enable body scroll
        document.body.style.overflow = '';
        
        // Return focus to the gallery item that was clicked
        const currentItem = gallery.querySelector(`[data-index="${currentImageIndex}"]`);
        if (currentItem) {
            currentItem.focus();
        }
    }
    
    // Show previous image
    function showPreviousImage() {
        if (currentImageIndex > 0) {
            openModal(currentImageIndex - 1);
        } else {
            // Loop to last image
            openModal(filteredImages.length - 1);
        }
    }
    
    // Show next image
    function showNextImage() {
        if (currentImageIndex < filteredImages.length - 1) {
            openModal(currentImageIndex + 1);
        } else {
            // Loop to first image
            openModal(0);
        }
    }
    
    // Update navigation button states
    function updateNavigationButtons() {
        // Always enable navigation for continuous loop
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
        
        // Show/hide buttons based on availability
        prevBtn.style.display = filteredImages.length > 1 ? 'block' : 'none';
        nextBtn.style.display = filteredImages.length > 1 ? 'block' : 'none';
    }
    
    // Set gallery view (grid or list)
    function setView(viewType) {
        if (viewType === 'grid') {
            gallery.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            gallery.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        }
    }
    
    // Handle search input
    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredImages = [...images];
        } else {
            filteredImages = images.filter(image => 
                image.title.toLowerCase().includes(searchTerm) ||
                image.description.toLowerCase().includes(searchTerm) ||
                image.filename.toLowerCase().includes(searchTerm)
            );
        }
        
        loadImages();
        
        // Show message if no results
        if (filteredImages.length === 0) {
            gallery.innerHTML = '<div class="no-results"><h3>No images found</h3><p>Try a different search term.</p></div>';
        }
    }
    
    // Perform search
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm) {
            filteredImages = images.filter(image => 
                image.title.toLowerCase().includes(searchTerm) ||
                image.description.toLowerCase().includes(searchTerm) ||
                image.filename.toLowerCase().includes(searchTerm)
            );
        } else {
            filteredImages = [...images];
        }
        
        loadImages();
    }
    
    // Handle keyboard navigation
    function handleKeyboardNavigation(e) {
        if (!isModalOpen) return;
        
        switch(e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                showPreviousImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                showNextImage();
                break;
            case 'Home':
                e.preventDefault();
                openModal(0);
                break;
            case 'End':
                e.preventDefault();
                openModal(filteredImages.length - 1);
                break;
        }
    }
    
    // Download image
    function downloadImage() {
        const image = filteredImages[currentImageIndex];
        if (!image) return;
        
        const link = document.createElement('a');
        link.href = `images/${image.filename}`;
        link.download = image.filename;
        link.click();
    }
    
    // Share image
    function shareImage() {
        const image = filteredImages[currentImageIndex];
        if (!image) return;
        
        if (navigator.share) {
            navigator.share({
                title: image.title,
                text: image.description,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: copy URL to clipboard
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('URL copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('URL copied to clipboard!');
            });
        }
    }
    
    // Show image info
    function showImageInfo() {
        const image = filteredImages[currentImageIndex];
        if (!image) return;
        
        const info = `
Title: ${image.title}
Filename: ${image.filename}
Description: ${image.description}
Position: ${currentImageIndex + 1} of ${filteredImages.length}
        `;
        
        alert(info);
    }
    
    // Handle image loading errors
    function handleImageError(e) {
        const img = e.target;
        img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Image not found</text></svg>';
        img.alt = 'Image not found';
    }
    
    // Add error handling for images
    gallery.addEventListener('error', handleImageError, true);
    modalImage.addEventListener('error', handleImageError);
    
    // Initialize gallery when page loads
    initGallery();
    
    // Expose some functions for debugging
    window.galleryDebug = {
        images,
        filteredImages,
        currentImageIndex,
        openModal,
        closeModal,
        setView,
        performSearch: (term) => {
            searchInput.value = term;
            performSearch();
        }
    };
    
    console.log('Image Gallery initialized');
    console.log(`Loaded ${images.length} images`);
    console.log('Available debug functions:', Object.keys(window.galleryDebug));
    
});