// DOM Elements
const form = document.getElementById('bmi-form');
const resultSection = document.getElementById('result');
const turkStatus = document.getElementById('turk-status');
const bmiNumber = document.getElementById('bmi-number');
const resultMessage = document.getElementById('result-message');
const scaleMarker = document.getElementById('scale-marker');
const resetBtn = document.getElementById('reset-btn');
const unitBtns = document.querySelectorAll('.unit-btn');
const heightImperial = document.getElementById('height-imperial');
const heightMetric = document.getElementById('height-metric');
const weightUnit = document.getElementById('weight-unit');
const shareCard = document.getElementById('share-card');
const copyLinkBtn = document.getElementById('copy-link-btn');
const definitionSection = document.getElementById('definition-section');
const infoSection = document.getElementById('info-section');
const shareImageContainer = document.getElementById('share-image-container');
const shareImage = document.getElementById('share-image');
const rangeLean = document.getElementById('range-lean');
const rangeNormal = document.getElementById('range-normal');
const rangeTurk = document.getElementById('range-turk');
const rangeTurkedOut = document.getElementById('range-turked-out');

let currentUnit = 'imperial';
let currentHeightM = 0;
let currentBMI = 0;
let currentCategory = '';

// Turk Scale Configuration
const turkScale = {
    underweight: {
        max: 18.5,
        label: "Lean",
        class: "lean",
        messages: [
            "You're lean. Maybe too lean. Time to eat.",
            "Looking lean... possibly too lean. Grab a sandwich.",
            "Lean machine. But seriously, eat something."
        ]
    },
    normal: {
        max: 24.9,
        label: "Normal",
        class: "normal",
        messages: [
            "You're good. Normal range. Keep doing whatever you're doing.",
            "Healthy range. The exception doesn't apply to you because you ARE the rule.",
            "Solid. You're in the zone where BMI actually means something good."
        ]
    },
    overweight: {
        max: 29.9,
        label: "Turk",
        class: "turked",
        messages: [
            "You're turked. Not turked OUT, but turked. Time for some walks.",
            "Getting a little turked there. Nothing crazy, but the data doesn't lie.",
            "Turk status: confirmed. You're not the exception. Sorry."
        ]
    },
    obese: {
        max: Infinity,
        label: "Turked Out",
        class: "turked-out",
        messages: [
            "Turked out. This isn't a drill. Time to make some changes.",
            "Maximum turk achieved. The good news? You can only go down from here.",
            "You are fully turked out. No, you're not 'big boned'. Let's be real."
        ]
    }
};

// Unit Toggle
unitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        unitBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentUnit = btn.dataset.unit;

        if (currentUnit === 'metric') {
            heightImperial.classList.add('hidden');
            heightMetric.classList.remove('hidden');
            weightUnit.textContent = 'kg';
            // Clear imperial fields
            document.getElementById('feet').removeAttribute('required');
            document.getElementById('inches').removeAttribute('required');
            document.getElementById('cm').setAttribute('required', '');
        } else {
            heightImperial.classList.remove('hidden');
            heightMetric.classList.add('hidden');
            weightUnit.textContent = 'lb';
            // Clear metric fields
            document.getElementById('cm').removeAttribute('required');
            document.getElementById('feet').setAttribute('required', '');
            document.getElementById('inches').setAttribute('required', '');
        }
    });
});

// Calculate BMI
function calculateBMI(weight, heightInMeters) {
    return weight / (heightInMeters * heightInMeters);
}

// Get height in meters
function getHeightInMeters() {
    if (currentUnit === 'imperial') {
        const feet = parseFloat(document.getElementById('feet').value) || 0;
        const inches = parseFloat(document.getElementById('inches').value) || 0;
        const totalInches = (feet * 12) + inches;
        return totalInches * 0.0254; // Convert inches to meters
    } else {
        const cm = parseFloat(document.getElementById('cm').value) || 0;
        return cm / 100; // Convert cm to meters
    }
}

// Get weight in kg
function getWeightInKg() {
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    if (currentUnit === 'imperial') {
        return weight * 0.453592; // Convert lbs to kg
    }
    return weight;
}

// Get turk category
function getTurkCategory(bmi) {
    if (bmi < turkScale.underweight.max) return turkScale.underweight;
    if (bmi < turkScale.normal.max) return turkScale.normal;
    if (bmi < turkScale.overweight.max) return turkScale.overweight;
    return turkScale.obese;
}

// Calculate weight ranges for a given height
function updateWeightRanges(heightM, weightKg) {
    // Weight = BMI × height²
    const leanMax = 18.5 * heightM * heightM;
    const normalMax = 24.9 * heightM * heightM;
    const turkMax = 29.9 * heightM * heightM;

    // Convert to current unit
    const weightUnit = currentUnit === 'imperial' ? 'lb' : 'kg';
    const factor = currentUnit === 'imperial' ? 2.20462 : 1;

    const formatWeight = (kg) => Math.round(kg * factor);

    // Display current stats
    const yourStats = document.getElementById('your-stats');
    if (currentUnit === 'imperial') {
        const feet = Math.floor(heightM / 0.0254 / 12);
        const inches = Math.round((heightM / 0.0254) % 12);
        yourStats.textContent = `${formatWeight(weightKg)} lb at ${feet}'${inches}"`;
    } else {
        yourStats.textContent = `${formatWeight(weightKg)} kg at ${Math.round(heightM * 100)} cm`;
    }

    rangeLean.textContent = `< ${formatWeight(leanMax)} ${weightUnit}`;
    rangeNormal.textContent = `${formatWeight(leanMax)} - ${formatWeight(normalMax)} ${weightUnit}`;
    rangeTurk.textContent = `${formatWeight(normalMax)} - ${formatWeight(turkMax)} ${weightUnit}`;
    rangeTurkedOut.textContent = `> ${formatWeight(turkMax)} ${weightUnit}`;
}

// Get random message
function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

// Position scale marker
function positionMarker(bmi) {
    // Each segment is 25% wide, position marker within the correct segment
    let percentage;

    if (bmi < 18.5) {
        // Lean: 0-25% (BMI roughly 10-18.5)
        const segmentProgress = Math.max(0, (bmi - 10) / (18.5 - 10));
        percentage = segmentProgress * 25;
    } else if (bmi < 25) {
        // Normal: 25-50% (BMI 18.5-25)
        const segmentProgress = (bmi - 18.5) / (25 - 18.5);
        percentage = 25 + (segmentProgress * 25);
    } else if (bmi < 30) {
        // Turk: 50-75% (BMI 25-30)
        const segmentProgress = (bmi - 25) / (30 - 25);
        percentage = 50 + (segmentProgress * 25);
    } else {
        // Turked Out: 75-100% (BMI 30+)
        const segmentProgress = Math.min(1, (bmi - 30) / (40 - 30));
        percentage = 75 + (segmentProgress * 25);
    }

    scaleMarker.style.marginLeft = `calc(${percentage}% - 2px)`;
}

// Form Submit
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const weightKg = getWeightInKg();
    const heightM = getHeightInMeters();

    if (weightKg <= 0 || heightM <= 0) {
        alert('Please enter valid values');
        return;
    }

    const bmi = calculateBMI(weightKg, heightM);
    const category = getTurkCategory(bmi);

    // Store for sharing
    currentBMI = bmi;
    currentCategory = category.class;
    currentHeightM = heightM;

    // Update UI
    turkStatus.textContent = category.label;
    turkStatus.className = category.class;
    bmiNumber.textContent = bmi.toFixed(1);
    resultMessage.textContent = getRandomMessage(category.messages);
    updateWeightRanges(heightM, weightKg);
    document.getElementById('weight-ranges').classList.remove('hidden');

    // Position marker
    positionMarker(bmi);

    // Show result, hide definition, show info (bias section)
    form.classList.add('hidden');
    definitionSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    infoSection.classList.remove('hidden');

    // Generate shareable image for iOS long-press save
    generateShareImage();

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
});

// Generate share image for iOS long-press save
async function generateShareImage() {
    try {
        const canvas = await html2canvas(shareCard, {
            backgroundColor: '#0a1628',
            scale: 4, // 270x480 * 4 = 1080x1920 (Instagram Stories)
            logging: false,
            useCORS: true
        });
        shareImage.src = canvas.toDataURL('image/png');
        shareImageContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Error generating share image:', error);
    }
}

// Reset
resetBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    infoSection.classList.add('hidden');
    shareImageContainer.classList.add('hidden');
    form.classList.remove('hidden');
    definitionSection.classList.remove('hidden');
    form.reset();

    // Reset to imperial
    unitBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === 'imperial');
    });
    currentUnit = 'imperial';
    heightImperial.classList.remove('hidden');
    heightMetric.classList.add('hidden');
    weightUnit.textContent = 'lb';
});

// Copy shareable link
copyLinkBtn.addEventListener('click', async () => {
    // Create a shareable URL with BMI encoded
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?bmi=${currentBMI.toFixed(1)}`;

    try {
        await navigator.clipboard.writeText(shareUrl);

        // Visual feedback
        const originalText = copyLinkBtn.innerHTML;
        copyLinkBtn.classList.add('copied');
        copyLinkBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;

        setTimeout(() => {
            copyLinkBtn.classList.remove('copied');
            copyLinkBtn.innerHTML = originalText;
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Link copied to clipboard!');
    }
});

// Check for shared BMI in URL on page load
function checkSharedBMI() {
    const params = new URLSearchParams(window.location.search);
    const sharedBMI = params.get('bmi');

    if (sharedBMI) {
        const bmi = parseFloat(sharedBMI);
        if (!isNaN(bmi) && bmi > 0 && bmi < 100) {
            const category = getTurkCategory(bmi);

            // Store for sharing
            currentBMI = bmi;
            currentCategory = category.class;

            // Update UI
            turkStatus.textContent = category.label;
            turkStatus.className = category.class;
            bmiNumber.textContent = bmi.toFixed(1);
            resultMessage.textContent = "Someone shared their results with you. Are you turked too?";

            // Position marker
            positionMarker(bmi);

            // Hide weight ranges for shared links (no height data)
            document.getElementById('weight-ranges').classList.add('hidden');

            // Show result, hide definition, show info
            form.classList.add('hidden');
            definitionSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
            infoSection.classList.remove('hidden');

            // Generate shareable image for iOS long-press save
            generateShareImage();
        }
    }
}

// Run on page load
checkSharedBMI();
