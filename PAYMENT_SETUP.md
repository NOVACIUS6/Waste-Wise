# Payment Gateway Setup Guide

## Overview
Waste Wise menggunakan sistem payment gateway terintegrasi dengan mendukung:
- **Midtrans (Snap)** - Payment gateway production
- **Mock Payment** - Untuk development dan testing

## File-File Payment System

```
js/payment.js          - Payment gateway logic
style/css/payment.css  - Payment UI styles
server.js             - Backend payment endpoints
```

## Setup Instructions

### 1. Development Mode (Mock Payment)
Tidak memerlukan konfigurasi. Gunakan payment method "Demo Payment (Testing)" di form.

### 2. Production Mode (Midtrans)

#### A. Daftar Midtrans
1. Buka https://dashboard.midtrans.com
2. Daftar akun baru atau login
3. Buat merchant baru
4. Dapatkan **Server Key** dan **Client Key** dari dashboard

#### B. Konfigurasi Environment Variables

**Windows (PowerShell):**
```powershell
$env:MIDTRANS_SERVER_KEY = "YOUR_SERVER_KEY"
$env:MIDTRANS_CLIENT_KEY = "YOUR_CLIENT_KEY"
npm start
```

**Linux/Mac:**
```bash
export MIDTRANS_SERVER_KEY="YOUR_SERVER_KEY"
export MIDTRANS_CLIENT_KEY="YOUR_CLIENT_KEY"
npm start
```

**Atau buat file `.env`:**
```
MIDTRANS_SERVER_KEY=YOUR_SERVER_KEY
MIDTRANS_CLIENT_KEY=YOUR_CLIENT_KEY
```

#### C. Update server.js
1. Buka `server.js`
2. Uncomment bagian Midtrans API call
3. Install dependency: `npm install midtrans-client`

#### D. Update action.html
1. Buka `action.html`
2. Temukan: `<script src="https://app.midtrans.com/snap/snap.js">`
3. Ganti `data-client-key` dengan Client Key Anda

### 3. Payment Methods Tersedia

| Method | Code | Status |
|--------|------|--------|
| Transfer Bank | transfer | ✅ Siap |
| E-Wallet (GCash, Dana, OVO) | ewallet | ✅ Siap |
| Kartu Kredit | creditcard | ✅ Siap (Fee 2.5%) |
| Virtual Account | virtual | ✅ Siap |
| Demo Payment | mock | ✅ Siap |

### 4. Payment Flow

```
User Submit Form
    ↓
Select Payment Method
    ↓
Process Payment Gateway
    ↓
├─ Mock Payment → Show Demo Modal
└─ Midtrans → Open Snap Payment Window
    ↓
Payment Success/Failed
    ↓
Calculate Impact & Claim Points
```

## API Endpoints

### POST /api/payment/create-snap-token
Membuat Snap token untuk pembayaran

**Request:**
```json
{
  "orderId": "WW-1234567890-1234",
  "amount": 50000,
  "wasteType": "plastik",
  "weight": "5",
  "location": "Bank Sampah Sejahtera",
  "paymentMethod": "transfer"
}
```

**Response:**
```json
{
  "snapToken": "SNAP_TOKEN_HERE"
}
```

### POST /api/payment/save-transaction
Menyimpan data transaksi ke database

**Request:**
```json
{
  "transactionId": "WW-1234567890-1234",
  "orderId": "ORDER_ID",
  "amount": 50000,
  "status": "success",
  "wasteType": "plastik",
  "weight": "5",
  "location": "Bank Sampah Sejahtera"
}
```

### POST /api/payment/webhook
Webhook handler untuk notifikasi pembayaran dari Midtrans

## Troubleshooting

### Snap tidak muncul
- ✅ Pastikan `data-client-key` sudah diset
- ✅ Pastikan script Midtrans Snap sudah loaded
- ✅ Check browser console untuk error messages

### Payment method tidak tersedia
- ✅ Verify Client Key dan Server Key
- ✅ Pastikan merchant aktif di Midtrans dashboard
- ✅ Hubungi Midtrans support untuk aktivasi payment method

### Transaction tidak tercatat
- ✅ Pastikan server berjalan (`npm start`)
- ✅ Check server logs untuk error messages
- ✅ Implement database connection untuk save transaction

## Testing Payment

### Mock Payment Testing
1. Pilih "Demo Payment (Testing)"
2. Isi form dengan data sampah
3. Klik "Proses Pembayaran"
4. Di modal, klik "Selesaikan Pembayaran"

### Midtrans Testing
Gunakan test card numbers:
- **Success:** 4111111111111111
- **Pending:** 4000000000000002
- **Decline:** 5555555555554444

Exp: 12/25, CVV: 123

## Next Steps

1. ✅ Update `server.js` dengan Midtrans client library
2. ✅ Implementasi database untuk store transactions
3. ✅ Setup Midtrans webhook handler
4. ✅ Testing di Sandbox environment
5. ✅ Deploy ke production dengan real keys

## Notes

- Jangan commit `MIDTRANS_SERVER_KEY` atau `MIDTRANS_CLIENT_KEY` ke repository
- Gunakan environment variables untuk production
- Test thoroughly di sandbox sebelum production
- Setup proper error handling dan logging

## Support

- Midtrans Documentation: https://docs.midtrans.com
- Contact: https://support.midtrans.com
