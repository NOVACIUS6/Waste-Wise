const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ===== MIDTRANS CONFIGURATION =====
// TODO: Replace with your real Midtrans credentials from dashboard.midtrans.com
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY_HERE';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY_HERE';

// Sample recycling locations
const locations = [
  { id: 1, name: 'Tempat Daur Ulang A', lat: -6.200000, lng: 106.816666, address: 'Jl. Contoh No.1' },
  { id: 2, name: 'Tempat Daur Ulang B', lat: -6.210000, lng: 106.826666, address: 'Jl. Contoh No.2' },
  { id: 3, name: 'Tempat Daur Ulang C', lat: -6.220000, lng: 106.836666, address: 'Jl. Contoh No.3' }
];

// ===== ROUTES =====

// Get all locations
app.get('/api/locations', (req, res) => {
  res.json({ data: locations });
});

// Create Midtrans Snap Token
app.post('/api/payment/create-snap-token', (req, res) => {
  const { orderId, amount, wasteType, weight, location, paymentMethod } = req.body;

  // TODO: Implement actual Midtrans API call using axios or node-fetch
  // Example structure:
  /*
  const midtransClient = require('midtrans-client');
  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY
  });

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount
    },
    credit_card: {
      secure: true
    },
    customer_details: {
      email: 'customer@example.com'
    }
  };

  snap.createTransaction(parameter)
    .then((transaction) => {
      const snapToken = transaction.token;
      res.json({ snapToken });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
  */

  // For now, return a mock token (replace with real implementation)
  res.json({
    snapToken: 'MOCK_SNAP_TOKEN_' + Date.now()
  });
});

// Save Transaction (Mock)
app.post('/api/payment/save-transaction', (req, res) => {
  const { transactionId, orderId, amount, status, wasteType, weight, location } = req.body;

  // TODO: Save to database
  console.log('📝 Transaction saved:', {
    transactionId,
    orderId,
    amount,
    status,
    wasteType,
    weight,
    location
  });

  res.json({
    success: true,
    message: 'Transaction recorded',
    transactionId
  });
});

// Midtrans Webhook Handler
app.post('/api/payment/webhook', (req, res) => {
  const { transaction_status, transaction_id, order_id } = req.body;

  // TODO: Verify webhook with Midtrans
  console.log('🔔 Webhook received:', {
    status: transaction_status,
    transaction_id,
    order_id
  });

  // Handle different transaction statuses
  switch (transaction_status) {
    case 'capture':
    case 'settlement':
      console.log('✅ Payment successful');
      break;
    case 'pending':
      console.log('⏳ Payment pending');
      break;
    case 'deny':
    case 'cancel':
      console.log('❌ Payment failed');
      break;
  }

  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
  console.log(`📝 Make sure to set MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY environment variables`);
});
