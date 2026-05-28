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
const downloadBtn = document.getElementById('download-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');
const definitionSection = document.getElementById('definition-section');
const infoSection = document.getElementById('info-section');

let currentUnit = 'imperial';
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

// Get random message
function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

// Position scale marker
function positionMarker(bmi) {
    // BMI range for visual: 15 to 40
    const minBMI = 15;
    const maxBMI = 40;
    const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmi));
    const percentage = ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 100;

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

    // Update UI
    turkStatus.textContent = category.label;
    turkStatus.className = category.class;
    bmiNumber.textContent = bmi.toFixed(1);
    resultMessage.textContent = getRandomMessage(category.messages);

    // Position marker
    positionMarker(bmi);

    // Show result, hide definition, show info (bias section)
    form.classList.add('hidden');
    definitionSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    infoSection.classList.remove('hidden');

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
});

// Reset
resetBtn.addEventListener('click', () => {
    resultSection.classList.add('hidden');
    infoSection.classList.add('hidden');
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

// Download share card as image (Instagram Stories: 1080x1920)
downloadBtn.addEventListener('click', async () => {
    try {
        const canvas = await html2canvas(shareCard, {
            backgroundColor: '#0a1628',
            scale: 4, // 270x480 * 4 = 1080x1920 (Instagram Stories)
            logging: false,
            useCORS: true
        });

        // Create download link
        const link = document.createElement('a');
        link.download = `am-i-turked-${currentCategory}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('Error generating image:', error);
        alert('Could not generate image. Try taking a screenshot instead.');
    }
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

            // Show result, hide definition, show info
            form.classList.add('hidden');
            definitionSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
            infoSection.classList.remove('hidden');
        }
    }
}

// Run on page load
checkSharedBMI();
