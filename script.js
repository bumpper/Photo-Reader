class PhotoReader {
    applyTransparency() {
        // Applies transparency to preview and fullscreen
        const percent = this.transparency;
        // Overlay approach: fade content visually
        const overlay = document.getElementById('transparencyOverlay');
        if (overlay) {
            if (percent > 0) {
                overlay.style.display = 'block';
                overlay.style.background = '#000'; // or use body background color
                overlay.style.opacity = percent / 100;
            } else {
                overlay.style.display = 'none';
            }
        }
    }
    updateToggleVisual(key) {
        // Map feature key to toggle element ID
        const idMap = {
            randomizedOrder: 'randomizedOrderToggle',
            reverseOrder: 'reverseOrderToggle',
            rotateContent: 'rotateContentToggle',
            mirrorContent: 'mirrorContentToggle',
            verticalGuide: 'verticalGuideToggle',
            centerDot: 'centerDotToggle',
            cornerCircles: 'cornerCirclesToggle',
            audioEnabled: 'audioEnabledToggle'
        };
        const el = document.getElementById(idMap[key]);
        if (!el) {
            console.log('updateToggleVisual: element not found for key', key);
            return;
        }
        if (this.featureStates && this.featureStates[key]) {
            el.classList.remove('disabled');
            // Special style for verticalGuideToggle: make it extra bright and glowing
            if (key === 'verticalGuide') {
                el.classList.add('vertical-pipe-emoji');
            }
            console.log(`updateToggleVisual: ${key} enabled, removed .disabled`);
        } else {
            el.classList.add('disabled');
            if (key === 'verticalGuide') {
                el.classList.add('vertical-pipe-emoji'); // keep shape, but let .disabled override color
            }
            console.log(`updateToggleVisual: ${key} disabled, added .disabled`);
        }
        // Remove outline except for keyboard focus
        el.addEventListener('mousedown', () => el.blur());
    }
    constructor() {
        console.log('PhotoReader constructor called.');
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.slideInterval = null;
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;

        // Feature toggle state (explicitly initialize all keys)
        // Default all toggles to disabled (false)
        this.featureStates = {
            randomizedOrder: false,
            reverseOrder: false,
            rotateContent: false,
            mirrorContent: false,
            verticalGuide: false,
            centerDot: false,
            cornerCircles: false,
            audioEnabled: false
        };

        // Text file support
        this.currentFileType = null; // 'pdf', 'txt', 'docx', 'epub', 'mobi', or 'image'
        this.textContent = null;
        this.textWords = [];
        this.currentWordIndex = 0;
        this.textLines = [];
        this.currentLineIndex = 0;
        this.displayMode = 'word'; // 'word' or 'line'
        this.documentContent = null; // For storing parsed document content
        this.documentPages = []; // For storing document split into pages

        // Image support
        this.imageFiles = []; // Array of image files for folder selection
        this.currentImageIndex = 0;
        this.imageUrls = []; // Track created object URLs for cleanup

        // Randomized order support
        this.randomizedSequence = [];
        this.currentRandomIndex = 0;

        this.initializeElements();
        this.bindEvents();
        this.setupPDFJS();

        // Initialize display mode button state
        this.updateDisplayModeButton();

        // Load settings from localStorage (will update toggles)
        this.loadSettings();

        // Expose for debugging
        window.PhotoReader = this;

        // Clean up image cache when page is closed
        window.addEventListener('beforeunload', () => {
            this.clearImageCache();
        });
    }
    
    // Helper method to get view mode with default fallback to 1
    getViewMode() {
        const viewMode = parseInt(this.pageView.value);
        return isNaN(viewMode) ? 1 : viewMode;
    }
    
    initializeElements() {
        this.openBtn = document.getElementById('openBtn');
        this.openFolderBtn = document.getElementById('openFolderBtn');
        this.photoDirectoryBtn = document.getElementById('photoDirectoryBtn');
        this.fileInput = document.getElementById('fileInput');
        this.folderInput = document.getElementById('folderInput');
        this.preloaded = document.getElementById('preloaded');
        this.displayModeBtn = document.getElementById('displayModeBtn');
        this.pageView = document.getElementById('pageView');
        this.pageViewGroup = this.pageView.closest('.control-group');
        this.centerDot = document.getElementById('centerDot');
        this.cornerCircles = document.getElementById('cornerCircles');
        this.verticalGuide = document.getElementById('verticalGuide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.startPage = document.getElementById('startPage');
        this.endPage = document.getElementById('endPage');
        this.randomizedOrder = document.getElementById('randomizedOrder');
        this.reverseOrder = document.getElementById('reverseOrder');
    this.rotateContent = document.getElementById('rotateContent');
    this.mirrorContent = document.getElementById('mirrorContent');
    this.interval = document.getElementById('interval');
    this.duration = document.getElementById('duration');
    this.transparencyInput = document.getElementById('transparency');
    this.audioEnabledToggle = document.getElementById('audioEnabledToggle');
    this.audioFrequency = document.getElementById('audioFrequency');
    this.playBtn = document.getElementById('playBtn');
    this.pdfContainer = document.getElementById('main-content');
    this.pdfDisplay = document.getElementById('pdfDisplay');
    this.dragDropArea = document.getElementById('dragDropArea');
    this.overlay = document.getElementById('overlay');
    this.container = document.querySelector('.container');
    }
    
    bindEvents() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousPage());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextPage());
        }
        // Duration input: enforce range, save to localStorage
        if (this.duration) {
            const validateDuration = () => {
                let val = parseFloat(this.duration.value);
                if (isNaN(val) || val < 0) val = 0.00;
                if (val > 1) val = 1.00;
                val = Math.round(val * 100) / 100;
                this.duration.value = val.toFixed(2);
                this.saveSettings();
            };
            this.duration.addEventListener('change', validateDuration);
            this.duration.addEventListener('input', validateDuration);
            this.duration.addEventListener('blur', validateDuration);
        }
        if (this.transparencyInput) {
            const updateTransparency = () => {
                let val = parseInt(this.transparencyInput.value);
                if (isNaN(val) || val < 0) val = 0;
                if (val > 100) val = 100;
                this.transparency = val;
                this.transparencyInput.value = val;
                this.saveSettings();
                this.applyTransparency();
            };
            this.transparencyInput.addEventListener('change', updateTransparency);
            this.transparencyInput.addEventListener('input', updateTransparency);
            this.transparencyInput.addEventListener('blur', updateTransparency);
        }
        this.openBtn.addEventListener('click', () => this.fileInput.click());
        this.openFolderBtn.addEventListener('click', () => this.handleImagesButtonClick());
        this.photoDirectoryBtn.addEventListener('click', () => this.handlePhotoDirectoryClick());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.folderInput.addEventListener('change', (e) => this.handleFolderSelect(e));
        this.preloaded.addEventListener('change', (e) => this.handlePreloadedSelect(e));
        this.displayModeBtn.addEventListener('click', () => this.toggleDisplayMode());
        this.pageView.addEventListener('change', () => {
            this.saveSettings();
            this.updateNavigationButtons();
            this.refreshPreviewArea();
            this.updateDisplay();
        });

        // Emoji toggles: add click handlers for all
        const emojiToggles = [
            { key: 'randomizedOrder', id: 'randomizedOrderToggle' },
            { key: 'reverseOrder', id: 'reverseOrderToggle' },
            { key: 'rotateContent', id: 'rotateContentToggle' },
            { key: 'mirrorContent', id: 'mirrorContentToggle' },
            { key: 'verticalGuide', id: 'verticalGuideToggle' },
            { key: 'centerDot', id: 'centerDotToggle' },
            { key: 'cornerCircles', id: 'cornerCirclesToggle' },
            { key: 'audioEnabled', id: 'audioEnabledToggle' }
        ];
        emojiToggles.forEach(({ key, id }) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', () => {
                    this.featureStates[key] = !this.featureStates[key];
                    this.updateToggleVisual(key);
                    this.saveSettings();
                    // If the toggle affects visual transforms or overlays, update preview area immediately
                    if ([
                        'rotateContent',
                        'mirrorContent',
                        'verticalGuide',
                        'centerDot',
                        'cornerCircles'
                    ].includes(key)) {
                        this.updateDisplay();
                    }
                    console.log(`Emoji toggle clicked: ${key}, new state:`, this.featureStates[key]);
                });
            }
        });

        this.audioFrequency.addEventListener('change', () => {
            this.saveSettings();
            this.validateAudioFrequency();
        });
        this.playBtn.addEventListener('click', () => this.toggleSlideshow());

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanupImageUrls());

        // Setup drag and drop
        this.setupDragAndDrop();

        // Mouse events for fullscreen navigation
        this.pdfDisplay.addEventListener('mousedown', (e) => this.handleMouseClick(e));
        this.pdfDisplay.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }
    
    setupDragAndDrop() {
        // Prevent default browser behavior for drag events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dragDropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Add visual feedback when dragging over
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dragDropArea.addEventListener(eventName, () => {
                this.dragDropArea.classList.add('drag-over');
            });
        });

        // Remove visual feedback when leaving
        ['dragleave', 'drop'].forEach(eventName => {
            this.dragDropArea.addEventListener(eventName, () => {
                this.dragDropArea.classList.remove('drag-over');
            });
        });

        // Handle the actual drop
        this.dragDropArea.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => 
                this.isImageFile(file.name)
            );

            if (imageFiles.length === 0) {
                alert('Please drop image files (JPG, PNG, GIF, WebP, SVG)');
                return;
            }

            // Process the dropped image files
            this.handleDroppedImages(imageFiles);
        });

        // Setup close button functionality
        this.setupDragDropCloseButton();
    }

    setupDragDropCloseButton() {
        const closeButton = document.getElementById('dragDropClose');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideDragDropArea();
            });
        }
    }

    showDragDropArea() {
        if (!this.dragDropArea) {
            this.dragDropArea = document.getElementById('dragDropArea');
        }
        if (this.dragDropArea) {
            this.dragDropArea.style.display = 'flex';
        }
    }

    hideDragDropArea() {
        if (!this.dragDropArea) {
            this.dragDropArea = document.getElementById('dragDropArea');
        }
        if (this.dragDropArea) {
            this.dragDropArea.style.display = 'none';
        }
    }

    handleImagesButtonClick() {
        // If we're currently displaying images, ensure drag drop area exists and show it
        if (this.currentFileType === 'image' && this.imageFiles.length > 0) {
            // Ensure drag drop area exists in DOM before showing it
            this.ensureDragDropArea();
            // Show drag drop area to add more images
            this.showDragDropArea();
            return;
        }
        
        // If we're switching from a different file type, clear and prepare for images
        if (this.currentFileType && this.currentFileType !== 'image') {
            this.clearCurrentContent();
        }
        
        // Ensure drag drop area exists in DOM
        this.ensureDragDropArea();
        
        // Show drag and drop area
        this.showDragDropArea();
    }

    clearCurrentContent() {
        // Clear display but preserve the drag drop area
        this.pdfDisplay.innerHTML = `
            <div class="no-pdf" role="status" aria-live="polite">Load a PDF, TXT, DOCX, or image file to begin</div>
            <div id="dragDropArea" class="drag-drop-area" style="display: none;">
                <button class="drag-drop-close" id="dragDropClose" title="Close drag and drop area">&times;</button>
                <div class="drag-drop-content">
                    <h3>📁 Drag & Drop Image Folder</h3>
                    <p>Drop multiple image files here or use the folder picker above</p>
                    <small>Supports: JPG, PNG, GIF, WebP, SVG</small>
                </div>
            </div>
        `;
        
        // Re-initialize the dragDropArea element reference since we just recreated it
        this.dragDropArea = document.getElementById('dragDropArea');
        
        // Re-setup drag and drop events for the new element
        this.setupDragAndDrop();
        
        // Reset current file type
        this.currentFileType = null;
        this.currentPage = 1;
        this.totalPages = 0;
        
        // Reset navigation
        this.playBtn.disabled = true;
        this.updateNavigationButtons();
    }

    ensureDragDropArea() {
        // Check if drag drop area exists, if not create it
        let dragDropElement = document.getElementById('dragDropArea');
        if (!dragDropElement) {
            // Create the drag drop area in the display
            const dragDropHTML = `
                <div id="dragDropArea" class="drag-drop-area" style="display: none;">
                    <button class="drag-drop-close" id="dragDropClose" title="Close drag and drop area">&times;</button>
                    <div class="drag-drop-content">
                        <h3>📁 Drag & Drop Image Folder</h3>
                        <p>Drop multiple image files here or use the folder picker above</p>
                        <small>Supports: JPG, PNG, GIF, WebP, SVG</small>
                    </div>
                </div>
            `;
            this.pdfDisplay.insertAdjacentHTML('beforeend', dragDropHTML);
            
            // Re-initialize the dragDropArea element reference
            this.dragDropArea = document.getElementById('dragDropArea');
            
            // Re-setup drag and drop events for the new element
            this.setupDragAndDrop();
        } else {
            // Update reference in case it changed
            this.dragDropArea = dragDropElement;
        }
    }

    clearImageCache() {
        // Clean up existing object URLs to prevent memory leaks
        if (this.imageUrls && this.imageUrls.length > 0) {
            this.imageUrls.forEach(url => URL.revokeObjectURL(url));
            this.imageUrls = [];
        }
        
        // Reset image-related state
        this.imageFiles = [];
        this.currentImageIndex = 0;
        
        // Clear image-specific properties from files
        if (this.currentFiles) {
            this.currentFiles.forEach(file => {
                if (file.localUrl) {
                    URL.revokeObjectURL(file.localUrl);
                    delete file.localUrl;
                }
            });
        }
    }

    generateRandomizedSequence() {
        // Generate a randomized sequence based on start and end values
        const startIndex = parseInt(this.startPage.value) - 1; // Convert to 0-based
        const endIndex = parseInt(this.endPage.value) - 1;     // Convert to 0-based
        
        // Create array of all indices in the range
        const indices = [];
        for (let i = startIndex; i <= endIndex; i++) {
            indices.push(i);
        }
        
        // Fisher-Yates shuffle algorithm
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        this.randomizedSequence = indices;
        this.currentRandomIndex = 0;
    }

    async handleDroppedImages(files) {
        try {
            this.showLoading();
            this.hideDragDropArea();
            
            // Add files to existing collection or create new collection
            if (this.currentFileType === 'image' && this.imageFiles.length > 0) {
                // Add new images to existing collection
                this.imageFiles = [...this.imageFiles, ...files];
                this.currentFiles = this.imageFiles;
                
                // Display the first new image (at the position where new images start)
                const firstNewImageIndex = this.imageFiles.length - files.length;
                this.currentImageIndex = firstNewImageIndex;
                await this.loadImageFile(this.imageFiles[firstNewImageIndex]);
            } else {
                // First time loading images or switching from different file type
                this.imageFiles = files;
                this.currentFiles = files;
                this.currentFileType = 'image';
                this.currentImageIndex = 0;
                this.currentPageIndex = 0;
                
                // Display first image using proper loading function
                await this.loadImageFile(files[0]);
            }
            
            // Update navigation
            this.updateNavigationButtons();
        } catch (error) {
            console.error('Error processing dropped images:', error);
            alert('Error processing images. Please try again.');
            this.hideLoading();
        }
    }
    
    setupPDFJS() {
        // Set PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // Load saved settings
        this.loadSettings();
    }
    
    saveSettings() {
        const settings = {
            pageView: this.pageView.value,
            displayMode: this.displayMode,
            centerDot: this.featureStates.centerDot,
            cornerCircles: this.featureStates.cornerCircles,
            verticalGuide: this.featureStates.verticalGuide,
            reverseOrder: this.featureStates.reverseOrder,
            randomizedOrder: this.featureStates.randomizedOrder,
            rotateContent: this.featureStates.rotateContent,
            mirrorContent: this.featureStates.mirrorContent,
            interval: this.interval.value,
            duration: this.duration ? this.duration.value : '0.00',
            audioEnabled: this.featureStates.audioEnabled,
            audioFrequency: this.audioFrequency.value,
            transparency: this.transparency
        };
        localStorage.setItem('photoReaderSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('photoReaderSettings');
        // Always default to disabled if no saved settings
        const defaultFeatureStates = {
            randomizedOrder: false,
            reverseOrder: false,
            rotateContent: false,
            mirrorContent: false,
            verticalGuide: false,
            centerDot: false,
            cornerCircles: false,
            audioEnabled: false
        };
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                if (settings.pageView) {
                    this.pageView.value = settings.pageView;
                }
                if (settings.displayMode) {
                    this.displayMode = settings.displayMode;
                    this.displayModeBtn.textContent = this.displayMode === 'word' ? 'Word' : 'Line';
                }
                // Restore featureStates for all toggles, defaulting to false if not present
                Object.keys(defaultFeatureStates).forEach(key => {
                    this.featureStates[key] = settings[key] !== undefined ? settings[key] : false;
                    this.updateToggleVisual(key);
                });
                if (settings.interval) {
                    this.interval.value = settings.interval;
                }
                if (settings.duration && this.duration) {
                    this.duration.value = settings.duration;
                }
                if (settings.audioFrequency) {
                    this.audioFrequency.value = settings.audioFrequency;
                }
                if (settings.transparency !== undefined) {
                    this.transparency = Math.max(0, Math.min(100, parseInt(settings.transparency)));
                    if (this.transparencyInput) {
                        this.transparencyInput.value = this.transparency;
                    }
                    this.applyTransparency();
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                // If error, reset all toggles to disabled
                Object.keys(defaultFeatureStates).forEach(key => {
                    this.featureStates[key] = false;
                    this.updateToggleVisual(key);
                });
            }
        } else {
            // No saved settings, set all toggles to disabled
            Object.keys(defaultFeatureStates).forEach(key => {
                this.featureStates[key] = false;
                this.updateToggleVisual(key);
            });
        }
    }
    
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected.');
            return;
        }
        
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        console.log('File selected:', fileName, 'type:', fileType);
        
        try {
            this.showLoading();
            
            if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                console.log('Loading PDF...');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                if (this.pageViewGroup) this.pageViewGroup.style.display = '';
                this.currentFileType = 'pdf';
                const arrayBuffer = await file.arrayBuffer();
                await this.loadPDF(arrayBuffer);
            } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
                console.log('Loading TXT...');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                if (this.pageViewGroup) this.pageViewGroup.style.display = 'none';
                this.currentFileType = 'txt';
                const text = await file.text();
                await this.loadTextFile(text);
            } else if (fileName.endsWith('.docx')) {
                console.log('Loading DOCX...');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                this.currentFileType = 'docx';
                const arrayBuffer = await file.arrayBuffer();
                await this.loadDocumentFile(arrayBuffer, 'docx');
            } else if (fileName.endsWith('.epub')) {
                console.log('Loading EPUB...');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                this.currentFileType = 'epub';
                const arrayBuffer = await file.arrayBuffer();
                await this.loadEbookFile(arrayBuffer, 'epub');
            } else if (fileName.endsWith('.mobi')) {
                console.log('Loading MOBI...');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                this.currentFileType = 'mobi';
                const arrayBuffer = await file.arrayBuffer();
                await this.loadEbookFile(arrayBuffer, 'mobi');
            } else if (this.isImageFile(fileName) || this.isImageType(fileType)) {
                console.log('Loading image...');
                if (this.currentFileType === 'image' && this.imageFiles.length > 0) {
                    this.imageFiles.push(file);
                    this.currentFiles = this.imageFiles;
                    this.currentImageIndex = this.imageFiles.length - 1;
                    await this.loadImageFile(file);
                    this.updateNavigationButtons();
                } else {
                    this.currentFileType = 'image';
                    this.imageFiles = [file];
                    this.currentFiles = this.imageFiles;
                    this.currentImageIndex = 0;
                    await this.loadImageFile(file);
                    this.updateNavigationButtons();
                }
            } else {
                alert('Please select a valid PDF, TXT, DOCX, EPUB, MOBI, or image file (WebP, JPG, PNG, GIF, SVG).');
                this.hideLoading();
                return;
            }
            console.log('File loaded and rendered.');
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Error loading file: ' + error.message);
            this.hideLoading();
        }
    }
    
    async handlePreloadedSelect(event) {
        const selectedFile = event.target.value;
        console.log('Preloaded select changed:', selectedFile);
        if (!selectedFile) {
            console.log('No file selected.');
            return;
        }

        // Handle +Add Document option
        if (selectedFile === 'add-document') {
            console.log('+Add Document selected.');
            this.fileInput.click();
            event.target.value = '';
            return;
        }

        // Handle Photo Directory drag & drop option
        if (selectedFile === 'photo-directory') {
            console.log('Photo Directory selected.');
            this.handleImagesButtonClick();
            event.target.value = '';
            return;
        }

        // Handle Photo Directory folder picker option (shows browser warning)
        if (selectedFile === 'photo-directory-folder') {
            console.log('Photo Directory Folder selected.');
            this.folderInput.click();
            event.target.value = '';
            return;
        }

        // Handle Vision Board option - load images from /img/ directory
        if (selectedFile === 'vision-board') {
            console.log('Vision Board selected.');
            await this.loadVisionBoard();
            event.target.value = '';
            return;
        }

        try {
            this.showLoading();
            console.log('Attempting to load file:', selectedFile);
            // Determine file type based on extension
            const fileName = selectedFile.toLowerCase();
            const response = await fetch(selectedFile);
            if (!response.ok) {
                console.error('Failed to load file:', response.status);
                throw new Error(`Failed to load file: ${response.status}`);
            }
            if (fileName.endsWith('.pdf')) {
                console.log('PDF file selected.');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                if (this.pageViewGroup) this.pageViewGroup.style.display = '';
                this.currentFileType = 'pdf';
                const arrayBuffer = await response.arrayBuffer();
                await this.loadPDF(arrayBuffer);
            } else if (fileName.endsWith('.txt')) {
                console.log('TXT file selected.');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                if (this.pageViewGroup) this.pageViewGroup.style.display = 'none';
                this.currentFileType = 'txt';
                const text = await response.text();
                await this.loadTextFile(text);
            } else if (fileName.endsWith('.docx')) {
                console.log('DOCX file selected.');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                this.currentFileType = 'docx';
                const arrayBuffer = await response.arrayBuffer();
                await this.loadDocumentFile(arrayBuffer, 'docx');
            } else if (fileName.endsWith('.epub')) {
                console.log('EPUB file selected.');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                this.currentFileType = 'epub';
                const arrayBuffer = await response.arrayBuffer();
                await this.loadEbookFile(arrayBuffer, 'epub');
            } else if (fileName.endsWith('.mobi')) {
                console.log('MOBI file selected.');
                if (this.currentFileType === 'image') {
                    this.clearImageCache();
                }
                this.currentFileType = 'mobi';
                const arrayBuffer = await response.arrayBuffer();
                await this.loadEbookFile(arrayBuffer, 'mobi');
            } else {
                console.error('Unsupported file type selected:', selectedFile);
                alert('Unsupported file type. Please select a PDF, TXT, DOCX, EPUB, or MOBI file.');
                this.hideLoading();
                return;
            }
        } catch (error) {
            console.error('Error loading preloaded file:', error);
            alert('Error loading preloaded file. Please make sure the file exists.');
            this.hideLoading();
        }
    }
    
    handlePhotoDirectoryClick() {
        // Direct folder selection without popup
        this.folderInput.click();
    }
    
    async createSamplePDF() {
        // Create a simple sample PDF using canvas for demonstration
        const canvas = document.createElement('canvas');
        canvas.width = 612; // Standard letter size
        canvas.height = 792;
        const ctx = canvas.getContext('2d');
        
        // Create multiple sample pages
        const pages = [];
        for (let i = 1; i <= 5; i++) {
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = 612;
            pageCanvas.height = 792;
            const pageCtx = pageCanvas.getContext('2d');
            
            // White background
            pageCtx.fillStyle = 'white';
            pageCtx.fillRect(0, 0, 612, 792);
            
            // Add some content
            pageCtx.fillStyle = 'black';
            pageCtx.font = '48px Arial';
            pageCtx.textAlign = 'center';
            pageCtx.fillText(`Sample Page ${i}`, 306, 200);
            
            pageCtx.font = '24px Arial';
            pageCtx.fillText('This is a sample PDF for testing', 306, 300);
            pageCtx.fillText('Photo-Reader functionality', 306, 340);
            
            // Add some shapes for visual interest
            pageCtx.strokeStyle = 'blue';
            pageCtx.lineWidth = 3;
            pageCtx.strokeRect(50, 400, 512, 200);
            
            pageCtx.fillStyle = 'red';
            pageCtx.beginPath();
            pageCtx.arc(306, 500, 50, 0, 2 * Math.PI);
            pageCtx.fill();
            
            pages.push(pageCanvas);
        }
        
        // Simulate PDF loading
        this.pdfDoc = {
            numPages: pages.length,
            getPage: async (pageNum) => {
                const canvas = pages[pageNum - 1];
                return {
                    getViewport: ({ scale }) => ({
                        width: canvas.width * scale,
                        height: canvas.height * scale
                    }),
                    render: ({ canvasContext, viewport }) => {
                        const targetCanvas = canvasContext.canvas;
                        targetCanvas.width = viewport.width;
                        targetCanvas.height = viewport.height;
                        
                        canvasContext.drawImage(canvas, 0, 0, viewport.width, viewport.height);
                        
                        return { promise: Promise.resolve() };
                    }
                };
            }
        };
        
        this.totalPages = this.pdfDoc.numPages;
        
        // Update page inputs - only update end page if it's still at default
        this.startPage.max = this.totalPages;
        this.endPage.max = this.totalPages;
        if (this.endPage.value == 1) {
            this.endPage.value = this.totalPages;
        }
        
        this.currentPage = 1;
        this.playBtn.disabled = false;
        
        await this.updateDisplay();
        
        // Enable navigation buttons AFTER display is updated
        this.updateNavigationButtons();
        
        this.hideLoading();
    }
    
    async loadTextFile(text) {
        this.textContent = text;
        this.textWords = text.split(/\s+/).filter(word => word.trim().length > 0);
        this.textLines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        this.currentWordIndex = 0;
        this.currentLineIndex = 0;
        
        // Default to Line mode for text files
        this.displayMode = 'line';
        
        this.startPage.value = 1;
        
        this.playBtn.disabled = false;
        
        // Update the display mode button for text files
        this.updateDisplayModeButton();
        
        // Use the comprehensive page controls update function
        this.updatePageControlsForCurrentFile();
        
        await this.renderTextPreview();
        
        this.hideLoading();
    }

    updateTotalPagesForTextMode() {
        if (this.displayMode === 'line') {
            this.totalPages = this.textLines.length;
            this.startPage.max = this.textLines.length;
            this.endPage.max = this.textLines.length;
            this.endPage.value = this.textLines.length;
        } else {
            this.totalPages = this.textWords.length;
            this.startPage.max = this.textWords.length;
            this.endPage.max = this.textWords.length;
            this.endPage.value = this.textWords.length;
        }
    }

    updatePageControlsForCurrentFile() {
        if (this.currentFileType === 'txt') {
            this.updateTotalPagesForTextMode();
        } else if (this.currentFileType === 'pdf' || this.currentFileType === 'image' || 
                  this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            // For non-text files, ensure start/end controls reflect current totalPages
            this.startPage.max = this.totalPages;
            this.endPage.max = this.totalPages;
            // Validate current values don't exceed new max
            if (parseInt(this.endPage.value) > this.totalPages) {
                this.endPage.value = this.totalPages;
            }
            if (parseInt(this.startPage.value) > this.totalPages) {
                this.startPage.value = 1;
            }
        }
        // Update navigation buttons to reflect the changes
        this.updateNavigationButtons();
    }

    refreshPreviewArea() {
        // Force a layout refresh for the preview area
        // This ensures the preview adjusts properly when page view mode changes
        if (this.pdfDisplay) {
            // Trigger a reflow to ensure proper layout recalculation
            const currentDisplay = this.pdfDisplay.style.display;
            this.pdfDisplay.style.display = 'none';
            this.pdfDisplay.offsetHeight; // Force reflow
            this.pdfDisplay.style.display = currentDisplay;
        }
        // Apply transparency after refresh
        this.applyTransparency();
    }

    async loadDocumentFile(data, fileType) {
        try {
            let htmlContent = '';
            let plainText = '';
            
            if (fileType === 'docx') {
                // Use mammoth.js to convert DOCX to HTML
                if (typeof mammoth === 'undefined') {
                    throw new Error('Mammoth.js library not loaded');
                }
                
                const result = await mammoth.convertToHtml({ arrayBuffer: data });
                htmlContent = result.value;
                
                // Extract plain text for word-by-word mode
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                plainText = tempDiv.textContent || tempDiv.innerText || '';
            }
            
            // Store the content and split into pages
            this.documentContent = htmlContent;
            this.textContent = plainText;
            this.textWords = plainText.split(/\s+/).filter(word => word.trim().length > 0);
            this.textLines = plainText.split(/\r?\n/).filter(line => line.trim().length > 0);
            this.currentWordIndex = 0;
            this.currentLineIndex = 0;
            
            // Split document into pages for slideshow
            this.documentPages = this.splitDocumentIntoPages(htmlContent);
            
            // Reset page-related controls for document mode
            this.totalPages = this.documentPages.length;
            this.startPage.value = 1;
            this.endPage.value = this.totalPages;
            
            this.currentPage = 1;
            this.playBtn.disabled = false;
            
            // Update the display mode button for document files
            this.updateDisplayModeButton();
            
            // Use the comprehensive page controls update function
            this.updatePageControlsForCurrentFile();
            
            await this.renderDocumentPreview();
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading document file:', error);
            throw error;
        }
    }

    async loadEbookFile(data, fileType) {
        try {
            let htmlContent = '';
            let plainText = '';
            
            if (fileType === 'epub') {
                // Enhanced EPUB parsing with better error handling
                try {
                    console.log('Processing EPUB file...');
                    const uint8Array = new Uint8Array(data);
                    
                    // Try multiple text decoders for better compatibility
                    let text = '';
                    try {
                        const decoder = new TextDecoder('utf-8', { fatal: false });
                        text = decoder.decode(uint8Array);
                    } catch (e) {
                        console.log('UTF-8 decoding failed, trying latin1...');
                        const decoder = new TextDecoder('latin1', { fatal: false });
                        text = decoder.decode(uint8Array);
                    }
                    
                    console.log('Decoded text length:', text.length);
                    
                    // EPUB files contain HTML/XHTML content - extract with multiple strategies
                    let extractedContent = [];
                    
                    // Strategy 1: Extract paragraph content
                    const paragraphMatches = text.match(/<p[^>]*>(.*?)<\/p>/gis) || [];
                    if (paragraphMatches.length > 0) {
                        extractedContent = extractedContent.concat(paragraphMatches);
                    }
                    
                    // Strategy 2: Extract div content
                    const divMatches = text.match(/<div[^>]*>(.*?)<\/div>/gis) || [];
                    if (divMatches.length > 0) {
                        extractedContent = extractedContent.concat(divMatches);
                    }
                    
                    // Strategy 3: Extract body content
                    const bodyMatches = text.match(/<body[^>]*>(.*?)<\/body>/gis) || [];
                    if (bodyMatches.length > 0) {
                        extractedContent = extractedContent.concat(bodyMatches);
                    }
                    
                    // Strategy 4: General text extraction
                    if (extractedContent.length === 0) {
                        const generalMatches = text.match(/[A-Z][a-zA-Z\s.,!?;:'"()\-—–]{100,}/g) || [];
                        extractedContent = generalMatches;
                    }
                    
                    console.log('Extracted content pieces:', extractedContent.length);
                    
                    if (extractedContent.length > 0) {
                        // Join and clean the content
                        htmlContent = extractedContent.join(' ');
                        
                        // Clean up HTML tags for plain text
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = htmlContent;
                        plainText = tempDiv.textContent || tempDiv.innerText || '';
                        
                        // If we still don't have plain text, extract it directly
                        if (!plainText) {
                            plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                        }
                        
                        // Create formatted HTML from plain text
                        if (plainText && !htmlContent.includes('<p>')) {
                            htmlContent = plainText
                                .split(/\.\s+/)
                                .filter(sentence => sentence.length > 20)
                                .map(sentence => `<p>${sentence.trim()}${sentence.endsWith('.') ? '' : '.'}</p>`)
                                .join('');
                        }
                    }
                    
                    console.log('Final plain text length:', plainText.length);
                    
                    if (!plainText || plainText.length < 100) {
                        throw new Error('Unable to extract sufficient readable content from this EPUB file. The file may be encrypted, corrupted, or use an unsupported format.');
                    }
                    
                } catch (error) {
                    console.error('EPUB parsing error:', error);
                    throw new Error(`EPUB parsing failed: ${error.message}`);
                }
                
            } else if (fileType === 'mobi') {
                // Enhanced MOBI parsing with better text extraction
                try {
                    console.log('Processing MOBI file...');
                    
                    // Try multiple text decoders for better compatibility
                    let text = '';
                    try {
                        const decoder = new TextDecoder('utf-8', { fatal: false });
                        text = decoder.decode(data);
                    } catch (e) {
                        console.log('UTF-8 decoding failed, trying latin1...');
                        const decoder = new TextDecoder('latin1', { fatal: false });
                        text = decoder.decode(data);
                    }
                    
                    console.log('Decoded MOBI text length:', text.length);
                    
                    // MOBI files contain readable text mixed with binary data
                    // Use multiple extraction strategies
                    let extractedTexts = [];
                    
                    // Strategy 1: Extract longer text sequences
                    const longTextMatches = text.match(/[A-Z][a-zA-Z\s.,!?;:'"()\-—–]{100,}/g) || [];
                    if (longTextMatches.length > 0) {
                        extractedTexts = extractedTexts.concat(longTextMatches);
                    }
                    
                    // Strategy 2: Extract medium text sequences
                    const mediumTextMatches = text.match(/[a-zA-Z][a-zA-Z\s.,!?;:'"()\-—–]{50,}/g) || [];
                    if (mediumTextMatches.length > 0) {
                        extractedTexts = extractedTexts.concat(mediumTextMatches);
                    }
                    
                    // Strategy 3: Look for chapter or paragraph markers
                    const chapterMatches = text.match(/Chapter\s+\d+[^]*?(?=Chapter\s+\d+|$)/gi) || [];
                    if (chapterMatches.length > 0) {
                        extractedTexts = extractedTexts.concat(chapterMatches);
                    }
                    
                    console.log('Extracted text pieces:', extractedTexts.length);
                    
                    if (extractedTexts.length > 0) {
                        // Clean and join the text matches
                        plainText = extractedTexts
                            .map(match => match.trim())
                            .filter(match => match.length > 30) // Filter out short fragments
                            .join(' ')
                            .replace(/\s+/g, ' ')
                            .replace(/[^\x20-\x7E\s\u00A0-\u00FF]/g, '') // Keep basic Latin characters
                            .replace(/\u0000/g, '') // Remove null characters
                            .trim();
                    }
                    
                    console.log('Final MOBI plain text length:', plainText.length);
                    
                    if (!plainText || plainText.length < 200) {
                        throw new Error('Unable to extract sufficient readable text from this MOBI file. The file may be encrypted, corrupted, or use an unsupported format.');
                    }
                    
                    // Convert to HTML with better paragraph detection
                    htmlContent = plainText
                        .split(/\.\s+(?=[A-Z])/) // Split on sentence endings followed by capital letters
                        .map(sentence => sentence.trim())
                        .filter(sentence => sentence.length > 15)
                        .map(sentence => `<p>${sentence}${sentence.endsWith('.') ? '' : '.'}</p>`)
                        .join('');
                    
                } catch (error) {
                    console.error('MOBI parsing error:', error);
                    throw new Error(`MOBI parsing failed: ${error.message}`);
                }
            }
            
            // Extract plain text if we only have HTML
            if (!plainText && htmlContent) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                plainText = tempDiv.textContent || tempDiv.innerText || '';
            }
            
            // Validate we have content
            if (!htmlContent || !plainText || plainText.length < 50) {
                throw new Error(`Unable to extract readable content from this ${fileType.toUpperCase()} file.`);
            }
            
            // Store the content and split into pages
            this.documentContent = htmlContent;
            this.textContent = plainText;
            this.textWords = plainText.split(/\s+/).filter(word => word.trim().length > 0);
            this.textLines = plainText.split(/\r?\n/).filter(line => line.trim().length > 0);
            this.currentWordIndex = 0;
            this.currentLineIndex = 0;
            
            // Split document into pages for slideshow
            this.documentPages = this.splitDocumentIntoPages(htmlContent);
            
            // Ensure we have at least one page
            if (this.documentPages.length === 0) {
                this.documentPages = [htmlContent];
            }
            
            // Reset page-related controls for ebook mode
            this.totalPages = this.documentPages.length;
            this.startPage.value = 1;
            this.endPage.value = this.totalPages;
            
            this.currentPage = 1;
            this.playBtn.disabled = false;
            
            // Update the display mode button for ebook files
            this.updateDisplayModeButton();
            
            // Use the comprehensive page controls update function
            this.updatePageControlsForCurrentFile();
            
            await this.renderDocumentPreview();
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading ebook file:', error);
            throw error;
        }
    }

    splitDocumentIntoPages(htmlContent) {
        // Split document content into pages based on content length
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const elements = Array.from(tempDiv.children);
        const pages = [];
        let currentPage = '';
        let currentLength = 0;
        const maxPageLength = 2000; // Approximate characters per page
        
        for (const element of elements) {
            const elementText = element.textContent || '';
            
            if (currentLength + elementText.length > maxPageLength && currentPage.length > 0) {
                // Start new page
                pages.push(currentPage);
                currentPage = element.outerHTML;
                currentLength = elementText.length;
            } else {
                // Add to current page
                currentPage += element.outerHTML;
                currentLength += elementText.length;
            }
        }
        
        // Add the last page
        if (currentPage.length > 0) {
            pages.push(currentPage);
        }
        
        // If no pages were created, create one page with all content
        if (pages.length === 0) {
            pages.push(htmlContent);
        }
        
        return pages;
    }

    async renderDocumentPreview() {
        this.pdfDisplay.innerHTML = '';
        this.pdfDisplay.classList.remove('two-pages', 'three-pages');
        
        // For preview mode, show the current page
        const pageContent = this.documentPages[this.currentPage - 1] || this.documentContent;
        
        const documentPageDiv = document.createElement('div');
        documentPageDiv.className = 'document-page';
        
        const documentPreview = document.createElement('div');
        documentPreview.className = 'document-preview';
        documentPreview.innerHTML = pageContent;
        
        // Apply transformations
        let transforms = [];
        if (this.featureStates.rotateContent) {
            transforms.push('rotate(180deg)');
        }
        if (this.featureStates.mirrorContent) {
            transforms.push('scaleX(-1)');
        }
        if (transforms.length > 0) {
            documentPreview.style.transform = transforms.join(' ');
        }
        
        documentPageDiv.appendChild(documentPreview);
        this.pdfDisplay.appendChild(documentPageDiv);
        
        // Update overlay to show center dot and corner circles for document files
        this.updateOverlay();
    }

    async loadPDF(arrayBuffer) {
        this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
        this.totalPages = this.pdfDoc.numPages;
        
        // Auto-set end page to total pages if it's at default (1) or if the current value is less than total pages
        const currentEndPage = parseInt(this.endPage.value);
        if (currentEndPage <= 1 || currentEndPage < this.totalPages) {
            this.endPage.value = this.totalPages;
        }
        
        this.currentPage = 1;
        this.playBtn.disabled = false;
        
        // Update the display mode button for PDF files
        this.updateDisplayModeButton();
        
        // Use the comprehensive page controls update function
        this.updatePageControlsForCurrentFile();
        
        await this.updateDisplay();
        
        this.hideLoading();
    }
    
    showLoading() {
        this.pdfDisplay.innerHTML = '<div class="loading">Loading File...</div>';
    }
    
    hideLoading() {
        // Loading will be replaced by PDF content
    }
    
    async renderTextPreview() {
        this.pdfDisplay.innerHTML = '';
        this.pdfDisplay.classList.remove('two-pages', 'three-pages');

        const textDisplay = document.createElement('div');
        textDisplay.className = 'text-display';

        const textPreview = document.createElement('div');
        textPreview.className = 'text-preview';
        textPreview.textContent = this.textContent;

        // Apply transformations using featureStates
        let transforms = [];
        if (this.featureStates.rotateContent) {
            transforms.push('rotate(180deg)');
        }
        if (this.featureStates.mirrorContent) {
            transforms.push('scaleX(-1)');
        }
        if (transforms.length > 0) {
            textPreview.style.transform = transforms.join(' ');
        }

        textDisplay.appendChild(textPreview);
        this.pdfDisplay.appendChild(textDisplay);

        // Update overlay to show center dot and corner circles for text files
        this.updateOverlay();
    }

    async updateDisplay() {
        if (this.currentFileType === 'txt') {
            await this.renderTextPreview();
            return;
        }
        
        if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            await this.renderDocumentPage();
            return;
        }
        
        if (this.currentFileType === 'image') {
            await this.displayImages();
            return;
        }
        
        if (!this.pdfDoc) return;
        
        const viewMode = this.getViewMode();
        
        // Immediately clear display for instant transition
        this.pdfDisplay.innerHTML = '';
        
        // Remove all page view classes immediately
        this.pdfDisplay.classList.remove('two-pages', 'three-pages');
        
        // Force immediate DOM update
        this.pdfDisplay.offsetHeight;
        
        if (viewMode === 1) {
            await this.renderPage(this.currentPage);
        } else if (viewMode === 2) {
            this.pdfDisplay.classList.add('two-pages');
            // Render pages in parallel for faster display
            const renderPromises = [this.renderPage(this.currentPage, 'left')];
            if (this.currentPage + 1 <= this.totalPages) {
                renderPromises.push(this.renderPage(this.currentPage + 1, 'right'));
            }
            await Promise.all(renderPromises);
        } else if (viewMode === 3) {
            this.pdfDisplay.classList.add('three-pages');
            // Render pages in parallel for faster display
            const renderPromises = [this.renderPage(this.currentPage, 'left')];
            if (this.currentPage + 1 <= this.totalPages) {
                renderPromises.push(this.renderPage(this.currentPage + 1, 'center'));
            }
            if (this.currentPage + 2 <= this.totalPages) {
                renderPromises.push(this.renderPage(this.currentPage + 2, 'right'));
            }
            await Promise.all(renderPromises);
        }
        
        // Force immediate DOM update before overlay
        this.pdfDisplay.offsetHeight;
        this.updateOverlay();
    }

    async renderDocumentPage() {
        this.pdfDisplay.innerHTML = '';
        this.pdfDisplay.classList.remove('two-pages', 'three-pages');
        
        // Get the current page content
        const pageContent = this.documentPages[this.currentPage - 1] || this.documentContent;
        
        const documentPageDiv = document.createElement('div');
        documentPageDiv.className = 'document-page';
        
        const documentPreview = document.createElement('div');
        documentPreview.className = 'document-preview';
        documentPreview.innerHTML = pageContent;
        
        // Apply transformations
        let transforms = [];
        if (this.featureStates && this.featureStates.rotateContent) {
            transforms.push('rotate(180deg)');
        }
        if (this.featureStates && this.featureStates.mirrorContent) {
            transforms.push('scaleX(-1)');
        }
        if (transforms.length > 0) {
            documentPreview.style.transform = transforms.join(' ');
        }
        
        documentPageDiv.appendChild(documentPreview);
        this.pdfDisplay.appendChild(documentPageDiv);
        
        // Update overlay to show center dot and corner circles for document files
        this.updateOverlay();
    }
    
    async displayImages() {
        if (this.imageFiles.length === 0) return;
        
        const viewMode = this.getViewMode();
        
        // Clear the display but preserve drag drop area
        const dragDropArea = document.getElementById('dragDropArea');
        this.pdfDisplay.innerHTML = '';
        
        // Restore drag drop area if it existed
        if (dragDropArea) {
            this.pdfDisplay.appendChild(dragDropArea);
            this.dragDropArea = dragDropArea;
        }
        
        // Remove all page view classes immediately
        this.pdfDisplay.classList.remove('two-pages', 'three-pages');
        
        // Force immediate DOM update
        this.pdfDisplay.offsetHeight;
        
        if (viewMode === 1) {
            // Single image display
            await this.displaySingleImage(this.currentImageIndex);
        } else if (viewMode === 2) {
            // Two-page image display
            this.pdfDisplay.classList.add('two-pages');
            const promises = [];
            promises.push(this.displayImageAtPosition(this.currentImageIndex, 'left'));
            if (this.currentImageIndex + 1 < this.imageFiles.length) {
                promises.push(this.displayImageAtPosition(this.currentImageIndex + 1, 'right'));
            }
            await Promise.all(promises);
        } else if (viewMode === 3) {
            // Three-page image display
            this.pdfDisplay.classList.add('three-pages');
            const promises = [];
            promises.push(this.displayImageAtPosition(this.currentImageIndex, 'left'));
            if (this.currentImageIndex + 1 < this.imageFiles.length) {
                promises.push(this.displayImageAtPosition(this.currentImageIndex + 1, 'center'));
            }
            if (this.currentImageIndex + 2 < this.imageFiles.length) {
                promises.push(this.displayImageAtPosition(this.currentImageIndex + 2, 'right'));
            }
            await Promise.all(promises);
        }
        
        // Force immediate DOM update before overlay
        this.pdfDisplay.offsetHeight;
        this.updateOverlay();
    }
    
    async displaySingleImage(imageIndex) {
        if (imageIndex < 0 || imageIndex >= this.imageFiles.length) return;
        
        const file = this.imageFiles[imageIndex];
        const img = await this.loadImageAsElement(file);
        
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container single-image';
        imageContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            overflow: hidden;
        `;
        
        // Style the image
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            object-position: center;
            display: block;
            border: none;
            outline: none;
        `;
        
        // Apply transforms if needed
        this.applyImageTransforms(img);
        
        imageContainer.appendChild(img);
        this.pdfDisplay.appendChild(imageContainer);
    }
    
    async displayImageAtPosition(imageIndex, position) {
        if (imageIndex < 0 || imageIndex >= this.imageFiles.length) return;
        
        const file = this.imageFiles[imageIndex];
        const img = await this.loadImageAsElement(file);
        
        // Create image container with position class
        const imageContainer = document.createElement('div');
        imageContainer.className = `image-container multi-image ${position}`;
        imageContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            overflow: hidden;
            box-sizing: border-box;
        `;
        
        // Style the image to fill its container while maintaining aspect ratio
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            object-position: center;
            display: block;
            border: none;
            outline: none;
        `;
        
        // Apply transforms if needed
        this.applyImageTransforms(img);
        
        imageContainer.appendChild(img);
        this.pdfDisplay.appendChild(imageContainer);
    }
    
    async loadImageAsElement(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            
            if (file.localUrl) {
                img.src = file.localUrl;
            } else {
                const url = URL.createObjectURL(file);
                this.imageUrls.push(url);
                img.src = url;
            }
        });
    }
    
    applyImageTransforms(img) {
        let transform = '';
        if (this.featureStates && this.featureStates.rotateContent) {
            transform += ' rotate(180deg)';
        }
        if (this.featureStates && this.featureStates.mirrorContent) {
            transform += ' scaleX(-1)';
        }
        if (transform) {
            img.style.transform = transform.trim();
        }
    }
    
    async renderPage(pageNum, position = 'single') {
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate scale to fit container
            const containerRect = this.pdfContainer.getBoundingClientRect();
            const viewport = page.getViewport({ scale: 1 });
            
            let scale;
            const viewMode = this.getViewMode();
            if (viewMode === 2) {
                // For two-page view, each page gets half the width
                const maxWidth = containerRect.width / 2;
                const maxHeight = containerRect.height;
                scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
            } else if (viewMode === 3) {
                // For three-page view, each page gets one-third the width
                const maxWidth = containerRect.width / 3;
                const maxHeight = containerRect.height;
                scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
            } else {
                scale = Math.min(containerRect.width / viewport.width, containerRect.height / viewport.height);
            }
            
            const scaledViewport = page.getViewport({ scale });
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            const renderContext = {
                canvasContext: ctx,
                viewport: scaledViewport
            };
            
            await page.render(renderContext).promise;
            
            // Apply transformations
            let transforms = [];
            if (this.featureStates.rotateContent) {
                transforms.push('rotate(180deg)');
            }
            if (this.featureStates.mirrorContent) {
                transforms.push('scaleX(-1)');
            }
            if (transforms.length > 0) {
                canvas.style.transform = transforms.join(' ');
            }
            
            // Create page container
            const pageDiv = document.createElement('div');
            pageDiv.className = 'pdf-page';
            pageDiv.appendChild(canvas);
            
            this.pdfDisplay.appendChild(pageDiv);
            
        } catch (error) {
            console.error('Error rendering page:', error);
        }
    }
    
    updateOverlay() {
        this.overlay.innerHTML = '';
        
        // Check if we're in fullscreen mode
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement || 
                               document.msFullscreenElement);
        

        
        // Remove aria-hidden which might be hiding the overlay
        this.overlay.removeAttribute('aria-hidden');
        this.overlay.style.visibility = 'visible';
        this.overlay.style.display = 'block';
        
        // Support overlay for PDF files
        if (this.pdfDoc) {
            // Vertical guide line for PDFs - create one line per page
            if (this.featureStates.verticalGuide) {
                const viewMode = this.getViewMode();
                const pages = this.pdfDisplay.querySelectorAll('.pdf-page');
                
                if (viewMode === 1) {
                    // Single page - one centered line
                    const verticalLine = document.createElement('div');
                    verticalLine.className = 'vertical-guide';
                    verticalLine.style.cssText = `
                        position: absolute;
                        left: 50%;
                        top: 0;
                        width: 1px;
                        height: 100%;
                        background-color: #cccccc;
                        transform: translateX(-50%);
                        pointer-events: none;
                        z-index: 10;
                    `;
                    this.overlay.appendChild(verticalLine);
                } else {
                    // Multiple pages - create a line for each page
                    pages.forEach((page) => {
                        const pageRect = page.getBoundingClientRect();
                        const containerRect = this.pdfContainer.getBoundingClientRect();
                        
                        const relativeLeft = pageRect.left - containerRect.left;
                        const relativeTop = pageRect.top - containerRect.top;
                        const pageCenterX = relativeLeft + (pageRect.width / 2);
                        
                        const verticalLine = document.createElement('div');
                        verticalLine.className = 'vertical-guide';
                        verticalLine.style.cssText = `
                            position: absolute;
                            left: ${pageCenterX}px;
                            top: ${relativeTop}px;
                            width: 1px;
                            height: ${pageRect.height}px;
                            background-color: #cccccc;
                            pointer-events: none;
                            z-index: 10;
                        `;
                        this.overlay.appendChild(verticalLine);
                    });
                }
            }
            const containerRect = this.pdfContainer.getBoundingClientRect();
            const displayRect = this.pdfDisplay.getBoundingClientRect();
            
            // Center dot
            if (this.featureStates.centerDot) {
                const centerDot = document.createElement('div');
                centerDot.className = 'dot center-dot';
                this.overlay.appendChild(centerDot);
            }
            
            // Corner circles
            if (this.featureStates.cornerCircles) {
                const viewMode = this.getViewMode();
                const pages = this.pdfDisplay.querySelectorAll('.pdf-page');
                
                if (viewMode === 1) {
                    // Single page - all four corners
                    this.createCornerDot('top-left');
                    this.createCornerDot('top-right');
                    this.createCornerDot('bottom-left');
                    this.createCornerDot('bottom-right');
                } else if (viewMode === 2) {
                    // Two pages - left corners on left page, right corners on right page
                    if (pages.length > 0) {
                        this.createCornerDot('top-left', pages[0]);
                        this.createCornerDot('bottom-left', pages[0]);
                    }
                    if (pages.length > 1) {
                        this.createCornerDot('top-right', pages[1]);
                        this.createCornerDot('bottom-right', pages[1]);
                    }
                } else if (viewMode === 3) {
                    // Three pages - left corners on leftmost page, right corners on rightmost page
                    if (pages.length > 0) {
                        this.createCornerDot('top-left', pages[0]);
                        this.createCornerDot('bottom-left', pages[0]);
                    }
                    if (pages.length > 2) {
                        this.createCornerDot('top-right', pages[2]);
                        this.createCornerDot('bottom-right', pages[2]);
                    } else if (pages.length > 1) {
                        this.createCornerDot('top-right', pages[1]);
                        this.createCornerDot('bottom-right', pages[1]);
                    }
                }
            }
        }
        // Support overlay for image files
        else if (this.currentFileType === 'image') {
            // Vertical guide line for images
            if (this.featureStates.verticalGuide) {
                const viewMode = this.getViewMode();
                const imageContainers = this.pdfDisplay.querySelectorAll('.image-container');
                
                if (viewMode === 1) {
                    // Single image - one centered line
                    const verticalLine = document.createElement('div');
                    verticalLine.className = 'vertical-guide';
                    verticalLine.style.cssText = `
                        position: absolute;
                        left: 50%;
                        top: 0;
                        width: 1px;
                        height: 100%;
                        background-color: #cccccc;
                        transform: translateX(-50%);
                        pointer-events: none;
                        z-index: 10;
                    `;
                    this.overlay.appendChild(verticalLine);
                } else {
                    // Multiple images - create a line for each image
                    imageContainers.forEach((container) => {
                        const containerRect = container.getBoundingClientRect();
                        const parentRect = this.pdfContainer.getBoundingClientRect();
                        
                        const relativeLeft = containerRect.left - parentRect.left;
                        const relativeTop = containerRect.top - parentRect.top;
                        const containerCenterX = relativeLeft + (containerRect.width / 2);
                        
                        const verticalLine = document.createElement('div');
                        verticalLine.className = 'vertical-guide';
                        verticalLine.style.cssText = `
                            position: absolute;
                            left: ${containerCenterX}px;
                            top: ${relativeTop}px;
                            width: 1px;
                            height: ${containerRect.height}px;
                            background-color: #cccccc;
                            pointer-events: none;
                            z-index: 10;
                        `;
                        this.overlay.appendChild(verticalLine);
                    });
                }
            }
            
            // Center dot
            if (this.featureStates.centerDot) {
                const centerDot = document.createElement('div');
                centerDot.className = 'dot center-dot';
                this.overlay.appendChild(centerDot);
            }
            
            // Corner circles
            if (this.featureStates.cornerCircles) {
                const viewMode = this.getViewMode();
                const imageContainers = this.pdfDisplay.querySelectorAll('.image-container');
                
                if (viewMode === 1) {
                    // Single image - all four corners
                    this.createCornerDot('top-left');
                    this.createCornerDot('top-right');
                    this.createCornerDot('bottom-left');
                    this.createCornerDot('bottom-right');
                } else if (viewMode === 2) {
                    // Two images - left corners on left image, right corners on right image
                    if (imageContainers.length > 0) {
                        this.createCornerDot('top-left', imageContainers[0]);
                        this.createCornerDot('bottom-left', imageContainers[0]);
                    }
                    if (imageContainers.length > 1) {
                        this.createCornerDot('top-right', imageContainers[1]);
                        this.createCornerDot('bottom-right', imageContainers[1]);
                    }
                } else if (viewMode === 3) {
                    // Three images - left corners on leftmost image, right corners on rightmost image
                    if (imageContainers.length > 0) {
                        this.createCornerDot('top-left', imageContainers[0]);
                        this.createCornerDot('bottom-left', imageContainers[0]);
                    }
                    if (imageContainers.length > 2) {
                        this.createCornerDot('top-right', imageContainers[2]);
                        this.createCornerDot('bottom-right', imageContainers[2]);
                    } else if (imageContainers.length > 1) {
                        this.createCornerDot('top-right', imageContainers[1]);
                        this.createCornerDot('bottom-right', imageContainers[1]);
                    }
                }
            }
        }
        // Support overlay for text files and document files
        else if (this.currentFileType === 'txt' || this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            // Vertical guide line for text/document files
            if (this.featureStates.verticalGuide) {
                const verticalLine = document.createElement('div');
                verticalLine.className = 'vertical-guide';
                
                if (isFullscreen) {
                    // Remove any existing fullscreen line first
                    const existing = document.getElementById('fullscreen-vertical-line');
                    if (existing) existing.remove();
                    
                    // Find the fullscreen container
                    const fullscreenContainer = document.querySelector('.container.fullscreen');
                    
                    if (fullscreenContainer) {
                        // Add to fullscreen container instead of body
                        verticalLine.style.cssText = `
                            position: fixed !important;
                            left: 50vw !important;
                            top: 0 !important;
                            width: 2px !important;
                            height: 100vh !important;
                            background-color: #888 !important;
                            transform: translateX(-50%) !important;
                            pointer-events: none !important;
                            z-index: 999999999 !important;
                            opacity: 0.7 !important;
                            display: block !important;
                            visibility: visible !important;
                        `;
                        verticalLine.id = 'fullscreen-vertical-line';
                        
                        // Add to fullscreen container
                        fullscreenContainer.appendChild(verticalLine);
                        verticalLine.offsetHeight; // Force reflow
                    } else {
                        // Fallback to body
                        verticalLine.style.cssText = `
                            position: fixed;
                            left: 50vw;
                            top: 0;
                            width: 2px;
                            height: 100vh;
                            background-color: #888;
                            transform: translateX(-50%);
                            pointer-events: none;
                            z-index: 2147483647;
                            opacity: 0.7;
                        `;
                        verticalLine.id = 'fullscreen-vertical-line';
                        document.body.appendChild(verticalLine);
                    }
                } else {
                    // In preview mode, add to overlay with proper relative positioning
                    verticalLine.style.cssText = `
                        position: absolute;
                        left: 50%;
                        top: 0;
                        width: 2px;
                        height: 100%;
                        background-color: #888;
                        transform: translateX(-50%);
                        pointer-events: none;
                        opacity: 0.7;
                    `;
                    this.overlay.appendChild(verticalLine);
                }
            }
            
            // Center dot
            if (this.featureStates.centerDot) {
                const centerDot = document.createElement('div');
                centerDot.className = 'dot center-dot';
                
                if (isFullscreen) {
                    // Check if fullscreen center dot already exists
                    let existingDot = document.getElementById('fullscreen-center-dot');
                    if (!existingDot) {
                        // Find the fullscreen container
                        const fullscreenContainer = document.querySelector('.container.fullscreen');
                        
                        if (fullscreenContainer) {
                            // Add to fullscreen container instead of body
                            centerDot.style.cssText = `
                                position: fixed !important;
                                top: 50vh !important;
                                left: 50vw !important;
                                width: 8px !important;
                                height: 8px !important;
                                background-color: red !important;
                                border-radius: 50% !important;
                                transform: translate(-50%, -50%) !important;
                                z-index: 999999999 !important;
                                pointer-events: none !important;
                                opacity: 0.8 !important;
                                display: block !important;
                                visibility: visible !important;
                            `;
                            centerDot.id = 'fullscreen-center-dot';
                            
                            // Add to fullscreen container instead of body
                            fullscreenContainer.appendChild(centerDot);
                            centerDot.offsetHeight; // Force reflow
                        } else {
                            // Fallback to body if container not found
                            centerDot.style.cssText = `
                                position: fixed !important;
                                top: 50vh !important;
                                left: 50vw !important;
                                width: 8px !important;
                                height: 8px !important;
                                background-color: red !important;
                                border-radius: 50% !important;
                                transform: translate(-50%, -50%) !important;
                                z-index: 2147483647 !important;
                                pointer-events: none !important;
                                opacity: 0.8 !important;
                                display: block !important;
                                visibility: visible !important;
                            `;
                            centerDot.id = 'fullscreen-center-dot';
                            document.body.appendChild(centerDot);
                        }
                    }
                } else {
                    centerDot.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 8px;
                        height: 8px;
                        background-color: red;
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        pointer-events: none;
                        opacity: 0.8;
                    `;
                    this.overlay.appendChild(centerDot);
                }
            }
            
            // Corner circles - all four corners for text/document display
            if (this.featureStates.cornerCircles) {
                if (isFullscreen) {
                    // Create corner dots with viewport positioning for fullscreen
                    const cornerPositions = [
                        { class: 'top-left', top: '20px', left: '20px' },
                        { class: 'top-right', top: '20px', right: '20px' },
                        { class: 'bottom-left', bottom: '20px', left: '20px' },
                        { class: 'bottom-right', bottom: '20px', right: '20px' }
                    ];
                    
                    // Remove any existing fullscreen corner dots
                    document.querySelectorAll('.fullscreen-corner-dot').forEach(dot => dot.remove());
                    
                    // Find the fullscreen container
                    const fullscreenContainer = document.querySelector('.container.fullscreen');
                    
                    cornerPositions.forEach(pos => {
                        const dot = document.createElement('div');
                        dot.className = `dot corner-dot ${pos.class} fullscreen-corner-dot`;
                        dot.style.cssText = `
                            position: fixed !important;
                            width: 8px !important;
                            height: 8px !important;
                            background-color: red !important;
                            border-radius: 50% !important;
                            z-index: 999999999 !important;
                            pointer-events: none !important;
                            display: block !important;
                            visibility: visible !important;
                            opacity: 0.8 !important;
                            ${pos.top ? `top: ${pos.top} !important;` : ''}
                            ${pos.bottom ? `bottom: ${pos.bottom} !important;` : ''}
                            ${pos.left ? `left: ${pos.left} !important;` : ''}
                            ${pos.right ? `right: ${pos.right} !important;` : ''}
                        `;
                        
                        if (fullscreenContainer) {
                            fullscreenContainer.appendChild(dot);
                        } else {
                            document.body.appendChild(dot);
                        }
                        dot.offsetHeight; // Force reflow
                    });
                } else {
                    // Use the existing createCornerDot method for preview mode
                    this.createCornerDot('top-left');
                    this.createCornerDot('top-right');
                    this.createCornerDot('bottom-left');
                    this.createCornerDot('bottom-right');
                }
            }
        }
        // Support overlay for image files
        else if (this.currentFileType === 'image') {

            
            // Vertical guide line for images - single centered line
            if (this.verticalGuide.checked) {
                const verticalLine = document.createElement('div');
                verticalLine.className = 'vertical-guide';
                
                if (isFullscreen) {
                    // Remove any existing fullscreen line first
                    const existing = document.getElementById('fullscreen-vertical-line');
                    if (existing) existing.remove();
                    
                    // Find the fullscreen container
                    const fullscreenContainer = document.querySelector('.container.fullscreen');

                    
                    if (fullscreenContainer) {
                        // Add to fullscreen container instead of body
                        verticalLine.style.cssText = `
                            position: fixed !important;
                            left: 50vw !important;
                            top: 0 !important;
                            width: 2px !important;
                            height: 100vh !important;
                            background-color: #888 !important;
                            transform: translateX(-50%) !important;
                            pointer-events: none !important;
                            z-index: 999999999 !important;
                            opacity: 0.7 !important;
                            display: block !important;
                            visibility: visible !important;
                        `;
                        verticalLine.id = 'fullscreen-vertical-line';
                        
                        // Add to fullscreen container
                        fullscreenContainer.appendChild(verticalLine);
                        verticalLine.offsetHeight; // Force reflow
                        

                    } else {
                        // Fallback to body
                        verticalLine.style.cssText = `
                            position: fixed;
                            left: 50vw;
                            top: 0;
                            width: 2px;
                            height: 100vh;
                            background-color: #888;
                            transform: translateX(-50%);
                            pointer-events: none;
                            z-index: 2147483647;
                            opacity: 0.7;
                        `;
                        verticalLine.id = 'fullscreen-vertical-line';
                        document.body.appendChild(verticalLine);

                    }
                } else {
                    // In preview mode, add to overlay with proper relative positioning
                    verticalLine.style.cssText = `
                        position: absolute;
                        left: 50%;
                        top: 0;
                        width: 2px;
                        height: 100%;
                        background-color: #888;
                        transform: translateX(-50%);
                        pointer-events: none;
                        opacity: 0.7;
                    `;
                    this.overlay.appendChild(verticalLine);
                }
            }
            
            // Center dot
            if (this.centerDot.checked) {
                const centerDot = document.createElement('div');
                centerDot.className = 'dot center-dot';
                
                if (isFullscreen) {
                    // Check if fullscreen center dot already exists
                    let existingDot = document.getElementById('fullscreen-center-dot');
                    if (!existingDot) {
                        // Find the fullscreen container
                        const fullscreenContainer = document.querySelector('.container.fullscreen');

                        
                        if (fullscreenContainer) {
                            // Add to fullscreen container instead of body
                            centerDot.style.cssText = `
                                position: fixed !important;
                                top: 50vh !important;
                                left: 50vw !important;
                                width: 8px !important;
                                height: 8px !important;
                                background-color: red !important;
                                border-radius: 50% !important;
                                transform: translate(-50%, -50%) !important;
                                z-index: 999999999 !important;
                                pointer-events: none !important;
                                opacity: 0.8 !important;
                                display: block !important;
                                visibility: visible !important;
                            `;
                            centerDot.id = 'fullscreen-center-dot';
                            
                            // Add to fullscreen container instead of body
                            fullscreenContainer.appendChild(centerDot);
                            centerDot.offsetHeight; // Force reflow
                            

                        } else {
                            // Fallback to body if container not found
                            centerDot.style.cssText = `
                                position: fixed !important;
                                top: 50vh !important;
                                left: 50vw !important;
                                width: 8px !important;
                                height: 8px !important;
                                background-color: #007acc !important;
                                border-radius: 50% !important;
                                transform: translate(-50%, -50%) !important;
                                z-index: 2147483647 !important;
                                pointer-events: none !important;
                                opacity: 0.8 !important;
                                display: block !important;
                                visibility: visible !important;
                            `;
                            centerDot.id = 'fullscreen-center-dot';
                            document.body.appendChild(centerDot);

                        }
                        
                    }
                } else {
                    centerDot.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 8px;
                        height: 8px;
                        background-color: red;
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        pointer-events: none;
                        opacity: 0.8;
                    `;
                    this.overlay.appendChild(centerDot);
                }

            }
            
            // Corner circles - all four corners for image display
            if (this.cornerCircles.checked) {
                if (isFullscreen) {
                    // Create corner dots with viewport positioning for fullscreen, add directly to body
                    const cornerPositions = [
                        { class: 'top-left', top: '20px', left: '20px' },
                        { class: 'top-right', top: '20px', right: '20px' },
                        { class: 'bottom-left', bottom: '20px', left: '20px' },
                        { class: 'bottom-right', bottom: '20px', right: '20px' }
                    ];
                    
                    // Remove any existing fullscreen corner dots
                    document.querySelectorAll('.fullscreen-corner-dot').forEach(dot => dot.remove());
                    
                    // Find the fullscreen container
                    const fullscreenContainer = document.querySelector('.container.fullscreen');

                    
                    cornerPositions.forEach(pos => {
                        const dot = document.createElement('div');
                        dot.className = `dot corner-dot ${pos.class} fullscreen-corner-dot`;
                        dot.style.cssText = `
                            position: fixed !important;
                            width: 8px !important;
                            height: 8px !important;
                            background-color: red !important;
                            border-radius: 50% !important;
                            z-index: 999999999 !important;
                            pointer-events: none !important;
                            display: block !important;
                            visibility: visible !important;
                            opacity: 0.8 !important;
                            ${pos.top ? `top: ${pos.top} !important;` : ''}
                            ${pos.bottom ? `bottom: ${pos.bottom} !important;` : ''}
                            ${pos.left ? `left: ${pos.left} !important;` : ''}
                            ${pos.right ? `right: ${pos.right} !important;` : ''}
                        `;
                        
                        if (fullscreenContainer) {
                            fullscreenContainer.appendChild(dot);
                        } else {
                            document.body.appendChild(dot);
                        }
                        dot.offsetHeight; // Force reflow
                    });
                } else {
                    // Use the existing createCornerDot method for preview mode
                    this.createCornerDot('top-left');
                    this.createCornerDot('top-right');
                    this.createCornerDot('bottom-left');
                    this.createCornerDot('bottom-right');
                }
            }
        }
    }
    
    createCornerDot(position, pageElement = null) {
        const dot = document.createElement('div');
        dot.className = `dot corner-dot ${position}`;
        
        if (pageElement) {
            const pageRect = pageElement.getBoundingClientRect();
            const containerRect = this.pdfContainer.getBoundingClientRect();
            
            const relativeLeft = pageRect.left - containerRect.left;
            const relativeTop = pageRect.top - containerRect.top;
            
            switch (position) {
                case 'top-left':
                    dot.style.left = `${relativeLeft}px`;
                    dot.style.top = `${relativeTop}px`;
                    break;
                case 'top-right':
                    dot.style.left = `${relativeLeft + pageRect.width}px`;
                    dot.style.top = `${relativeTop}px`;
                    break;
                case 'bottom-left':
                    dot.style.left = `${relativeLeft}px`;
                    dot.style.top = `${relativeTop + pageRect.height}px`;
                    break;
                case 'bottom-right':
                    dot.style.left = `${relativeLeft + pageRect.width}px`;
                    dot.style.top = `${relativeTop + pageRect.height}px`;
                    break;
            }
        }
        
        this.overlay.appendChild(dot);
    }
    
    validatePageRange() {
        const start = parseInt(this.startPage.value);
        const end = parseInt(this.endPage.value);
        
        if (start > end) {
            this.endPage.value = start;
        }
        
        if (start < 1) {
            this.startPage.value = 1;
        }
        
        if (end > this.totalPages) {
            this.endPage.value = this.totalPages;
        }
        
        // Update navigation after range validation
        this.updateNavigationButtons();
    }
    
    validateInterval() {
        const value = parseFloat(this.interval.value);
        if (value > 60.00) {
            this.interval.value = 60.00;
        }
    }
    
    validateAudioFrequency() {
        const value = parseFloat(this.audioFrequency.value);
        if (value > 60.00) {
            this.audioFrequency.value = 60.00;
        }
    }

    toggleDisplayMode() {
        // Only allow toggling for text files
        if (this.currentFileType === 'txt') {
            // Toggle between word and line mode for text files only
            this.displayMode = this.displayMode === 'word' ? 'line' : 'word';
            
            // Update button text and title for text files
            this.displayModeBtn.textContent = this.displayMode === 'word' ? 'Word' : 'Line';
            this.displayModeBtn.title = `Toggle to ${this.displayMode === 'word' ? 'Line' : 'Word'} mode`;
            
            // Update the page controls for all file types
            this.updatePageControlsForCurrentFile();
            
            // Save settings to localStorage
            this.saveSettings();
            
            // If not playing, update display
            if (!this.isPlaying) {
                this.updateDisplay();
            }
        }
        // For non-text files, button shows "Page" and doesn't toggle
    }

    updateDisplayModeButton() {
        if (this.currentFileType === 'txt') {
            // For text files, show Word/Line and allow toggling
            this.displayModeBtn.textContent = this.displayMode === 'word' ? 'Word' : 'Line';
            this.displayModeBtn.title = `Toggle to ${this.displayMode === 'word' ? 'Line' : 'Word'} mode`;
            this.displayModeBtn.disabled = false;
            // Disable Pages dropdown for text files
            this.pageView.disabled = true;
        } else if (this.currentFileType === 'docx') {
            // For DOCX files, show "Pages" and disable both toggles
            this.displayModeBtn.textContent = 'Pages';
            this.displayModeBtn.title = 'Page view mode';
            this.displayModeBtn.disabled = true;
            // Disable Pages dropdown for DOCX files
            this.pageView.disabled = true;
        } else if (this.currentFileType === 'pdf' || this.currentFileType === 'epub' || 
                  this.currentFileType === 'mobi' || this.currentFileType === 'image') {
            // For PDF, EPUB, MOBI, and image files, show "Page" and disable display mode toggle
            this.displayModeBtn.textContent = 'Pages';
            this.displayModeBtn.title = 'Page view mode';
            this.displayModeBtn.disabled = true;
            // Enable Pages dropdown for these file types
            this.pageView.disabled = false;
        } else {
            // Default state when no file is loaded
            this.displayModeBtn.textContent = 'Word';
            this.displayModeBtn.title = 'Display mode';
            this.displayModeBtn.disabled = true;
            // Disable Pages dropdown when no file is loaded
            this.pageView.disabled = true;
        }
    }
    
    async toggleSlideshow() {
        if (this.isPlaying) {
            this.stopSlideshow();
        } else {
            await this.startSlideshow();
        }
    }
    
    async startSlideshow() {
        if (!this.pdfDoc && !this.textContent && this.imageFiles.length === 0) return;

        this.isPlaying = true;
        this.playBtn.textContent = 'Stop';

        // Enter fullscreen
        await this.enterFullscreen();

        // Start audio if enabled
        if (this.featureStates.audioEnabled) {
            this.startAudio();
        }

        // Helper to get duration value in ms
        const getDurationMs = () => {
            if (this.duration && !isNaN(parseFloat(this.duration.value))) {
                return Math.max(0, Math.min(1, parseFloat(this.duration.value))) * 1000;
            }
            return 0;
        };

        // Helper to get interval value in ms
        const getIntervalMs = () => {
            if (this.interval && !isNaN(parseFloat(this.interval.value))) {
                return Math.max(0, parseFloat(this.interval.value)) * 1000;
            }
            return 0;
        };

        // Generalized slideshow logic for all file types
        const runSlideshow = async (nextFn, displayFn) => {
            // Show first slide
            if (displayFn) await displayFn();
            const loop = async () => {
                // Show slide for Duration (if set)
                const durationMs = getDurationMs();
                if (durationMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, durationMs));
                }
                // Wait for Interval (if set)
                const intervalMs = getIntervalMs();
                if (intervalMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, intervalMs));
                }
                // Next slide
                await nextFn();
                // Continue if still playing
                if (this.isPlaying) {
                    this.slideInterval = setTimeout(loop, 0);
                }
            };
            this.slideInterval = setTimeout(loop, 0);
        };

        if (this.currentFileType === 'image') {
            // Image mode: set starting position based on mode
            if (this.featureStates.randomizedOrder) {
                this.generateRandomizedSequence();
                this.currentImageIndex = this.randomizedSequence[0];
            } else if (this.featureStates.reverseOrder) {
                const endImage = parseInt(this.endPage.value) - 1;
                this.currentImageIndex = Math.min(this.imageFiles.length - 1, Math.max(0, endImage));
            } else {
                const startImage = parseInt(this.startPage.value) - 1;
                this.currentImageIndex = Math.max(0, startImage);
            }
            this.currentPage = this.currentImageIndex + 1;
            await runSlideshow(async () => {
                await this.nextImageSlide();
                setTimeout(() => { this.updateOverlay(); }, 50);
            }, async () => { await this.displayImages(); });
        } else if (this.currentFileType === 'txt') {
            if (this.displayMode === 'line') {
                if (this.featureStates.randomizedOrder) {
                    this.generateRandomizedSequence();
                    this.currentLineIndex = Math.max(0, Math.min(this.textLines.length - 1, this.randomizedSequence[0]));
                } else if (this.featureStates.reverseOrder) {
                    const endLine = parseInt(this.endPage.value) - 1;
                    this.currentLineIndex = Math.max(0, Math.min(this.textLines.length - 1, endLine));
                } else {
                    const startLine = parseInt(this.startPage.value) - 1;
                    this.currentLineIndex = Math.max(0, startLine);
                }
            } else {
                if (this.featureStates.randomizedOrder) {
                    this.generateRandomizedSequence();
                    this.currentWordIndex = Math.max(0, Math.min(this.textWords.length - 1, this.randomizedSequence[0]));
                } else if (this.featureStates.reverseOrder) {
                    const endWord = parseInt(this.endPage.value) - 1;
                    this.currentWordIndex = Math.max(0, Math.min(this.textWords.length - 1, endWord));
                } else {
                    const startWord = parseInt(this.startPage.value) - 1;
                    this.currentWordIndex = Math.max(0, startWord);
                }
            }
            await runSlideshow(() => this.nextText(), () => this.displayCurrentText());
        } else if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            if (this.featureStates.randomizedOrder) {
                this.generateRandomizedSequence();
                this.currentPage = this.randomizedSequence[0] + 1;
            } else if (this.featureStates.reverseOrder) {
                this.currentPage = parseInt(this.endPage.value);
            } else {
                this.currentPage = parseInt(this.startPage.value);
            }
            await runSlideshow(() => this.nextDocumentSlide(), () => this.updateDisplay());
        } else {
            if (this.featureStates.randomizedOrder) {
                this.generateRandomizedSequence();
                this.currentPage = this.randomizedSequence[0] + 1;
            } else if (this.featureStates.reverseOrder) {
                this.currentPage = parseInt(this.endPage.value);
            } else {
                this.currentPage = parseInt(this.startPage.value);
            }
            await runSlideshow(() => this.nextSlide(), () => this.updateDisplay());
        }
    }
    
    stopSlideshow() {
        this.isPlaying = false;
        this.isPaused = false;
        this.playBtn.textContent = 'Play';
        
        // Clear interval
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
        
        // Stop audio
        this.stopAudio();
        
        // Exit fullscreen only if we're currently in fullscreen
        // This prevents race conditions when fullscreen is already being exited
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement || 
                               document.msFullscreenElement);
        
        if (isFullscreen) {
            this.exitFullscreen();
        }
    }
    
    pauseSlideshow() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.isPaused = true;
        
        // Clear the interval timer but stay in fullscreen
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
    
    resumeSlideshow() {
        if (!this.isPlaying || !this.isPaused) return;
        
        this.isPaused = false;
        
        // Restart the interval timer based on file type
        const intervalMs = parseFloat(this.interval.value) * 1000;
        
        if (this.currentFileType === 'txt') {
            this.slideInterval = setInterval(() => {
                this.nextText();
            }, intervalMs);
        } else if (this.currentFileType === 'image') {
            this.slideInterval = setInterval(async () => {
                await this.nextImageSlide();
                // Ensure overlay is updated after each slide change
                setTimeout(() => {
                    this.updateOverlay();
                }, 50);
            }, intervalMs);
        } else if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            this.slideInterval = setInterval(() => {
                this.nextDocumentSlide();
            }, intervalMs);
        } else {
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, intervalMs);
        }
    }
    
    async displayCurrentWord() {
        if (this.currentWordIndex >= this.textWords.length) {
            this.currentWordIndex = 0;
        }
        
        const word = this.textWords[this.currentWordIndex];
        
        this.pdfDisplay.innerHTML = '';
        this.pdfDisplay.classList.remove('two-pages', 'three-pages');
        
        const wordDisplay = document.createElement('div');
        wordDisplay.className = 'word-display';
        wordDisplay.textContent = word;
        
        // Apply transformations
        let transforms = [];
        if (this.featureStates.rotateContent) {
            transforms.push('rotate(180deg)');
        }
        if (this.featureStates.mirrorContent) {
            transforms.push('scaleX(-1)');
        }
        if (transforms.length > 0) {
            wordDisplay.style.transform = transforms.join(' ');
        }
        
        this.pdfDisplay.appendChild(wordDisplay);
        
        // Update overlay to show center dot and corner circles for text files
        this.updateOverlay();
    }
    

    async displayCurrentLine() {
        if (this.currentLineIndex >= this.textLines.length) {
            this.currentLineIndex = 0;
        }

        const line = this.textLines[this.currentLineIndex];

        this.pdfDisplay.innerHTML = '';
        this.pdfDisplay.classList.remove('two-pages', 'three-pages');

        const lineDisplay = document.createElement('div');
        lineDisplay.className = 'line-display';
        lineDisplay.textContent = line;
        lineDisplay.style.whiteSpace = 'pre-wrap'; // Allow text wrapping
        lineDisplay.style.wordWrap = 'break-word'; // Break long words if needed

        // Apply transformations
        let transforms = [];
        if (this.featureStates.rotateContent) {
            transforms.push('rotate(180deg)');
        }
        if (this.featureStates.mirrorContent) {
            transforms.push('scaleX(-1)');
        }
        if (transforms.length > 0) {
            lineDisplay.style.transform = transforms.join(' ');
        }

        this.pdfDisplay.appendChild(lineDisplay);

        // Update overlay to show center dot and corner circles for text files
        this.updateOverlay();
    }
    async nextTextWord() {
        const startWord = parseInt(this.startPage.value) - 1;
        const endWord = parseInt(this.endPage.value) - 1;
        
    if (this.featureStates.randomizedOrder) {
            // Randomized mode: move to next in randomized sequence
            this.currentRandomIndex++;
            if (this.currentRandomIndex >= this.randomizedSequence.length) {
                // Generate new randomized sequence and start over
                this.generateRandomizedSequence();
                this.currentRandomIndex = 0;
            }
            this.currentWordIndex = this.randomizedSequence[this.currentRandomIndex];
    } else if (this.featureStates.reverseOrder) {
            // Reverse mode: go backwards
            this.currentWordIndex--;
            if (this.currentWordIndex < startWord) {
                this.currentWordIndex = endWord; // Loop back to end
            }
        } else {
            // Normal mode: go forwards
            this.currentWordIndex++;
            if (this.currentWordIndex > endWord) {
                this.currentWordIndex = startWord;
            }
        }
        
        await this.displayCurrentText();
    }

    async nextTextLine() {
        const startLine = parseInt(this.startPage.value) - 1;
        const endLine = parseInt(this.endPage.value) - 1;

    if (this.featureStates.randomizedOrder) {
            // Randomized mode: move to next in randomized sequence
            this.currentRandomIndex++;
            if (this.currentRandomIndex >= this.randomizedSequence.length) {
                // Generate new randomized sequence and start over
                this.generateRandomizedSequence();
                this.currentRandomIndex = 0;
            }
            this.currentLineIndex = this.randomizedSequence[this.currentRandomIndex];
    } else if (this.featureStates.reverseOrder) {
            // Reverse mode: go backwards
            this.currentLineIndex--;
            if (this.currentLineIndex < startLine) {
                this.currentLineIndex = endLine; // Loop back to end
            }
        } else {
            // Normal mode: go forwards
            this.currentLineIndex++;
            if (this.currentLineIndex > endLine) {
                this.currentLineIndex = startLine;
            }
        }

        await this.displayCurrentLine();
    }

    async nextText() {
        if (this.displayMode === 'line') {
            await this.nextTextLine();
        } else {
            await this.nextTextWord();
        }
    }

    async displayCurrentText() {
        if (this.displayMode === 'line') {
            await this.displayCurrentLine();
        } else {
            await this.displayCurrentWord();
        }
    }

    async nextSlide() {
        if (this.currentFileType === 'image') {
            await this.nextImageSlide();
            return;
        }
        
        const startPage = parseInt(this.startPage.value);
        const endPage = parseInt(this.endPage.value);
        const viewMode = this.getViewMode();
        
    if (this.featureStates.randomizedOrder) {
            // Randomized mode: move to next in randomized sequence
            this.currentRandomIndex++;
            if (this.currentRandomIndex >= this.randomizedSequence.length) {
                // Generate new randomized sequence and start over
                this.generateRandomizedSequence();
                this.currentRandomIndex = 0;
            }
            this.currentPage = this.randomizedSequence[this.currentRandomIndex] + 1; // Convert back to 1-based
    } else if (this.featureStates.reverseOrder) {
            // Reverse mode: go backwards
            this.currentPage -= viewMode;
            if (this.currentPage < startPage) {
                this.currentPage = endPage; // Loop back to end
            }
        } else {
            // Normal mode: go forwards
            this.currentPage += viewMode;
            if (this.currentPage > endPage) {
                this.currentPage = startPage;
            }
        }
        
        await this.updateDisplay();
    }
    
    async nextImageSlide() {
        const startIndex = parseInt(this.startPage.value) - 1; // Convert to 0-based index
        const endIndex = parseInt(this.endPage.value) - 1;   // Convert to 0-based index
        const viewMode = this.getViewMode();
        
    if (this.featureStates.randomizedOrder) {
            // Randomized mode: move to next in randomized sequence
            this.currentRandomIndex++;
            if (this.currentRandomIndex >= this.randomizedSequence.length) {
                // Generate new randomized sequence and start over
                this.generateRandomizedSequence();
                this.currentRandomIndex = 0;
            }
            this.currentImageIndex = this.randomizedSequence[this.currentRandomIndex];
    } else if (this.featureStates.reverseOrder) {
            // Reverse mode: go backwards by page count
            this.currentImageIndex -= viewMode;
            if (this.currentImageIndex < startIndex) {
                // Calculate how many complete "pages" fit in the range
                const rangeSize = endIndex - startIndex + 1;
                const completePages = Math.floor(rangeSize / viewMode);
                this.currentImageIndex = startIndex + (completePages - 1) * viewMode;
                
                // If we still go below start, just go to the last valid starting position
                if (this.currentImageIndex < startIndex) {
                    this.currentImageIndex = Math.max(startIndex, endIndex - viewMode + 1);
                }
            }
        } else {
            // Normal mode: go forwards by page count
            this.currentImageIndex += viewMode;
            if (this.currentImageIndex > endIndex) {
                this.currentImageIndex = startIndex; // Loop back to start
            }
        }
        
        // Ensure we don't go beyond the available images
        this.currentImageIndex = Math.max(0, Math.min(this.currentImageIndex, this.imageFiles.length - 1));
        
        this.currentPage = this.currentImageIndex + 1;
        await this.displayImages();
    }

    async nextDocumentSlide() {
        const startPage = parseInt(this.startPage.value);
        const endPage = parseInt(this.endPage.value);
        
    if (this.featureStates.randomizedOrder) {
            // Randomized mode: move to next in randomized sequence
            this.currentRandomIndex++;
            if (this.currentRandomIndex >= this.randomizedSequence.length) {
                // Generate new randomized sequence and start over
                this.generateRandomizedSequence();
                this.currentRandomIndex = 0;
            }
            this.currentPage = this.randomizedSequence[this.currentRandomIndex] + 1; // Convert back to 1-based
    } else if (this.featureStates.reverseOrder) {
            // Reverse mode: go backwards
            this.currentPage--;
            if (this.currentPage < startPage) {
                this.currentPage = endPage; // Loop back to end
            }
        } else {
            // Normal mode: go forwards
            this.currentPage++;
            if (this.currentPage > endPage) {
                this.currentPage = startPage; // Loop back to start
            }
        }
        
        await this.updateDisplay();
    }
    
    async enterFullscreen() {
        const element = this.container;
        
        if (element.requestFullscreen) {
            await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            await element.msRequestFullscreen();
        }
        
        this.container.classList.add('fullscreen');
        
        // Update overlay after entering fullscreen to ensure proper positioning
        setTimeout(() => {

            this.updateOverlay();
        }, 200); // Slightly longer delay to ensure fullscreen is fully active
    }
    
    exitFullscreen() {
        // Check if we're actually in fullscreen before trying to exit
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement || 
                               document.msFullscreenElement);
        
        if (!isFullscreen) {
            // Already exited fullscreen, just clean up our classes
            this.container.classList.remove('fullscreen');
            return;
        }
        
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            // Note: Don't remove fullscreen class here - let handleFullscreenChange() do it
            // to avoid race conditions and ensure proper UI restoration
        } catch (error) {
            console.warn('Error exiting fullscreen:', error);
            // If API call failed, manually clean up the UI state
            this.container.classList.remove('fullscreen');
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement || 
                               document.msFullscreenElement);
        // Always apply transparency on fullscreen change
        this.applyTransparency();
        // Handle exiting fullscreen
        if (!isFullscreen) {
            // Remove the fullscreen class from container
            this.container.classList.remove('fullscreen');
            // Stop slideshow if it's playing
            if (this.isPlaying) {
                this.stopSlideshow();
            }
            // Clean up fullscreen overlay elements
            const fullscreenDot = document.getElementById('fullscreen-center-dot');
            const fullscreenLine = document.getElementById('fullscreen-vertical-line');
            if (fullscreenDot) fullscreenDot.remove();
            if (fullscreenLine) fullscreenLine.remove();
            document.querySelectorAll('.fullscreen-corner-dot').forEach(dot => dot.remove());
            // Ensure UI is properly restored by resetting key styles
            this.container.style.display = 'flex';
            this.container.style.position = 'static';
            this.container.style.width = '';
            this.container.style.height = '';
            // Make sure the control bar is visible
            const controlBar = document.querySelector('.control-bar');
            if (controlBar) {
                controlBar.style.display = '';
            }
            // Force a complete UI refresh
            setTimeout(() => {
                this.updateDisplay();
                this.updateOverlay();
            }, 150); // Slightly longer delay for complete restoration
        } else {
            // Entering fullscreen - just update overlay
            setTimeout(() => {
                this.updateOverlay();
            }, 100);
        }
    }
    

    
    startAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.oscillator = this.audioContext.createOscillator();
            this.gainNode = this.audioContext.createGain();
            
            // Get frequency from input field, default to 4.0 if invalid
            const frequency = parseFloat(this.audioFrequency.value) || 4.0;
            this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            this.oscillator.type = 'sine';
            
            // Set volume to 100% (1.0)
            this.gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
            
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            this.oscillator.start();
        } catch (error) {
            console.error('Error starting audio:', error);
        }
    }
    
    stopAudio() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.gainNode = null;
    }
    
    handleKeydown(event) {
        // Handle Escape key
        if (event.key === 'Escape' && this.isPlaying) {
            event.preventDefault();
            this.stopSlideshow();
            return;
        }
        
        // Check if we're in fullscreen/playing mode
        if (this.isPlaying) {
            // Handle Pause/Break key - toggle pause/resume
            // Check multiple ways the Pause key might be detected
            const isPauseKey = event.key === 'Pause' || 
                             event.key === 'Break' || 
                             event.code === 'Pause' || 
                             event.code === 'Break' ||
                             event.keyCode === 19; // Pause/Break keyCode
            
            if (isPauseKey) {
                event.preventDefault();
                if (this.isPaused) {
                    this.resumeSlideshow();
                } else {
                    this.pauseSlideshow();
                }
                return;
            }
            
            // Handle Enter key - resume if paused
            if (event.key === 'Enter' && this.isPaused) {
                event.preventDefault();
                this.resumeSlideshow();
                return;
            }
            
            // Fullscreen mode navigation
            switch(event.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    this.goBackInFullscreen();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Spacebar
                    event.preventDefault();
                    this.advanceToNextInterval();
                    break;
            }
        } else {
            // Normal mode - trigger toolbar buttons
            switch(event.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    event.preventDefault();
                    if (!this.prevBtn.disabled) {
                        this.previousPage();
                    }
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    event.preventDefault();
                    if (!this.nextBtn.disabled) {
                        this.nextPage();
                    }
                    break;
            }
        }
    }
    
    handleMouseClick(event) {
        // Only handle mouse clicks in fullscreen mode
        if (!this.isPlaying) return;
        
        event.preventDefault();
        
        // Left mouse button (button 0)
        if (event.button === 0) {
            this.goBackInFullscreen();
        }
        // Right mouse button (button 2)
        else if (event.button === 2) {
            this.advanceToNextInterval();
        }
    }
    
    handleContextMenu(event) {
        // Prevent context menu in fullscreen mode
        if (this.isPlaying) {
            event.preventDefault();
        }
    }
    
    goBackInFullscreen() {
        // Navigate back one page or word depending on file type
        // Loop to end if at the beginning
        
        if (this.currentFileType === 'txt') {
            // Go back one word, loop to end if at start
            const startWord = parseInt(this.startPage.value) - 1;
            const endWord = parseInt(this.endPage.value) - 1;
            this.currentWordIndex--;
            if (this.currentWordIndex < startWord) {
                this.currentWordIndex = endWord; // Loop to end
            }
            this.displayCurrentWord();
        } else if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            // Go back one page for documents, loop to end if at start
            const startPage = parseInt(this.startPage.value);
            const endPage = parseInt(this.endPage.value);
            this.currentPage--;
            if (this.currentPage < startPage) {
                this.currentPage = endPage; // Loop to end
            }
            this.updateDisplay();
        } else if (this.pdfDoc) {
            // Go back by viewMode pages for PDFs, loop to end if at start
            const startPage = parseInt(this.startPage.value);
            const endPage = parseInt(this.endPage.value);
            const viewMode = this.getViewMode();
            this.currentPage -= viewMode;
            if (this.currentPage < startPage) {
                this.currentPage = endPage; // Loop to end
            }
            this.updateDisplay();
        }
    }
    
    advanceToNextInterval() {
        // Immediately trigger the next interval progression
        // If reverseOrder is enabled in fullscreen, go forward chronologically and loop to start at end
        const isReverse = this.reverseOrder.checked;
        
        if (this.currentFileType === 'txt') {
            if (isReverse) {
                // In reverse mode, advance chronologically forward and loop to start at end
                const startWord = parseInt(this.startPage.value) - 1;
                const endWord = parseInt(this.endPage.value) - 1;
                this.currentWordIndex++;
                if (this.currentWordIndex > endWord) {
                    this.currentWordIndex = startWord; // Loop to start
                }
                this.displayCurrentWord();
            } else {
                this.nextText();
            }
        } else if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            if (isReverse) {
                // In reverse mode, advance chronologically forward and loop to start at end
                const startPage = parseInt(this.startPage.value);
                const endPage = parseInt(this.endPage.value);
                this.currentPage++;
                if (this.currentPage > endPage) {
                    this.currentPage = startPage; // Loop to start
                }
                this.updateDisplay();
            } else {
                this.nextDocumentSlide();
            }
        } else if (this.pdfDoc) {
            if (isReverse) {
                // In reverse mode, advance chronologically forward by viewMode pages and loop to start at end
                const startPage = parseInt(this.startPage.value);
                const endPage = parseInt(this.endPage.value);
                const viewMode = this.getViewMode();
                this.currentPage += viewMode;
                if (this.currentPage > endPage) {
                    this.currentPage = startPage; // Loop to start
                }
                this.updateDisplay();
            } else {
                this.nextSlide();
            }
        }
    }
    
    // Navigation button functions
    async previousPage() {
        if (this.currentFileType === 'txt') {
            // Text file navigation
            if (this.displayMode === 'line') {
                this.currentLineIndex--;
                if (this.currentLineIndex < 0) {
                    this.currentLineIndex = 0;
                }
                await this.displayCurrentLine();
            } else {
                this.currentWordIndex--;
                if (this.currentWordIndex < 0) {
                    this.currentWordIndex = 0;
                }
                await this.displayCurrentWord();
            }
            return;
        }
        
        if (this.currentFileType === 'image') {
            // Image navigation - move by page count
            const viewMode = this.getViewMode();
            this.currentImageIndex -= viewMode;
            if (this.currentImageIndex < 0) {
                this.currentImageIndex = 0;
            }
            this.currentPage = this.currentImageIndex + 1;
            
            await this.displayImages();
            this.updateNavigationButtons();
            return;
        }
        
        if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            // Document navigation
            this.currentPage--;
            if (this.currentPage < 1) {
                this.currentPage = 1;
            }
            this.updateNavigationButtons();
            await this.updateDisplay();
            return;
        }
        
        if (!this.pdfDoc) return;
        
        const viewMode = this.getViewMode();
        this.currentPage -= viewMode;
        
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        
        this.updateNavigationButtons();
        await this.updateDisplay();
    }
    
    async nextPage() {
        if (this.currentFileType === 'txt') {
            // Text file navigation
            if (this.displayMode === 'line') {
                this.currentLineIndex++;
                if (this.currentLineIndex >= this.textLines.length) {
                    this.currentLineIndex = this.textLines.length - 1;
                }
                await this.displayCurrentLine();
            } else {
                this.currentWordIndex++;
                if (this.currentWordIndex >= this.textWords.length) {
                    this.currentWordIndex = this.textWords.length - 1;
                }
                await this.displayCurrentWord();
            }
            return;
        }
        
        if (this.currentFileType === 'image') {
            // Image navigation - move by page count
            const viewMode = this.getViewMode();
            this.currentImageIndex += viewMode;
            if (this.currentImageIndex >= this.imageFiles.length) {
                this.currentImageIndex = this.imageFiles.length - 1;
            }
            this.currentPage = this.currentImageIndex + 1;
            
            await this.displayImages();
            this.updateNavigationButtons();
            return;
        }
        
        if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            // Document navigation
            this.currentPage++;
            if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages;
            }
            this.updateNavigationButtons();
            await this.updateDisplay();
            return;
        }
        
        if (!this.pdfDoc) return;
        
        const viewMode = this.getViewMode();
        this.currentPage += viewMode;
        
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages - viewMode + 1);
        }
        
        this.updateNavigationButtons();
        await this.updateDisplay();
    }
    
    updateNavigationButtons() {
        if (this.currentFileType === 'txt') {
            // Disable navigation buttons for text mode only
            this.prevBtn.disabled = true;
            this.nextBtn.disabled = true;
            return;
        }
        
        if (this.currentFileType === 'image') {
            // Enable navigation buttons for image mode
            const viewMode = this.getViewMode();
            this.prevBtn.disabled = this.currentImageIndex <= 0;
            this.nextBtn.disabled = this.currentImageIndex + viewMode >= this.imageFiles.length;
            return;
        }
        
        if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            // Enable navigation buttons for document mode
            this.prevBtn.disabled = this.currentPage <= 1;
            this.nextBtn.disabled = this.currentPage >= this.totalPages;
            return;
        }
        
        if (!this.pdfDoc) {
            this.prevBtn.disabled = true;
            this.nextBtn.disabled = true;
            return;
        }
        
        const viewMode = this.getViewMode();
        
        // Enable/disable previous button
        this.prevBtn.disabled = this.currentPage <= 1;
        
        // Enable/disable next button
        this.nextBtn.disabled = this.currentPage + viewMode - 1 >= this.totalPages;
    }
    
    // Helper methods for image handling
    isImageFile(fileName) {
        const imageExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'];
        return imageExtensions.some(ext => fileName.endsWith(ext));
    }
    
    isImageType(fileType) {
        const imageTypes = ['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
        return imageTypes.includes(fileType);
    }
    
    async handleFolderSelect(event) {
        const files = Array.from(event.target.files);
        if (!files.length) return;
        
        // Filter for image files only
        const imageFiles = files.filter(file => 
            this.isImageFile(file.name.toLowerCase()) || this.isImageType(file.type)
        );
        
        if (imageFiles.length === 0) {
            alert('No image files (WebP, JPG, PNG, GIF, SVG) found in the selected folder.');
            return;
        }
        
        try {
            this.showLoading();
            
            // Sort the new images
            const sortedNewImages = imageFiles.sort((a, b) => a.name.localeCompare(b.name));
            
            // Add images to existing collection or create new collection
            if (this.currentFileType === 'image' && this.imageFiles.length > 0) {
                // Add new images to existing collection
                this.imageFiles = [...this.imageFiles, ...sortedNewImages];
                this.currentFiles = this.imageFiles;
                
                // Display the first new image
                const firstNewImageIndex = this.imageFiles.length - sortedNewImages.length;
                this.currentImageIndex = firstNewImageIndex;
                await this.loadImageFile(this.imageFiles[firstNewImageIndex]);
                
                // Update totals
                this.totalPages = this.imageFiles.length;
                this.currentPage = this.currentImageIndex + 1;
                
                // Show success message for added images
                setTimeout(() => {
                    alert(
                        `✅ Added ${sortedNewImages.length} images to collection! Total: ${this.imageFiles.length}\n\n` +
                        `🔒 Privacy Protected: No files were uploaded to any server\n` +
                        `⚡ Performance: All images cached locally for instant access\n` +
                        `🎬 Ready: Click 'Play' to start fullscreen slideshow\n\n` +
                        `Use Previous/Next buttons to browse all images.`
                    );
                }, 500);
            } else {
                // First time loading images or switching from different file type
                // Clean up any existing URLs when switching file types
                this.cleanupImageUrls();
                
                this.currentFileType = 'image';
                this.imageFiles = sortedNewImages;
                this.currentFiles = this.imageFiles;
                this.currentImageIndex = 0;
                this.totalPages = this.imageFiles.length;
                this.currentPage = 1;
                
                // Pre-load the first image only, others will be loaded on demand
                await this.loadImageFile(this.imageFiles[0]);
                
                // Show success message for new collection
                setTimeout(() => {
                    alert(
                        `✅ Successfully loaded ${sortedNewImages.length} images locally!\n\n` +
                        `🔒 Privacy Protected: No files were uploaded to any server\n` +
                        `⚡ Performance: All images cached locally for instant access\n` +
                        `🎬 Ready: Click 'Play' to start fullscreen slideshow\n\n` +
                        `Use Previous/Next buttons to browse images manually.`
                    );
                }, 500);
            }
            
            // Update navigation buttons
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Error loading folder:', error);
            alert('Error loading images from folder: ' + error.message);
            this.hideLoading();
        }
    }
    
    async loadVisionBoard() {
        try {
            this.showLoading();
            
            // Clean up any existing URLs when switching file types
            this.cleanupImageUrls();
            
            // Define the image directory path - use current origin to avoid canonical URL issues
            const imgDir = `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '')}/img/`;
            
            // Try to read the _index.txt file for the list of images
            let imageFilenames = [];
            
            try {
                const indexUrl = imgDir + '_index.txt';
                console.log(`Attempting to read index file: ${indexUrl}`);
                const indexResponse = await fetch(indexUrl);
                if (indexResponse.ok) {
                    const indexText = await indexResponse.text();
                    // Parse the index file and extract filenames
                    const lines = indexText.split('\n');
                    let inImageSection = false;
                    
                    for (const line of lines) {
                        const trimmed = line.trim();
                        
                        // Check if we've reached the "Image Files:" section
                        if (trimmed === 'Image Files:') {
                            inImageSection = true;
                            continue;
                        }
                        
                        // Check if we've reached a new section (starts with uppercase letter followed by colon)
                        if (inImageSection && /^[A-Z][^:]*:/.test(trimmed)) {
                            inImageSection = false;
                            continue;
                        }
                        
                        // If we're in the image section, parse numbered entries
                        if (inImageSection && trimmed) {
                            // Look for pattern: "01. filename.ext" or just "filename.ext"
                            const match = trimmed.match(/^(?:\d+\.\s+)?(.+?)\s*$/);
                            if (match) {
                                const filename = match[1].trim();
                                // Check if it looks like an image file (has an extension)
                                if (filename.includes('.') && !filename.startsWith('_generate-') && !filename.startsWith('#')) {
                                    // Check for common image extensions
                                    const ext = filename.toLowerCase().split('.').pop();
                                    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico'].includes(ext)) {
                                        imageFilenames.push(filename);
                                    }
                                }
                            }
                        }
                    }
                    console.log(`Loaded ${imageFilenames.length} filenames from _index.txt`);
                } else {
                    console.warn('_index.txt not found, falling back to default filenames');
                    throw new Error('Index file not found');
                }
            } catch (indexError) {
                console.warn('Failed to read _index.txt:', indexError.message);
                // Fallback to common image filenames if _index.txt is not available
                imageFilenames = [
                    '1.svg', '2.svg', '3.svg', '4.svg', '5.svg',
                    '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg',
                    '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg',
                    '1.png', '2.png', '3.png', '4.png', '5.png',
                    '1.webp', '2.webp', '3.webp', '4.webp', '5.webp',
                    '1.gif', '2.gif', '3.gif', '4.gif', '5.gif',
                    'vision1.jpg', 'vision2.jpg', 'vision3.jpg', 'vision4.jpg', 'vision5.jpg',
                    'vision1.png', 'vision2.png', 'vision3.png', 'vision4.png', 'vision5.png',
                    'goal1.jpg', 'goal2.jpg', 'goal3.jpg', 'goal4.jpg', 'goal5.jpg',
                    'dream1.jpg', 'dream2.jpg', 'dream3.jpg', 'dream4.jpg', 'dream5.jpg',
                    'image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg',
                    'photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'
                ];
            }
            
            // Try to load each image and collect the ones that exist
            const imageFiles = [];
            console.log(`Base URL: ${window.location.href}`);
            console.log(`Image directory: ${imgDir}`);
            
            const loadPromises = imageFilenames.map(async (filename) => {
                try {
                    const fullUrl = imgDir + filename;
                    console.log(`Attempting to fetch: ${fullUrl}`);
                    const response = await fetch(fullUrl);
                    if (response.ok) {
                        const blob = await response.blob();
                        if (blob.size > 0) {
                            // Determine MIME type based on file extension if not provided correctly
                            let mimeType = blob.type;
                            if (!mimeType || mimeType === 'text/plain' || mimeType === 'application/octet-stream') {
                                const ext = filename.toLowerCase().split('.').pop();
                                switch (ext) {
                                    case 'jpg':
                                    case 'jpeg':
                                        mimeType = 'image/jpeg';
                                        break;
                                    case 'png':
                                        mimeType = 'image/png';
                                        break;
                                    case 'gif':
                                        mimeType = 'image/gif';
                                        break;
                                    case 'webp':
                                        mimeType = 'image/webp';
                                        break;
                                    case 'svg':
                                        mimeType = 'image/svg+xml';
                                        break;
                                }
                            }
                            
                            // Accept any image type or SVG
                            if (mimeType.startsWith('image/') || mimeType.includes('svg')) {
                                const file = new File([blob], filename, { type: mimeType });
                                // Don't set webkitRelativePath as it's read-only - just use the filename
                                console.log(`Successfully loaded: ${filename} (${mimeType}, ${blob.size} bytes)`);
                                return file;
                            } else {
                                console.warn(`Skipped ${filename}: unexpected MIME type ${mimeType}`);
                            }
                        }
                    } else {
                        console.log(`File not found: ${filename} (status: ${response.status})`);
                    }
                } catch (e) {
                    // Image doesn't exist or failed to load, return null
                    console.log(`Failed to load ${filename}:`, e.message);
                    return null;
                }
                return null;
            });
            
            // Wait for all load attempts to complete
            const results = await Promise.all(loadPromises);
            
            // Filter out null results and add valid files
            for (const file of results) {
                if (file) {
                    imageFiles.push(file);
                }
            }
            
            if (imageFiles.length === 0) {
                console.log('Debug: No images loaded. Check the console for details about which files were attempted.');
                alert('No images found in the /img/ directory.\n\nDebugging info:\n- Check browser console (F12) for detailed loading attempts\n- Ensure files are accessible via HTTP server\n- Try refreshing the page\n- Create or update _index.txt using one of the maintenance scripts\n\nExpected files in /img/:\n- _index.txt (generated by maintenance scripts)\n- Image files: jpg, png, gif, svg, webp, etc.');
                this.hideLoading();
                return;
            }
            
            // Sort images by name for consistent ordering
            imageFiles.sort((a, b) => a.name.localeCompare(b.name));
            
            // Set up the image viewing system
            this.currentFileType = 'image';
            this.imageFiles = imageFiles;
            this.currentFiles = this.imageFiles;
            this.currentImageIndex = 0;
            this.totalPages = this.imageFiles.length;
            this.currentPage = 1;
            
            // Load the first image
            await this.loadImageFile(this.imageFiles[0]);
            
            // Update navigation buttons
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Error loading vision board:', error);
            alert('Error loading Vision Board: ' + error.message);
            this.hideLoading();
        }
    }
    
    async loadImageFile(file) {
        try {
            const imageUrl = URL.createObjectURL(file);
            this.imageUrls.push(imageUrl); // Track for cleanup
            
            // Create image element
            const img = new Image();
            img.onload = async () => {
                await this.displayImages();
                this.hideLoading();
            };
            img.onerror = () => {
                console.error('Error loading image');
                alert('Error loading image file');
                this.hideLoading();
                URL.revokeObjectURL(imageUrl);
                // Remove from tracking array
                const index = this.imageUrls.indexOf(imageUrl);
                if (index > -1) this.imageUrls.splice(index, 1);
            };
            img.src = imageUrl;
            
            // Store the URL with the file for later use
            file.localUrl = imageUrl;
            
            // Update UI elements
            this.totalPages = this.imageFiles.length;
            this.startPage.value = 1;
            this.endPage.value = this.totalPages;
            this.playBtn.disabled = false;
            
            // Update the display mode button for image files
            this.updateDisplayModeButton();
            
            // Use the comprehensive page controls update function
            this.updatePageControlsForCurrentFile();
            
        } catch (error) {
            console.error('Error loading image:', error);
            throw error;
        }
    }
    
    displayImage(img, imageUrl = null) {
        // Clear the display but preserve drag drop area
        const dragDropArea = document.getElementById('dragDropArea');
        this.pdfDisplay.innerHTML = '';
        
        // Restore drag drop area if it existed
        if (dragDropArea) {
            this.pdfDisplay.appendChild(dragDropArea);
            // Update our reference
            this.dragDropArea = dragDropArea;
        }
        
        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        imageContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            overflow: hidden;
        `;
        
        // Clone the image and style it
        const displayImg = img.cloneNode();
        displayImg.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            object-position: center;
            display: block;
            border: none;
            outline: none;
        `;
        
        // Apply transforms if needed
        let transform = '';
        if (this.rotateContent.checked) {
            transform += ' rotate(180deg)';
        }
        if (this.mirrorContent.checked) {
            transform += ' scaleX(-1)';
        }
        if (transform) {
            displayImg.style.transform = transform.trim();
        }
        
        imageContainer.appendChild(displayImg);
        this.pdfDisplay.appendChild(imageContainer);
        
        // Update current page display
        this.currentPage = this.currentImageIndex + 1;
        

        // Update overlay to show center dot, corner circles, and vertical guide for images
        this.updateOverlay();
    }
    
    async displayCurrentImage() {
        // Redirect to the new multi-page display method for consistency
        await this.displayImages();
    }
    
    // Cleanup method to revoke object URLs
    cleanupImageUrls() {
        this.imageUrls.forEach(url => {
            URL.revokeObjectURL(url);
        });
        this.imageUrls = [];
        
        // Also clean up URLs attached to files
        this.imageFiles.forEach(file => {
            if (file.localUrl) {
                URL.revokeObjectURL(file.localUrl);
                delete file.localUrl;
            }
        });
    }
    
    async loadImagesFromDirectory(directory) {
        try {
            this.showLoading();
            
            // Common image file extensions
            const imageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'svg'];
            const imageFiles = [];
            
            // Try to load each possible image file with common naming patterns
            const commonNames = ['1', '2', '3', '4', '5', 'sample', 'test', 'demo', 'photo', 'image1', 'image2', 'image3', 'image4', 'image5'];
            
            for (const name of commonNames) {
                for (const ext of imageExtensions) {
                    const fileName = `${name}.${ext}`;
                    const filePath = `${directory}/${fileName}`;
                    
                    try {
                        const response = await fetch(filePath);
                        if (response.ok) {
                            imageFiles.push({
                                name: fileName,
                                url: filePath
                            });
                        }
                    } catch (e) {
                        // File doesn't exist, continue
                    }
                }
            }
            
            // Also try numbered files up to 20
            for (let i = 1; i <= 20; i++) {
                for (const ext of imageExtensions) {
                    const fileName = `${i}.${ext}`;
                    const filePath = `${directory}/${fileName}`;
                    
                    try {
                        const response = await fetch(filePath);
                        if (response.ok) {
                            // Check if we already have this file (avoid duplicates)
                            if (!imageFiles.some(f => f.name === fileName)) {
                                imageFiles.push({
                                    name: fileName,
                                    url: filePath
                                });
                            }
                        }
                    } catch (e) {
                        // File doesn't exist, continue
                    }
                }
            }
            
            if (imageFiles.length === 0) {
                alert('No image files found in the img directory. Please add some WebP, JPG, PNG, GIF, or SVG files.');
                this.hideLoading();
                return;
            }
            
            // Sort files by name naturally (1, 2, 3, 10, 11 instead of 1, 10, 11, 2, 3)
            imageFiles.sort((a, b) => {
                const aNum = parseInt(a.name.match(/\d+/));
                const bNum = parseInt(b.name.match(/\d+/));
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                }
                return a.name.localeCompare(b.name);
            });
            
            this.currentFileType = 'image';
            console.log('Set currentFileType to image, loading from directory');
            this.imageFiles = imageFiles;
            this.currentImageIndex = 0;
            this.totalPages = imageFiles.length;
            this.currentPage = 1;
            
            await this.loadImageFromUrl(imageFiles[0].url);
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Error loading images from directory:', error);
            alert('Error loading images from directory: ' + error.message);
            this.hideLoading();
        }
    }
    
    async loadImageFromUrl(url) {
        try {
            const img = new Image();
            img.onload = async () => {
                await this.displayImages();
                this.hideLoading();
            };
            img.onerror = () => {
                console.error('Error loading image from URL:', url);
                alert('Error loading image from URL');
                this.hideLoading();
            };
            img.src = url;
            
            // Update UI elements
            this.startPage.value = 1;
            this.endPage.value = this.totalPages;
            this.playBtn.disabled = false;
            
            // Update the display mode button for image files
            this.updateDisplayModeButton();
            
            // Use the comprehensive page controls update function
            this.updatePageControlsForCurrentFile();
            
        } catch (error) {
            console.error('Error loading image from URL:', error);
            throw error;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoReader();
});

