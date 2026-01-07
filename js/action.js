// js/action.js
document.addEventListener('DOMContentLoaded', () => {

    /* ======================
       CHECK LOGIN STATUS
    ====================== */
    function checkLoginStatus() {
        if (!isLoggedIn()) {
            showLoginAlert();
            setTimeout(() => {
                window.location.href = 'auth.html';
            }, 2000);
            return false;
        }
        return true;
    }

    function showLoginAlert() {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #fff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 1001;
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;
        alert.innerHTML = `
            <h2 style="margin-top: 0; color: #1a1a1a;">🔐 Harus Login</h2>
            <p style="color: #666; margin: 15px 0;">Anda harus login terlebih dahulu untuk mengumpulkan poin dari pembayaran.</p>
            <p style="color: #14a085; font-weight: 600;">Redirecting ke halaman login...</p>
        `;
        document.body.appendChild(alert);
    }

    /* ======================
       STATE GLOBAL
    ====================== */
    let selectedLocation = null;
    let userLocation = null;
    let estimatedCost = null;

    /* ======================
       LOAD COMPONENT
    ====================== */
    async function loadComponents() {
        try {
            // Load form component
            const formHtml = await (await fetch('components/form-component.html')).text();
            document.getElementById('form-container').innerHTML = formHtml;

            // Initialize app after form is loaded
            initializeApp();

        } catch (err) {
            console.error('❌ Gagal memuat komponen:', err);
        }
    }

    /* ======================
       INIT APP
    ====================== */
    function initializeApp() {
        // ✅ INIT FORM
        if (typeof window.initForm === 'function') {
            window.initForm();
        }

        // Initialize map modal
        if (typeof window.initMapModal === 'function') {
            window.initMapModal();
        }

        // Initialize payment gateway
        if (typeof window.initPaymentGateway === 'function') {
            window.initPaymentGateway();
        }

        // Initialize auth UI
        if (typeof window.initAuth === 'function') {
            window.initAuth();
        }

        // Listener untuk cost calculation
        document.getElementById('wasteWeight')
            ?.addEventListener('input', calculateCost);

        document.getElementById('wasteType')
            ?.addEventListener('change', calculateCost);
    }

    /* ======================
       MAP ↔ FORM BRIDGE
    ====================== */
    window.selectLocation = (loc) => {
        selectedLocation = loc;
        console.log('📍 Lokasi dipilih:', loc.name);

        // Try new form structure first (Step 2 modal)
        const statusBox = document.getElementById('locationStatusBox');
        const displayBox = document.getElementById('selectedLocationBox');
        
        if (statusBox) {
            statusBox.style.display = 'none';
        }
        if (displayBox) {
            displayBox.style.display = 'block';
        }

        // Update location display
        const nameEl = document.getElementById('selectedLocationName');
        const addressEl = document.getElementById('selectedLocationAddress');
        
        if (nameEl) nameEl.innerText = loc.name;
        if (addressEl) addressEl.innerText = loc.address;

        // Trigger cost calculation
        calculateCost();
    };

    window.getSelectedLocation = () => selectedLocation;

    window.updateUserLocation = (loc) => {
        userLocation = loc;
        calculateCost();
    };

    /* ======================
       COST CALCULATION
    ====================== */
    function calculateCost() {
        const weight = Number(document.getElementById('wasteWeight')?.value || 0);
        const costEl = document.getElementById('costEstimation');
        const distEl = document.getElementById('distanceInfo');

        if (!selectedLocation || weight <= 0) {
            if (costEl) costEl.innerText = 'Biaya: Tentukan lokasi & berat terlebih dahulu';
            if (distEl) distEl.innerText = '';
            estimatedCost = null;
            return;
        }

        // Calculate distance if user location available
        let distance = 0;
        if (userLocation) {
            distance = calculateDistance(
                userLocation.lat, userLocation.lng,
                selectedLocation.lat, selectedLocation.lng
            );
        }

        // Base cost calculation: Rp 5000 + Rp 2000/km + Rp 1000/kg
        const total =
            5000 +          
            (distance * 2000) +
            (weight * 1000);

        estimatedCost = Math.round(total);

        if (costEl)
            costEl.innerText = `Biaya: Rp ${estimatedCost.toLocaleString('id-ID')}`;

        if (distEl && distance > 0)
            distEl.innerText = `📍 Jarak: ${distance.toFixed(2)} km`;
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius Bumi dalam km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    window.getEstimatedCost = () => estimatedCost;

    /* ======================
       START
    ====================== */
    // Check login first before loading
    if (checkLoginStatus()) {
        loadComponents();
    }
});
