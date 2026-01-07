/**
 * Payment Gateway System for Waste Wise
 * Mendukung Midtrans (Snap) dan mock payment untuk development
 */

(function() {
    'use strict';

    // Payment Methods
    const PAYMENT_METHODS = {
        transfer: { name: 'Transfer Bank', code: 'transfer', fee: 0 },
        ewallet: { name: 'E-Wallet (GCash, Dana, OVO)', code: 'ewallet', fee: 0 },
        creditcard: { name: 'Kartu Kredit', code: 'creditcard', fee: 2.5 },
        virtual: { name: 'Virtual Account', code: 'virtual', fee: 0 },
        mock: { name: 'Demo Payment (Testing)', code: 'mock', fee: 0 }
    };

    // Global Payment State
    let paymentState = {
        totalCost: 0,
        paymentMethod: null,
        transactionId: null,
        status: 'pending'
    };

    /**
     * Initialize Payment Gateway
     */
    window.initPaymentGateway = function() {
        // Load Midtrans Snap Script (if using real payment)
        const script = document.createElement('script');
        script.src = 'https://app.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', 'YOUR_CLIENT_KEY_HERE'); // Replace with real key
        document.head.appendChild(script);

        console.log('✅ Payment Gateway initialized');
    };

    /**
     * Get available payment methods
     */
    window.getPaymentMethods = function() {
        return PAYMENT_METHODS;
    };

    /**
     * Process Payment
     * @param {Object} orderData - Data pesanan dari form
     * @param {String} method - Payment method code
     */
    window.processPayment = async function(orderData, method) {
        if (!method) {
            showPaymentError('Pilih metode pembayaran terlebih dahulu');
            return false;
        }

        paymentState.paymentMethod = method;
        paymentState.totalCost = orderData.totalCost;

        try {
            if (method === 'mock') {
                return await processMockPayment(orderData);
            } else {
                return await processMidtransPayment(orderData, method);
            }
        } catch (error) {
            showPaymentError(`Gagal memproses pembayaran: ${error.message}`);
            return false;
        }
    };

    /**
     * Mock Payment untuk Development/Testing
     */
    async function processMockPayment(orderData) {
        return new Promise((resolve) => {
            // Tampilkan modal pembayaran mock
            showMockPaymentModal(orderData, () => {
                paymentState.transactionId = generateTransactionId();
                paymentState.status = 'success';
                
                console.log('✅ Mock Payment Success:', paymentState.transactionId);
                resolve(true);
            });
        });
    }

    /**
     * Midtrans Payment Processing
     */
    async function processMidtransPayment(orderData, method) {
        try {
            const snapToken = await getSnapToken(orderData, method);
            
            return new Promise((resolve, reject) => {
                // Trigger Midtrans Snap Payment
                if (window.snap) {
                    window.snap.pay(snapToken, {
                        onSuccess: function(result) {
                            paymentState.transactionId = result.transaction_id;
                            paymentState.status = 'success';
                            console.log('✅ Midtrans Payment Success:', result);
                            resolve(true);
                        },
                        onPending: function(result) {
                            console.log('⏳ Payment Pending:', result);
                            resolve(true);
                        },
                        onError: function(result) {
                            console.error('❌ Midtrans Payment Error:', result);
                            reject(new Error('Payment failed'));
                        },
                        onClose: function() {
                            console.log('User closed payment modal');
                            reject(new Error('Payment cancelled'));
                        }
                    });
                } else {
                    reject(new Error('Midtrans Snap not loaded'));
                }
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get Snap Token dari Backend
     */
    async function getSnapToken(orderData, method) {
        const response = await fetch('/api/payment/create-snap-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: generateTransactionId(),
                amount: orderData.totalCost,
                wasteType: orderData.wasteType,
                weight: orderData.weight,
                location: orderData.location,
                paymentMethod: method
            })
        });

        if (!response.ok) throw new Error('Failed to get snap token');
        
        const data = await response.json();
        return data.snapToken;
    }

    /**
     * Show Mock Payment Modal
     */
    function showMockPaymentModal(orderData, onSuccess) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content">
                <button class="close-btn">&times;</button>
                <div class="payment-header">
                    <h2>💳 Demo Pembayaran</h2>
                    <p>Simulasi Pembayaran untuk Testing</p>
                </div>

                <div class="payment-details">
                    <div class="detail-row">
                        <span>Jenis Sampah:</span>
                        <strong>${orderData.wasteType}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Berat:</span>
                        <strong>${orderData.weight} kg</strong>
                    </div>
                    <div class="detail-row">
                        <span>Lokasi:</span>
                        <strong>${orderData.location}</strong>
                    </div>
                    <div class="detail-row total">
                        <span>Total Biaya:</span>
                        <strong>Rp ${orderData.totalCost.toLocaleString('id-ID')}</strong>
                    </div>
                </div>

                <div class="payment-instruction">
                    <h3>📋 Instruksi Demo</h3>
                    <p>Klik "Selesaikan Pembayaran" untuk melanjutkan proses pickup sampah Anda.</p>
                </div>

                <div class="payment-actions">
                    <button class="btn-payment-cancel">Batal</button>
                    <button class="btn-payment-success">✓ Selesaikan Pembayaran</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event Listeners
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.btn-payment-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('.btn-payment-success').addEventListener('click', () => {
            modal.remove();
            onSuccess();
        });

        // Add backdrop click handler
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    /**
     * Get Payment Status
     */
    window.getPaymentStatus = function() {
        return paymentState;
    };

    /**
     * Validate Payment Method
     */
    window.validatePaymentMethod = function(method) {
        return method && PAYMENT_METHODS[method] !== undefined;
    };

    /**
     * Format Currency
     */
    window.formatCurrency = function(amount) {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    /**
     * Generate Transaction ID
     */
    function generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `WW-${timestamp}-${random}`;
    }

    /**
     * Show Payment Error
     */
    function showPaymentError(message) {
        const alert = document.createElement('div');
        alert.className = 'payment-alert error';
        alert.innerHTML = `
            <span class="alert-icon">❌</span>
            <span class="alert-message">${message}</span>
        `;
        document.body.appendChild(alert);

        setTimeout(() => alert.remove(), 4000);
    }

    /**
     * Show Payment Success
     */
    window.showPaymentSuccess = function(transactionId) {
        const alert = document.createElement('div');
        alert.className = 'payment-alert success';
        alert.innerHTML = `
            <span class="alert-icon">✅</span>
            <span class="alert-message">Pembayaran berhasil! ID: ${transactionId}</span>
        `;
        document.body.appendChild(alert);

        setTimeout(() => alert.remove(), 4000);
    };

})();
