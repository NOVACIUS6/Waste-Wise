(function() {
    let map;
    let markers = [];
    
    // DATA LOKASI STATIS (Solusi agar tidak error 404)
const allLocations = [
    // --- JABODETABEK ---
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

    // --- JAWA BARAT & BANTEN ---
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

    // --- JAWA TENGAH & DIY ---
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

    // --- JAWA TIMUR ---
    {
        id: 8,
        name: "Surabaya Zero Waste",
        address: "Jl. Tunjungan No. 12, Surabaya",
        lat: -7.2575,
        lng: 112.7521,
        type: "organik"
    },

    // --- SUMATRA ---
    {
        id: 9,
        name: "Medan Eco-Recycle",
        address: "Jl. Gatot Subroto, Medan",
        lat: 3.5952,
        lng: 98.6722,
        type: "plastik"
    },
    {
        id: 10,
        name: "Palembang Waste Solution",
        address: "Kawasan Ampera, Palembang",
        lat: -2.9761,
        lng: 104.7754,
        type: "elektronik"
    },

    // --- KALIMANTAN ---
    {
        id: 11,
        name: "Balikpapan Green Point",
        address: "Jl. Jenderal Sudirman, Balikpapan",
        lat: -1.2654,
        lng: 116.8312,
        type: "plastik"
    },
    {
        id: 12,
        name: "Pontianak Recycle Center",
        address: "Jl. Gajah Mada, Pontianak",
        lat: -0.0263,
        lng: 109.3425,
        type: "organik"
    },

    // --- SULAWESI ---
    {
        id: 13,
        name: "Makassar Waste Hub",
        address: "Pantai Losari, Makassar",
        lat: -5.1476,
        lng: 119.4327,
        type: "plastik"
    },
    {
        id: 14,
        name: "Manado Eco-Logic",
        address: "Kawasan Megamas, Manado",
        lat: 1.4748,
        lng: 124.8420,
        type: "elektronik"
    },

    // --- BALI & NUSA TENGGARA ---
    {
        id: 15,
        name: "Bali Eco-Point",
        address: "Jl. Bypass Ngurah Rai, Denpasar",
        lat: -8.6705,
        lng: 115.2126,
        type: "plastik"
    },

    // --- PAPUA ---
    {
        id: 16,
        name: "Jayapura Recycle Station",
        address: "Kawasan Ruko Pasifik Permai, Jayapura",
        lat: -2.5411,
        lng: 140.7100,
        type: "plastik"
    }
];

    function initMap() {
        if (typeof L === 'undefined') return;

        // Inisialisasi peta terpusat di Jakarta (sesuaikan koordinat jika perlu)
        map = L.map('map').setView([-6.2000, 106.8166], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        setupEventListeners();
        
        // LANGSUNG RENDER DATA (Tanpa Fetch ke API yang Error)
        renderLocations(allLocations); 
    }

    function renderLocations(locations) {
        const listEl = document.getElementById('location-items');
        if (!listEl) return;

        listEl.innerHTML = '';
        markers.forEach(m => map.removeLayer(m.marker));
        markers.length = 0;

        locations.forEach(loc => {
            const marker = L.marker([loc.lat, loc.lng])
                .addTo(map)
                .bindPopup(`<strong>${loc.name}</strong><br>${loc.address}`);

            markers.push({ marker, type: loc.type, data: loc });

            const item = document.createElement('div');
            item.className = 'location-item';
            item.style.padding = "15px";
            item.style.borderBottom = "1px solid #eee";
            item.style.cursor = "pointer";
            item.innerHTML = `
                <div class="location-header"><span class="location-name"><strong>${loc.name}</strong></span></div>
                <p class="location-address" style="font-size: 0.85rem; color: #666; margin: 5px 0;">${loc.address}</p>
                <small style="color: #14a085; font-weight: bold;">Kategori: ${loc.type}</small>
            `;

            item.onclick = () => {
                map.setView([loc.lat, loc.lng], 15);
                marker.openPopup();
                window.selectLocation(loc); 
            };
            
            listEl.appendChild(item);
        });
    }

    function setupEventListeners() {
        // Filter Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                markers.forEach(obj => {
                    if (filter === 'all' || filter === obj.type) {
                        map.addLayer(obj.marker);
                    } else {
                        map.removeLayer(obj.marker);
                    }
                });
            });
        });

        // Tombol Lokasi Saya
        const locateBtn = document.getElementById('locate-btn');
        if (locateBtn) {
            locateBtn.addEventListener('click', () => {
                map.locate({setView: true, maxZoom: 14});
            });
        }
        
        map.on('locationfound', (e) => {
            L.circleMarker(e.latlng, {color: 'blue', radius: 8}).addTo(map).bindPopup("Lokasi Anda").openPopup();
        });

        map.on('locationerror', () => {
            alert("Gagal mendapatkan lokasi. Pastikan izin lokasi aktif.");
        });
    }

    // Fungsi Global untuk Sinkronisasi ke Form
    window.selectLocation = function(loc) {
        const box = document.getElementById('selectedLocationBox');
        const msg = document.getElementById('noLocationMessage');
        const nameDisplay = document.getElementById('selectedLocationName');

        if (box) box.style.display = 'block';
        if (msg) msg.style.display = 'none';
        if (nameDisplay) nameDisplay.innerText = loc.name;
    };

    window.initMap = initMap;
    // Jalankan saat dokumen siap
    document.addEventListener('DOMContentLoaded', initMap);
})();