class PhotoReader {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.slideInterval = null;
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        
        // Text file support
        this.currentFileType = null; // 'pdf', 'txt', 'docx', 'epub', or 'mobi'
        this.textContent = null;
        this.textWords = [];
        this.currentWordIndex = 0;
        this.documentContent = null; // For storing parsed document content
        this.documentPages = []; // For storing document split into pages
        
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
        this.verticalGuide = document.getElementById('verticalGuide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.startPage = document.getElementById('startPage');
        this.endPage = document.getElementById('endPage');
        this.reverseOrder = document.getElementById('reverseOrder');
        this.rotateContent = document.getElementById('rotateContent');
        this.mirrorContent = document.getElementById('mirrorContent');
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
            this.saveSettings();
            this.updateNavigationButtons();
            this.updateDisplay();
        });
        this.centerDot.addEventListener('change', () => {
            this.saveSettings();
            this.updateOverlay();
        });
        this.cornerCircles.addEventListener('change', () => {
            this.saveSettings();
            this.updateOverlay();
        });
        this.verticalGuide.addEventListener('change', () => {
            this.saveSettings();
            this.updateOverlay();
        });
        this.reverseOrder.addEventListener('change', () => this.saveSettings());
        this.rotateContent.addEventListener('change', () => {
            this.saveSettings();
            this.updateDisplay();
        });
        this.mirrorContent.addEventListener('change', () => {
            this.saveSettings();
            this.updateDisplay();
        });
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());
        this.startPage.addEventListener('change', () => this.validatePageRange());
        this.endPage.addEventListener('change', () => this.validatePageRange());
        this.interval.addEventListener('change', () => {
            this.saveSettings();
            this.validateInterval();
        });
        this.audioEnabled.addEventListener('change', () => this.saveSettings());
        this.audioFrequency.addEventListener('change', () => {
            this.saveSettings();
            this.validateAudioFrequency();
        });
        this.playBtn.addEventListener('click', () => this.toggleSlideshow());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Mouse events for fullscreen navigation
        this.pdfDisplay.addEventListener('mousedown', (e) => this.handleMouseClick(e));
        this.pdfDisplay.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
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
            centerDot: this.centerDot.checked,
            cornerCircles: this.cornerCircles.checked,
            verticalGuide: this.verticalGuide.checked,
            reverseOrder: this.reverseOrder.checked,
            rotateContent: this.rotateContent.checked,
            mirrorContent: this.mirrorContent.checked,
            interval: this.interval.value,
            audioEnabled: this.audioEnabled.checked,
            audioFrequency: this.audioFrequency.value
        };
        localStorage.setItem('photoReaderSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('photoReaderSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                // Apply saved settings
                if (settings.pageView) {
                    this.pageView.value = settings.pageView;
                }
                if (settings.centerDot !== undefined) {
                    this.centerDot.checked = settings.centerDot;
                }
                if (settings.cornerCircles !== undefined) {
                    this.cornerCircles.checked = settings.cornerCircles;
                }
                if (settings.verticalGuide !== undefined) {
                    this.verticalGuide.checked = settings.verticalGuide;
                }
                if (settings.reverseOrder !== undefined) {
                    this.reverseOrder.checked = settings.reverseOrder;
                }
                if (settings.rotateContent !== undefined) {
                    this.rotateContent.checked = settings.rotateContent;
                }
                if (settings.mirrorContent !== undefined) {
                    this.mirrorContent.checked = settings.mirrorContent;
                }
                if (settings.interval) {
                    this.interval.value = settings.interval;
                }
                if (settings.audioEnabled !== undefined) {
                    this.audioEnabled.checked = settings.audioEnabled;
                }
                if (settings.audioFrequency) {
                    this.audioFrequency.value = settings.audioFrequency;
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
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
            } else if (fileName.endsWith('.docx')) {
                this.currentFileType = 'docx';
                const arrayBuffer = await file.arrayBuffer();
                await this.loadDocumentFile(arrayBuffer, 'docx');
            } else if (fileName.endsWith('.epub')) {
                this.currentFileType = 'epub';
                const arrayBuffer = await file.arrayBuffer();
                await this.loadEbookFile(arrayBuffer, 'epub');
            } else if (fileName.endsWith('.mobi')) {
                this.currentFileType = 'mobi';
                const arrayBuffer = await file.arrayBuffer();
                await this.loadEbookFile(arrayBuffer, 'mobi');
            } else {
                alert('Please select a valid PDF, TXT, DOCX, EPUB, or MOBI file.');
                this.hideLoading();
                return;
            }
            
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Error loading file: ' + error.message);
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
            } else if (fileName.endsWith('.docx')) {
                this.currentFileType = 'docx';
                const arrayBuffer = await response.arrayBuffer();
                await this.loadDocumentFile(arrayBuffer, 'docx');
            } else if (fileName.endsWith('.epub')) {
                this.currentFileType = 'epub';
                const arrayBuffer = await response.arrayBuffer();
                await this.loadEbookFile(arrayBuffer, 'epub');
            } else if (fileName.endsWith('.mobi')) {
                this.currentFileType = 'mobi';
                const arrayBuffer = await response.arrayBuffer();
                await this.loadEbookFile(arrayBuffer, 'mobi');
            } else {
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
            this.currentWordIndex = 0;
            
            // Split document into pages for slideshow
            this.documentPages = this.splitDocumentIntoPages(htmlContent);
            
            // Reset page-related controls for document mode
            this.totalPages = this.documentPages.length;
            this.startPage.max = this.totalPages;
            this.endPage.max = this.totalPages;
            this.startPage.value = 1;
            this.endPage.value = this.totalPages;
            
            this.currentPage = 1;
            this.playBtn.disabled = false;
            
            await this.renderDocumentPreview();
            
            // Enable navigation buttons for document mode
            this.updateNavigationButtons();
            
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
            this.currentWordIndex = 0;
            
            // Split document into pages for slideshow
            this.documentPages = this.splitDocumentIntoPages(htmlContent);
            
            // Ensure we have at least one page
            if (this.documentPages.length === 0) {
                this.documentPages = [htmlContent];
            }
            
            // Reset page-related controls for ebook mode
            this.totalPages = this.documentPages.length;
            this.startPage.max = this.totalPages;
            this.endPage.max = this.totalPages;
            this.startPage.value = 1;
            this.endPage.value = this.totalPages;
            
            this.currentPage = 1;
            this.playBtn.disabled = false;
            
            await this.renderDocumentPreview();
            
            // Enable navigation buttons for ebook mode
            this.updateNavigationButtons();
            
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
        if (this.rotateContent.checked) {
            transforms.push('rotate(180deg)');
        }
        if (this.mirrorContent.checked) {
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
        
        // Apply transformations
        let transforms = [];
        if (this.rotateContent.checked) {
            transforms.push('rotate(180deg)');
        }
        if (this.mirrorContent.checked) {
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
        if (this.rotateContent.checked) {
            transforms.push('rotate(180deg)');
        }
        if (this.mirrorContent.checked) {
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
            
            // Apply transformations
            let transforms = [];
            if (this.rotateContent.checked) {
                transforms.push('rotate(180deg)');
            }
            if (this.mirrorContent.checked) {
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
        
        // Support overlay for PDF files
        if (this.pdfDoc) {
            // Vertical guide line for PDFs - create one line per page
            if (this.verticalGuide.checked) {
                const viewMode = parseInt(this.pageView.value);
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
        // Support overlay for text files and document files
        else if (this.currentFileType === 'txt' || this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            // Vertical guide line for text/document files - single centered line
            if (this.verticalGuide.checked) {
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
            }
            
            // Center dot
            if (this.centerDot.checked) {
                const centerDot = document.createElement('div');
                centerDot.className = 'dot center-dot';
                this.overlay.appendChild(centerDot);
            }
            
            // Corner circles - all four corners for text and document display
            if (this.cornerCircles.checked) {
                this.createCornerDot('top-left');
                this.createCornerDot('top-right');
                this.createCornerDot('bottom-left');
                this.createCornerDot('bottom-right');
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
            // Text mode: start from end if reverse mode, otherwise start
            if (this.reverseOrder.checked) {
                const endWord = parseInt(this.endPage.value) - 1;
                this.currentWordIndex = Math.max(0, endWord);
            } else {
                const startWord = parseInt(this.startPage.value) - 1;
                this.currentWordIndex = Math.max(0, startWord);
            }
            await this.displayCurrentWord();
            
            // Start word progression timer
            const intervalMs = parseFloat(this.interval.value) * 1000;
            this.slideInterval = setInterval(() => {
                this.nextTextWord();
            }, intervalMs);
        } else if (this.currentFileType === 'docx' || this.currentFileType === 'epub' || this.currentFileType === 'mobi') {
            // Document mode: start from end if reverse mode, otherwise start
            if (this.reverseOrder.checked) {
                this.currentPage = parseInt(this.endPage.value);
            } else {
                this.currentPage = parseInt(this.startPage.value);
            }
            await this.updateDisplay();
            
            // Start slideshow timer for documents
            const intervalMs = parseFloat(this.interval.value) * 1000;
            this.slideInterval = setInterval(() => {
                this.nextDocumentSlide();
            }, intervalMs);
        } else {
            // PDF mode: start from end if reverse mode, otherwise start
            if (this.reverseOrder.checked) {
                this.currentPage = parseInt(this.endPage.value);
            } else {
                this.currentPage = parseInt(this.startPage.value);
            }
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
        this.isPaused = false;
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
                this.nextTextWord();
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
        if (this.rotateContent.checked) {
            transforms.push('rotate(180deg)');
        }
        if (this.mirrorContent.checked) {
            transforms.push('scaleX(-1)');
        }
        if (transforms.length > 0) {
            wordDisplay.style.transform = transforms.join(' ');
        }
        
        this.pdfDisplay.appendChild(wordDisplay);
        
        // Update overlay to show center dot and corner circles for text files
        this.updateOverlay();
    }
    
    async nextTextWord() {
        const startWord = parseInt(this.startPage.value) - 1;
        const endWord = parseInt(this.endPage.value) - 1;
        
        if (this.reverseOrder.checked) {
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
        
        await this.displayCurrentWord();
    }

    async nextSlide() {
        const startPage = parseInt(this.startPage.value);
        const endPage = parseInt(this.endPage.value);
        const viewMode = parseInt(this.pageView.value);
        
        if (this.reverseOrder.checked) {
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

    async nextDocumentSlide() {
        const startPage = parseInt(this.startPage.value);
        const endPage = parseInt(this.endPage.value);
        
        if (this.reverseOrder.checked) {
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
            const viewMode = parseInt(this.pageView.value);
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
                this.nextTextWord();
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
                const viewMode = parseInt(this.pageView.value);
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
        
        const viewMode = parseInt(this.pageView.value);
        this.currentPage -= viewMode;
        
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        
        this.updateNavigationButtons();
        await this.updateDisplay();
    }
    
    async nextPage() {
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
            // Disable navigation buttons for text mode only
            this.prevBtn.disabled = true;
            this.nextBtn.disabled = true;
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
