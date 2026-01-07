# WasteWise Setup & Deployment Guide

## Project Overview
WasteWise adalah web aplikasi untuk membantu pengguna menemukan lokasi daur ulang terdekat dan mengelola sampah dengan bijak.

### File Structure
```
WasteWise2/
├── index.html           # Halaman utama (home)
├── action.html          # Halaman aksi dengan peta lokasi daur ulang
├── education.html       # Halaman edukasi (placeholder)
├── server.js            # Backend API (Express)
├── package.json         # Dependencies
├── style/
│   ├── style.css        # Main stylesheet
│   ├── actionStyle.css  # Action page styles
│   └── img/
│       ├── 12.png       # Hero slider image 1
│       ├── 13.png       # Hero slider image 2
│       ├── 14.png       # Hero slider image 3
│       └── 15.png       # Hero slider image 4
```

## Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm start
```
Server akan berjalan di: `http://localhost:3000`

### 3. Open in Browser
- Home: `http://localhost:3000/index.html`
- Action (Maps): `http://localhost:3000/action.html`
- Education: `http://localhost:3000/education.html`

## Features

### ✅ Completed
- **Slider UX Improvements**
  - Durasi: 7 detik per slide (28 detik full cycle)
  - Kontrol: Panah kiri/kanan + indikator dots
  - Pause on hover: Autoplay berhenti saat kursor di atas slider
  
- **Visual Consistency**
  - Accent color: Hijau (#14a085) di tombol, panah, dan dots
  - Responsive design untuk semua ukuran layar
  
- **Backend API**
  - Endpoint: `GET /api/locations`
  - Returns: Array lokasi daur ulang dengan lat/lng
  
- **Maps Integration (action.html)**
  - Google Maps embedded dengan marker untuk setiap lokasi
  - Click marker untuk melihat info lokasi
  - Click list item untuk pan ke lokasi dan buka info window

## Configuration

### Google Maps API Key
Edit `action.html` dan ganti `YOUR_GOOGLE_MAPS_API_KEY` dengan kunci API Anda:
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&callback=initMap"></script>
```

Dapatkan key gratis di: https://console.cloud.google.com

### Customize Locations
Edit `server.js` untuk mengubah daftar lokasi daur ulang (array `locations`)

## Testing

### Slider
1. Buka `index.html`
2. Tunggu slide berganti otomatis (7s per slide)
3. Hover di atas slider → autoplay berhenti
4. Klik panah atau dots untuk manual navigation

### Maps
1. Buka `action.html`
2. Peta harus muncul dengan 3 marker sample
3. Click marker atau list item untuk melihat detail lokasi

### API
```bash
curl http://localhost:3000/api/locations
```
Response:
```json
{
  "data": [
    {"id": 1, "name": "Tempat Daur Ulang A", "lat": -6.2, "lng": 106.8, "address": "..."}
  ]
}
```

## Deployment Checklist
- [ ] Ganti hero images (12-15.png) dengan aset final
- [ ] Ganti Google Maps API key dengan key production
- [ ] Update lokasi sampah di `server.js` dengan data real
- [ ] Test semua link navigasi
- [ ] Test responsive design di mobile
- [ ] Deploy ke hosting (Vercel, Heroku, etc.)

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes
- API server harus running agar maps berfungsi (fetch `/api/locations`)
- Jika menggunakan hosting statis, integrate API ke backend terpisah atau use mock data
- Pastikan CORS enabled di backend untuk cross-origin requests

---
Last updated: Dec 15, 2025
