/**
 * Helmet Detection AI — Frontend Logic
 * Handles camera, upload, API calls, and result rendering
 */

// ==========================================
// DOM Elements
// ==========================================
const $ = (sel) => document.querySelector(sel);

const tabBtns        = document.querySelectorAll('.tab-btn');
const tabCamera      = $('#tab-camera');
const tabGallery     = $('#tab-gallery');
const cameraVideo    = $('#camera-video');
const cameraCanvas   = $('#camera-canvas');
const cameraPlaceholder = $('#camera-placeholder');
const btnStartCamera = $('#btn-start-camera');
const btnCapture     = $('#btn-capture');
const fileInput      = $('#file-input');
const previewCard    = $('#preview-card');
const previewImage   = $('#preview-image');
const btnAnalyze     = $('#btn-analyze');
const loading        = $('#loading');
const errorCard      = $('#error-card');
const resultSection  = $('#result-section');
const biasSection    = $('#bias-section');
const biasInput      = $('#bias-input');
const btnReportBias  = $('#btn-report-bias');
const toast          = $('#toast');

// ==========================================
// State
// ==========================================
let currentFile = null;        // File object to send
let cameraStream = null;       // MediaStream
let lastResult = null;         // Last API result

// API base URL — same origin (served by FastAPI)
const API_BASE = '';

// ==========================================
// Tabs
// ==========================================
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        document.getElementById(`tab-${target}`).classList.add('active');

        // Stop camera when switching away
        if (target !== 'camera' && cameraStream) {
            stopCamera();
        }
    });
});

// ==========================================
// Camera — with proper permission handling
// ==========================================
btnStartCamera.addEventListener('click', startCamera);
btnCapture.addEventListener('click', capturePhoto);

async function startCamera() {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('❌ เบราว์เซอร์นี้ไม่รองรับการใช้กล้อง\nกรุณาใช้ HTTPS หรือเปิดผ่าน localhost', 'error');
        return;
    }

    try {
        btnStartCamera.textContent = '⏳ กำลังเปิดกล้อง...';
        btnStartCamera.disabled = true;

        // Request camera permission — this triggers the browser permission prompt
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',   // Prefer back camera on mobile
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        // Show video
        cameraVideo.srcObject = cameraStream;
        cameraVideo.style.display = 'block';
        cameraPlaceholder.style.display = 'none';
        btnStartCamera.style.display = 'none';
        btnCapture.style.display = 'block';

        // Wait for video to be ready
        await cameraVideo.play();

    } catch (err) {
        btnStartCamera.textContent = '📷 เปิดกล้อง';
        btnStartCamera.disabled = false;

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            showToast('⚠️ กรุณาอนุญาตการใช้กล้องในการตั้งค่าเบราว์เซอร์', 'warning');
            cameraPlaceholder.querySelector('p').innerHTML =
                '❌ ไม่ได้รับอนุญาตให้ใช้กล้อง<br><small style="color:#a78bfa;">กรุณาเปิดสิทธิ์กล้องในการตั้งค่าเบราว์เซอร์ แล้วกดเปิดกล้องอีกครั้ง</small>';
        } else if (err.name === 'NotFoundError') {
            showToast('❌ ไม่พบกล้องในอุปกรณ์นี้', 'error');
        } else if (err.name === 'NotReadableError') {
            showToast('❌ กล้องถูกใช้งานโดยแอปอื่นอยู่', 'error');
        } else {
            showToast(`❌ ไม่สามารถเปิดกล้องได้: ${err.message}`, 'error');
        }
        console.error('Camera error:', err);
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraVideo.style.display = 'none';
    cameraPlaceholder.style.display = 'flex';
    btnStartCamera.style.display = 'block';
    btnStartCamera.textContent = '📷 เปิดกล้อง';
    btnStartCamera.disabled = false;
    btnCapture.style.display = 'none';
}

function capturePhoto() {
    if (!cameraStream) return;

    const ctx = cameraCanvas.getContext('2d');
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    ctx.drawImage(cameraVideo, 0, 0);

    // Convert to blob
    cameraCanvas.toBlob(blob => {
        if (blob) {
            currentFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            showPreview(URL.createObjectURL(blob));
            stopCamera();
        }
    }, 'image/jpeg', 0.85);
}

// ==========================================
// File Upload
// ==========================================
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
        showToast('⚠️ กรุณาเลือกไฟล์รูปภาพ', 'warning');
        return;
    }

    currentFile = file;
    showPreview(URL.createObjectURL(file));
});

function showPreview(src) {
    previewImage.src = src;
    previewCard.classList.add('visible');
    btnAnalyze.disabled = false;

    // Clear previous results
    resultSection.classList.remove('visible');
    biasSection.classList.remove('visible');
    errorCard.classList.remove('visible');
}

// ==========================================
// Analyze
// ==========================================
btnAnalyze.addEventListener('click', analyzeImage);

async function analyzeImage() {
    if (!currentFile) return;

    // UI state: loading
    btnAnalyze.disabled = true;
    loading.classList.add('visible');
    resultSection.classList.remove('visible');
    biasSection.classList.remove('visible');
    errorCard.classList.remove('visible');

    try {
        const formData = new FormData();
        formData.append('file', currentFile);

        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ' }));
            throw new Error(err.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();
        lastResult = data;
        renderResult(data);

    } catch (err) {
        errorCard.textContent = `❌ เกิดข้อผิดพลาด: ${err.message}`;
        errorCard.classList.add('visible');
        console.error('Analyze error:', err);
    } finally {
        loading.classList.remove('visible');
        btnAnalyze.disabled = false;
    }
}

function renderResult(data) {
    // Badge
    const iconMap  = { yes: '✅', no: '❌', unknown: '⚠️' };
    const classMap = { yes: 'badge-yes', no: 'badge-no', unknown: 'badge-unknown' };

    const resultIcon  = $('#result-icon');
    const resultBadge = $('#result-badge');
    resultIcon.textContent = iconMap[data.badge] || '⚠️';
    resultBadge.textContent = data.decision;
    resultBadge.className = `result-badge ${classMap[data.badge] || 'badge-unknown'}`;

    // Confidence
    const conf = data.confidence;
    $('#confidence-value').textContent = `${conf}%`;

    let barColor;
    if (conf >= 80) barColor = 'linear-gradient(90deg, #00c853, #69f0ae)';
    else if (conf >= 50) barColor = 'linear-gradient(90deg, #ff9100, #ffab40)';
    else barColor = 'linear-gradient(90deg, #ff1744, #ff5252)';

    const bar = $('#confidence-bar');
    bar.style.background = barColor;
    // Trigger reflow for animation
    bar.style.width = '0%';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            bar.style.width = `${conf}%`;
        });
    });

    // Bias
    $('#bias-text').textContent = data.bias_analysis;

    // Show sections
    resultSection.classList.add('visible');
    biasSection.classList.add('visible');

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// Bias Reporting
// ==========================================
btnReportBias.addEventListener('click', reportBias);

async function reportBias() {
    const feedback = biasInput.value.trim();
    if (!feedback) {
        showToast('⚠️ กรุณากรอกเหตุผลก่อนส่ง', 'warning');
        return;
    }

    btnReportBias.disabled = true;
    btnReportBias.textContent = '⏳ กำลังส่ง...';

    try {
        const formData = new FormData();
        formData.append('feedback', feedback);
        if (lastResult) {
            formData.append('decision', lastResult.decision || '');
            formData.append('confidence', lastResult.confidence || 0);
        }

        const response = await fetch(`${API_BASE}/report-bias`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'เกิดข้อผิดพลาด' }));
            throw new Error(err.detail);
        }

        showToast('✅ ขอบคุณ! ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว', 'success');
        biasInput.value = '';

    } catch (err) {
        showToast(`❌ ${err.message}`, 'error');
    } finally {
        btnReportBias.disabled = false;
        btnReportBias.textContent = '📩 ส่งข้อมูลแจ้ง Bias';
    }
}

// ==========================================
// Toast
// ==========================================
let toastTimeout = null;

function showToast(message, type = 'success') {
    if (toastTimeout) clearTimeout(toastTimeout);

    toast.textContent = message;
    toast.className = `toast toast-${type}`;

    requestAnimationFrame(() => {
        toast.classList.add('visible');
    });

    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 3500);
}
