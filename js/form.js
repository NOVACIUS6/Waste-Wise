(function () {
    'use strict';

    let currentStep = 0;
    let steps = [];
    let stepper = [];
    let form = null;
    let isInitialized = false;

    /* ==========================
       PUBLIC FUNCTIONS
    ========================== */
    window.completeForm = function() {
        alert('🎉 Pengiriman berhasil dicatat! Terima kasih telah berkontribusi.');
        // Reset form
        form.reset();
        showStep(0);
    };

    window.goToHome = function() {
        window.location.href = 'index.html#community-impact';
    };

    window.initForm = function () {
        if (isInitialized) return;

        form = document.getElementById('wasteForm');
        steps = document.querySelectorAll('.form-step');
        stepper = document.querySelectorAll('.step');

        if (!form || !steps.length || !stepper.length) {
            console.warn('⚠️ Form / step tidak ditemukan');
            return;
        }

        currentStep = 0;
        showStep(0);
        bindEvents();
        isInitialized = true;
    };

    /* ==========================
       STEP NAVIGATION
    ========================== */
    function showStep(index) {
        steps.forEach(step => step.classList.remove('active'));
        stepper.forEach(s => s.classList.remove('active', 'completed'));

        steps[index]?.classList.add('active');

        stepper.forEach((s, i) => {
            if (i < index) s.classList.add('completed');
            if (i === index) s.classList.add('active');
        });

        currentStep = index;
    }

    function nextStep() {
        if (currentStep === 0 && !validateStep1()) return;
        if (currentStep === 1 && !validateStep2()) return;

        if (currentStep < steps.length - 1) {
            showStep(++currentStep);

            if (currentStep === 2) {
                updateSummary();
            }
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            showStep(--currentStep);
        }
    }

    /* ==========================
       VALIDATION
    ========================== */
    function validateStep1() {
        const wasteType = getEl('wasteType');
        const wasteWeight = getEl('wasteWeight');

        resetField(wasteType);
        resetField(wasteWeight);

        if (!wasteType?.value) {
            showError(wasteType, '⚠️ Pilih jenis sampah');
            return false;
        }

        if (!wasteWeight?.value || Number(wasteWeight.value) < 1) {
            showError(wasteWeight, '⚠️ Berat minimal 1 kg');
            return false;
        }

        return true;
    }

    function validateStep2() {
        const location = window.getSelectedLocation?.();
        if (!location) {
            alert('⚠️ Pilih lokasi daur ulang terlebih dahulu');
            return false;
        }
        return true;
    }

    /* ==========================
       SUMMARY & PAYMENT
    ========================== */
    function updateSummary() {
        setText('summaryType', getValue('wasteType', '-'));
        setText('summaryCondition', getValue('wasteCondition', '-'));
        setText('summaryWeight', getValue('wasteWeight', '-'));

        const loc = window.getSelectedLocation?.();
        setText('summaryLocation', loc ? loc.name : '-');

        setText('summaryAddress', getValue('pickupAddress', '-'));

        // Ambil biaya dari action.js (jika ada)
        const cost = window.getEstimatedCost?.();
        setText('summaryCost', cost ? `Rp ${cost.toLocaleString('id-ID')}` : 'Rp -');
    }


    function processPayment() {
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        let payment = null;
        
        for (let radio of paymentRadios) {
            if (radio.checked) {
                payment = radio.value;
                break;
            }
        }

        if (!payment) {
            alert('⚠️ Pilih metode pembayaran');
            return;
        }

        // Prepare order data
        const orderData = {
            wasteType: getValue('wasteType', ''),
            weight: getValue('wasteWeight', ''),
            location: document.getElementById('selectedLocationName')?.innerText || '',
            totalCost: window.getEstimatedCost?.() || 0
        };

        // Process payment dengan payment gateway
        window.processPayment?.(orderData, payment).then(success => {
            if (success) {
                calculateImpact();
                nextStep();
                window.showPaymentSuccess?.(window.getPaymentStatus?.().transactionId);
            }
        }).catch(error => {
            console.error('Payment failed:', error);
        });
    }

    function calculateImpact() {
        const weight = Number(getValue('wasteWeight', 0));
        const type = getValue('wasteType', '');

        let co2Factor = 1;
        if (type === 'plastik') co2Factor = 2.5;
        if (type === 'elektronik') co2Factor = 5;

        const points = weight * 10;
        const co2Saved = (weight * co2Factor).toFixed(1);

        setText('finalPoints', points);
        setText('impactCO2', co2Saved);

        // Add points to user if logged in - IMMEDIATELY
        if (window.addUserPoints) {
            window.addUserPoints(points, 'waste_delivery');
            console.log(`✅ Added ${points} points to user account`);
            // Save contribution to localStorage for display on homepage
            const contribution = {
                type: type,
                weight: weight,
                points: points,
                co2: co2Saved,
                timestamp: new Date().toISOString(),
                location: document.getElementById('selectedLocationName')?.innerText || 'Unknown'
            };
            localStorage.setItem('wastewise_last_contribution', JSON.stringify(contribution));
        }
    }

    /* ==========================
       EVENTS (SAFE)
    ========================== */
    function bindEvents() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (!btn || !form.contains(btn)) return;

            if (btn.classList.contains('next-btn')) nextStep();
            if (btn.classList.contains('prev-btn')) prevStep();
            if (btn.id === 'process-payment-btn') processPayment();
        });

        form.addEventListener('submit', e => {
            e.preventDefault();
            alert('🎉 Pengiriman berhasil dicatat!');
            // TODO: kirim ke backend (fetch / axios)
        });
    }

    /* ==========================
       HELPERS
    ========================== */
    function getEl(id) {
        return document.getElementById(id);
    }

    function getValue(id, fallback = '') {
        return getEl(id)?.value ?? fallback;
    }

    function setText(id, value) {
        const el = getEl(id);
        if (el) el.innerText = value;
    }

    function resetField(el) {
        if (el) el.style.borderColor = '#e9e9e9';
    }

    function showError(el, message) {
        alert(message);
        el.style.borderColor = 'red';
        el.focus();
    }

})();
