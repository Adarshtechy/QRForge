document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const elements = {
        qrcodeEl: document.getElementById('qrcode'),
        qrPlaceholder: document.getElementById('qr-placeholder'),
        qrInput: document.getElementById('qr-input'),
        generateBtn: document.getElementById('generate-btn'),
        qrColor: document.getElementById('qr-color'),
        bgColor: document.getElementById('bg-color'),
        qrSize: document.getElementById('qr-size'),
        sizeValue: document.getElementById('size-value'),
        errorLevel: document.getElementById('error-level'),
        downloadPng: document.getElementById('download-png'),
        shareBtn: document.getElementById('share-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toast-message'),
        quickBtns: document.querySelectorAll('.quick-btn')
    };

    // State
    let currentQRData = "";
    let qrcodeInstance = null;

    // Initialize QR Code
    function initQRCode() {
        clearQRCode();
        generateQR();
    }

    // Clear existing QR code
    function clearQRCode() {
        if (qrcodeInstance) {
            qrcodeInstance.clear();
            elements.qrcodeEl.innerHTML = '';
        }
    }

    // Generate QR Code
    function generateQR() {
        let text = elements.qrInput.value.trim();
        
        if (!text) {
            showToast("Please enter text or URL to generate QR code", 'error');
            return;
        }

        // Clear previous QR code
        clearQRCode();
        
        // Hide placeholder
        elements.qrPlaceholder.classList.add('hidden');

        // Set QR code size
        const size = parseInt(elements.qrSize.value);
        
        // Create new QR code instance
        qrcodeInstance = new QRCode(elements.qrcodeEl, {
            text: text,
            width: size,
            height: size,
            colorDark: elements.qrColor.value,
            colorLight: elements.bgColor.value,
            correctLevel: QRCode.CorrectLevel[elements.errorLevel.value]
        });

        currentQRData = text;
        showToast("QR code generated successfully!");
    }

    // Download QR Code as PNG
    function downloadQR() {
        if (!currentQRData) {
            showToast("Generate a QR code first", 'error');
            return;
        }

        const canvas = elements.qrcodeEl.querySelector('canvas');
        if (!canvas) {
            showToast("QR code not available", 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast("QR code downloaded!");
    }

    // Share QR Code
    async function shareQR() {
        if (!currentQRData) {
            showToast("Generate a QR code first", 'error');
            return;
        }

        const canvas = elements.qrcodeEl.querySelector('canvas');
        if (!canvas) {
            showToast("QR code not available", 'error');
            return;
        }

        if (navigator.share) {
            try {
                const blob = await new Promise(resolve => canvas.toBlob(resolve));
                const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                
                await navigator.share({
                    title: 'QR Code',
                    text: currentQRData,
                    files: [file]
                });
                showToast("QR code shared!");
            } catch (error) {
                if (error.name !== 'AbortError') {
                    downloadQR();
                }
            }
        } else {
            downloadQR();
        }
    }

    // Toggle Theme
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        const icon = elements.themeToggle.querySelector('i');
        icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        localStorage.setItem('theme', newTheme);
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        elements.toastMessage.textContent = message;
        elements.toast.className = `toast ${type}`;
        elements.toast.classList.add('show');
        
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }

    // Handle quick buttons
    function setupQuickButtons() {
        elements.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                
                switch(type) {
                    case 'url':
                        elements.qrInput.value = 'https://example.com';
                        break;
                    case 'text':
                        elements.qrInput.value = 'Scan this QR code!';
                        break;
                    case 'email':
                        elements.qrInput.value = 'mailto:hello@example.com';
                        break;
                }
                
                generateQR();
            });
        });
    }

    // Update QR when customization changes
    function setupCustomizationListeners() {
        elements.qrSize.addEventListener('input', () => {
            elements.sizeValue.textContent = elements.qrSize.value;
            if (currentQRData) generateQR();
        });

        elements.qrColor.addEventListener('input', () => {
            if (currentQRData) generateQR();
        });

        elements.bgColor.addEventListener('input', () => {
            if (currentQRData) generateQR();
        });

        elements.errorLevel.addEventListener('change', () => {
            if (currentQRData) generateQR();
        });
    }

    // Event Listeners
    function setupEventListeners() {
        elements.generateBtn.addEventListener('click', generateQR);
        
        elements.qrInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateQR();
            }
        });

        elements.downloadPng.addEventListener('click', downloadQR);
        elements.shareBtn.addEventListener('click', shareQR);
        elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Initialize
    function init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        const icon = elements.themeToggle.querySelector('i');
        icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Initialize UI
        setupQuickButtons();
        setupCustomizationListeners();
        setupEventListeners();
        
        // Generate initial QR code
        initQRCode();
    }

    // Start the app
    init();
});