/**
 * Map Modal Logic for Location Selection
 * Handles modal opening, map rendering, and location selection
 */

(function() {
    'use strict';

    let mapModalInstance = null;
    let mapModalMarkers = [];
    let selectedLocationInModal = null;

    /**
     * Initialize Map Modal
     */
    window.initMapModal = async function() {
        try {
            // Load modal HTML
            const modalHtml = await (await fetch('components/map-modal.html')).text();
            
            // Insert modal into body
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = modalHtml;
            document.body.appendChild(tempDiv.firstElementChild);

            setupMapModalEvents();
        } catch (err) {
            console.error('❌ Gagal memuat map modal:', err);
        }
    };

    /**
     * Setup Map Modal Events
     */
    function setupMapModalEvents() {
        const mapModal = document.getElementById('mapModal');
        const openMapBtn = document.getElementById('openMapModalBtn');
        const changeLocationBtn = document.getElementById('changeLocationBtn');
        const closeMapBtn = document.getElementById('closeMapModalBtn');
        const closeMapBtn2 = document.getElementById('closeMapModalBtn2');

        if (openMapBtn) {
            openMapBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openMapModal();
            });
        }

        if (changeLocationBtn) {
            changeLocationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openMapModal();
            });
        }

        if (closeMapBtn) {
            closeMapBtn.addEventListener('click', closeMapModal);
        }

        if (closeMapBtn2) {
            closeMapBtn2.addEventListener('click', closeMapModal);
        }

        // Close on backdrop click
        if (mapModal) {
            mapModal.addEventListener('click', (e) => {
                if (e.target === mapModal) {
                    closeMapModal();
                }
            });
        }

        // Setup filter buttons
        document.querySelectorAll('.map-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                filterLocationsInModal(filter);
            });
        });
    }

    /**
     * Open Map Modal
     */
    function openMapModal() {
        const mapModal = document.getElementById('mapModal');
        if (!mapModal) {
            console.error('Map modal tidak ditemukan');
            return;
        }

        mapModal.style.display = 'flex';

        // Initialize map jika belum
        if (!mapModalInstance) {
            setTimeout(() => {
                initMapInModal();
            }, 100);
        }
    }

    /**
     * Close Map Modal
     */
    function closeMapModal() {
        const mapModal = document.getElementById('mapModal');
        if (mapModal) {
            mapModal.style.display = 'none';
        }
    }

    /**
     * Initialize Map in Modal
     */
    function initMapInModal() {
        if (typeof L === 'undefined') {
            console.error('Leaflet tidak loaded');
            return;
        }

        const mapContainer = document.getElementById('mapModalContainer');
        if (!mapContainer) return;

        // Destroy existing map if any
        if (mapModalInstance) {
            mapModalInstance.remove();
        }

        // Create new map centered at Jakarta
        mapModalInstance = L.map('mapModalContainer').setView([-6.2000, 106.8166], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapModalInstance);

        // Render locations
        renderLocationsInModal();
    }

    /**
     * Render Locations in Modal
     */
    function renderLocationsInModal() {
        const locationContainer = document.getElementById('mapLocationItems');
        if (!locationContainer || !mapModalInstance) return;

        // Get all locations from global allLocations (from map.js)
        let allLocations = window.allLocations || [];

        // If allLocations is not available, use default locations
        if (allLocations.length === 0) {
            allLocations = getDefaultLocations();
        }

        locationContainer.innerHTML = '';
        mapModalMarkers.forEach(m => mapModalInstance.removeLayer(m.marker));
        mapModalMarkers.length = 0;

        allLocations.forEach(loc => {
            // Create custom icon for markers
            const markerIcon = createMarkerIcon(loc.type);

            // Add marker to map
            const marker = L.marker([loc.lat, loc.lng], { icon: markerIcon })
                .addTo(mapModalInstance)
                .bindPopup(`
                    <div style="font-family: Inter, sans-serif;">
                        <strong>${loc.name}</strong><br>
                        <small>${loc.address}</small>
                    </div>
                `);

            mapModalMarkers.push({ marker, type: loc.type, data: loc });

            // Add to location list
            const item = document.createElement('div');
            item.className = 'location-item-modal';
            item.innerHTML = `
                <strong>${loc.name}</strong>
                <div class="location-address">📍 ${loc.address}</div>
                <div class="location-type">${capitalizeFirst(loc.type)}</div>
            `;

            item.addEventListener('click', () => {
                selectLocationInModal(loc, item);
            });

            locationContainer.appendChild(item);
        });

        console.log(`✅ Loaded ${allLocations.length} locations on map`);
    }

    /**
     * Create Custom Marker Icon by Type
     */
    function createMarkerIcon(type) {
        let color = '#14a085'; // default green
        let icon = '🗑️';

        if (type === 'plastik') {
            color = '#3498db';
            icon = '🧴';
        } else if (type === 'elektronik') {
            color = '#e74c3c';
            icon = '💻';
        } else if (type === 'organik') {
            color = '#2ecc71';
            icon = '🥬';
        }

        return L.divIcon({
            html: `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background-color: ${color};
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                    font-size: 20px;
                    cursor: pointer;
                ">
                    ${icon}
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
            className: 'custom-marker'
        });
    }

    /**
     * Get Default Locations (fallback)
     */
    function getDefaultLocations() {
        return [
            {
                id: 1,
                name: "Bank Sampah Sejahtera - Jakarta Pusat",
                address: "Jl. Merdeka No. 10, Jakarta",
                lat: -6.1754,
                lng: 106.8272,
                type: "plastik"
            },
            {
                id: 2,
                name: "Drop-off Elektronik SCBD",
                address: "Sudirman Central Business District, Jakarta Selatan",
                lat: -6.2247,
                lng: 106.8077,
                type: "elektronik"
            },
            {
                id: 3,
                name: "Pusat Daur Ulang Kertas Thamrin",
                address: "Jl. Thamrin No. 5, Jakarta",
                lat: -6.1889,
                lng: 106.8231,
                type: "organik"
            },
            {
                id: 4,
                name: "Bandung Eco-Center",
                address: "Jl. Dago No. 150, Bandung",
                lat: -6.8915,
                lng: 107.6107,
                type: "organik"
            },
            {
                id: 5,
                name: "Tangsel Waste Hub",
                address: "BSD City, Tangerang Selatan",
                lat: -6.3032,
                lng: 106.6668,
                type: "plastik"
            },
            {
                id: 6,
                name: "Semarang Recycle Point",
                address: "Jl. Pemuda No. 1, Semarang",
                lat: -6.9702,
                lng: 110.4178,
                type: "elektronik"
            },
            {
                id: 7,
                name: "Yogyakarta Green Project",
                address: "Kawasan Malioboro, Yogyakarta",
                lat: -7.7956,
                lng: 110.3695,
                type: "plastik"
            },
            {
                id: 8,
                name: "Surabaya Zero Waste",
                address: "Jl. Tunjungan No. 12, Surabaya",
                lat: -7.2575,
                lng: 112.7521,
                type: "organik"
            }
        ];
    }

    /**
     * Select Location in Modal
     */
    function selectLocationInModal(location, itemElement) {
        selectedLocationInModal = location;
        console.log('🔍 Selected location in modal:', location);

        // Update UI - highlight selected item
        document.querySelectorAll('.location-item-modal').forEach(item => {
            item.classList.remove('selected');
        });
        if (itemElement) {
            itemElement.classList.add('selected');
        }

        // Pan map to location
        if (mapModalInstance) {
            mapModalInstance.setView([location.lat, location.lng], 15);
        }

        // Open popup
        const marker = mapModalMarkers.find(m => m.data.id === location.id);
        if (marker) {
            marker.marker.openPopup();
        }

        // After short delay, close modal and update form
        setTimeout(() => {
            closeMapModal();
            updateFormWithSelectedLocation(location);
        }, 800);
    }

    /**
     * Update Form with Selected Location
     */
    function updateFormWithSelectedLocation(location) {
        console.log('📌 Updating form with location:', location);

        // Find form elements - with better error handling
        const statusBox = document.getElementById('locationStatusBox');
        const displayBox = document.getElementById('selectedLocationBox');
        const nameEl = document.getElementById('selectedLocationName');
        const addressEl = document.getElementById('selectedLocationAddress');
        const changeBtn = document.getElementById('changeLocationBtn');

        // Check if elements exist
        if (!displayBox) {
            console.error('❌ selectedLocationBox not found');
            return;
        }

        // Hide status, show selected
        if (statusBox) {
            statusBox.style.display = 'none';
        }
        displayBox.style.display = 'block';

        // Update location info
        if (nameEl) nameEl.innerText = location.name;
        if (addressEl) addressEl.innerText = location.address;

        // Setup change location button
        if (changeBtn) {
            changeBtn.onclick = (e) => {
                e.preventDefault();
                openMapModal();
            };
        }

        // Update global state via action.js
        if (window.selectLocation) {
            console.log('✅ Calling window.selectLocation');
            window.selectLocation(location);
        } else {
            console.warn('⚠️ window.selectLocation not found');
        }

        console.log('✅ Location updated in form');
    }

    /**
     * Filter Locations in Modal
     */
    function filterLocationsInModal(filter) {
        mapModalMarkers.forEach(obj => {
            if (filter === 'all' || filter === obj.type) {
                mapModalInstance.addLayer(obj.marker);
            } else {
                mapModalInstance.removeLayer(obj.marker);
            }
        });
    }

    /**
     * Helper: Capitalize first letter
     */
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Export public methods
    window.openMapModal = openMapModal;
    window.closeMapModal = closeMapModal;

})();
