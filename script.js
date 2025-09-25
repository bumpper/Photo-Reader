class PhotoReader {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.isPlaying = false;
        this.slideInterval = null;
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        
        // Text file support
        this.currentFileType = null; // 'pdf' or 'txt'
        this.textContent = null;
        this.textWords = [];
        this.currentWordIndex = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.setupPDFJS();
    }
    
    initializeElements() {
        this.openBtn = document.getElementById('openBtn');
        this.fileInput = document.getElementById('fileInput');
        this.preloaded = document.getElementById('preloaded');
        this.pageView = document.getElementById('pageView');
        this.centerDot = document.getElementById('centerDot');
        this.cornerCircles = document.getElementById('cornerCircles');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.startPage = document.getElementById('startPage');
        this.endPage = document.getElementById('endPage');
        this.interval = document.getElementById('interval');
        this.audioEnabled = document.getElementById('audioEnabled');
        this.audioFrequency = document.getElementById('audioFrequency');
        this.playBtn = document.getElementById('playBtn');
        this.pdfContainer = document.getElementById('main-content');
        this.pdfDisplay = document.getElementById('pdfDisplay');
        this.overlay = document.getElementById('overlay');
        this.container = document.querySelector('.container');
    }
    
    bindEvents() {
        this.openBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.preloaded.addEventListener('change', (e) => this.handlePreloadedSelect(e));
        this.pageView.addEventListener('change', () => {
            this.updateNavigationButtons();
            this.updateDisplay();
        });
        this.centerDot.addEventListener('change', () => this.updateOverlay());
        this.cornerCircles.addEventListener('change', () => this.updateOverlay());
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        this.startPage.addEventListener('change', () => this.validatePageRange());
        this.endPage.addEventListener('change', () => this.validatePageRange());
        this.interval.addEventListener('change', () => this.validateInterval());
        this.audioFrequency.addEventListener('change', () => this.validateAudioFrequency());
        this.playBtn.addEventListener('click', () => this.toggleSlideshow());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }
    
    setupPDFJS() {
        // Set PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        
        try {
            this.showLoading();
            
            if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
                this.currentFileType = 'pdf';
                const arrayBuffer = await file.arrayBuffer();
                await this.loadPDF(arrayBuffer);
            } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
                this.currentFileType = 'txt';
                const text = await file.text();
                await this.loadTextFile(text);
            } else {
                alert('Please select a valid PDF or TXT file.');
                this.hideLoading();
                return;
            }
            
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Error loading file.');
            this.hideLoading();
        }
    }
    
    async handlePreloadedSelect(event) {
        const selectedFile = event.target.value;
        if (!selectedFile) return;
        
        try {
            this.showLoading();
            
            // Determine file type based on extension
            const fileName = selectedFile.toLowerCase();
            const response = await fetch(selectedFile);
            if (!response.ok) {
                throw new Error(`Failed to load file: ${response.status}`);
            }
            
            if (fileName.endsWith('.pdf')) {
                this.currentFileType = 'pdf';
                const arrayBuffer = await response.arrayBuffer();
                await this.loadPDF(arrayBuffer);
            } else if (fileName.endsWith('.txt')) {
                this.currentFileType = 'txt';
                const text = await response.text();
                await this.loadTextFile(text);
            } else {
                alert('Unsupported file type. Please select a PDF or TXT file.');
                this.hideLoading();
                return;
            }
            
        } catch (error) {
            console.error('Error loading preloaded file:', error);
            alert('Error loading preloaded file. Please make sure the file exists.');
            this.hideLoading();
        }
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
        this.currentWordIndex = 0;
        
        // Reset page-related controls for text mode
        this.totalPages = this.textWords.length;
        this.startPage.max = this.textWords.length;
        this.endPage.max = this.textWords.length;
        this.startPage.value = 1;
        this.endPage.value = this.textWords.length;
        
        this.playBtn.disabled = false;
        
        await this.renderTextPreview();
        
        // Disable navigation buttons for text mode
        this.updateNavigationButtons();
        
        this.hideLoading();
    }

    async loadPDF(arrayBuffer) {
        this.pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
        this.totalPages = this.pdfDoc.numPages;
        
        // Update page inputs - always update end page to total pages unless user has specifically set it higher
        this.startPage.max = this.totalPages;
        this.endPage.max = this.totalPages;
        
        // Auto-set end page to total pages if it's at default (1) or if the current value is less than total pages
        const currentEndPage = parseInt(this.endPage.value);
        if (currentEndPage <= 1 || currentEndPage < this.totalPages) {
            this.endPage.value = this.totalPages;
        }
        
        this.currentPage = 1;
        this.playBtn.disabled = false;
        
        await this.updateDisplay();
        
        // Enable navigation buttons AFTER display is updated
        this.updateNavigationButtons();
        
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
        
        textDisplay.appendChild(textPreview);
        this.pdfDisplay.appendChild(textDisplay);
        
        // Clear overlay for text mode
        this.overlay.innerHTML = '';
    }

    async updateDisplay() {
        if (this.currentFileType === 'txt') {
            await this.renderTextPreview();
            return;
        }
        
        if (!this.pdfDoc) return;
        
        const viewMode = parseInt(this.pageView.value);
        
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
    
    async renderPage(pageNum, position = 'single') {
        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate scale to fit container
            const containerRect = this.pdfContainer.getBoundingClientRect();
            const viewport = page.getViewport({ scale: 1 });
            
            let scale;
            const viewMode = parseInt(this.pageView.value);
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
        
        if (!this.pdfDoc) return;
        
        const containerRect = this.pdfContainer.getBoundingClientRect();
        const displayRect = this.pdfDisplay.getBoundingClientRect();
        
        // Center dot
        if (this.centerDot.checked) {
            const centerDot = document.createElement('div');
            centerDot.className = 'dot center-dot';
            this.overlay.appendChild(centerDot);
        }
        
        // Corner circles
        if (this.cornerCircles.checked) {
            const viewMode = parseInt(this.pageView.value);
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
    
    async toggleSlideshow() {
        if (this.isPlaying) {
            this.stopSlideshow();
        } else {
            await this.startSlideshow();
        }
    }
    
    async startSlideshow() {
        if (!this.pdfDoc && !this.textContent) return;
        
        this.isPlaying = true;
        this.playBtn.textContent = 'Stop';
        
        // Enter fullscreen
        await this.enterFullscreen();
        
        // Start audio if enabled
        if (this.audioEnabled.checked) {
            this.startAudio();
        }
        
        if (this.currentFileType === 'txt') {
            // Text mode: start from first word or specified start position
            const startWord = parseInt(this.startPage.value) - 1;
            this.currentWordIndex = Math.max(0, startWord);
            await this.displayCurrentWord();
            
            // Start word progression timer
            const intervalMs = parseFloat(this.interval.value) * 1000;
            this.slideInterval = setInterval(() => {
                this.nextTextWord();
            }, intervalMs);
        } else {
            // PDF mode: existing logic
            this.currentPage = parseInt(this.startPage.value);
            await this.updateDisplay();
            
            // Start slideshow timer
            const intervalMs = parseFloat(this.interval.value) * 1000;
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, intervalMs);
        }
    }
    
    stopSlideshow() {
        this.isPlaying = false;
        this.playBtn.textContent = 'Play';
        
        // Clear interval
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
        
        // Stop audio
        this.stopAudio();
        
        // Exit fullscreen
        this.exitFullscreen();
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
        
        this.pdfDisplay.appendChild(wordDisplay);
    }
    
    async nextTextWord() {
        const startWord = parseInt(this.startPage.value) - 1;
        const endWord = parseInt(this.endPage.value) - 1;
        
        this.currentWordIndex++;
        if (this.currentWordIndex > endWord) {
            this.currentWordIndex = startWord;
        }
        
        await this.displayCurrentWord();
    }

    async nextSlide() {
        const startPage = parseInt(this.startPage.value);
        const endPage = parseInt(this.endPage.value);
        const viewMode = parseInt(this.pageView.value);
        
        this.currentPage += viewMode;
        if (this.currentPage > endPage) {
            this.currentPage = startPage;
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
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        this.container.classList.remove('fullscreen');
    }
    
    handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement || 
                               document.msFullscreenElement);
        
        if (!isFullscreen && this.isPlaying) {
            this.stopSlideshow();
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
        if (event.key === 'Escape' && this.isPlaying) {
            event.preventDefault();
            this.stopSlideshow();
        }
    }
    
    // Navigation button functions
    async previousPage() {
        if (!this.pdfDoc) return;
        
        const viewMode = parseInt(this.pageView.value);
        this.currentPage -= viewMode;
        
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        
        this.updateNavigationButtons();
        await this.updateDisplay();
    }
    
    async nextPage() {
        if (!this.pdfDoc) return;
        
        const viewMode = parseInt(this.pageView.value);
        this.currentPage += viewMode;
        
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages - viewMode + 1);
        }
        
        this.updateNavigationButtons();
        await this.updateDisplay();
    }
    
    updateNavigationButtons() {
        if (this.currentFileType === 'txt') {
            // Disable navigation buttons for text mode
            this.prevBtn.disabled = true;
            this.nextBtn.disabled = true;
            return;
        }
        
        if (!this.pdfDoc) {
            this.prevBtn.disabled = true;
            this.nextBtn.disabled = true;
            return;
        }
        
        const viewMode = parseInt(this.pageView.value);
        
        // Enable/disable previous button
        this.prevBtn.disabled = this.currentPage <= 1;
        
        // Enable/disable next button
        this.nextBtn.disabled = this.currentPage + viewMode - 1 >= this.totalPages;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhotoReader();
});
