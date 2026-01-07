/**
 * Authentication System for Waste Wise
 * Handles login, logout, user session, and points storage
 */

(function() {
    'use strict';

    // Auth storage key
    const AUTH_KEY = 'wastewise_user';
    const POINTS_KEY = 'wastewise_points';

    /**
     * Initialize Auth System
     */
    window.initAuth = function() {
        setupAuthUI();
        console.log('✅ Auth system initialized');
    };

    /**
     * Login User
     */
    window.loginUser = function(email, password) {
        if (!email || !password) {
            showAuthError('Email dan password harus diisi');
            return false;
        }

        if (!validateEmail(email)) {
            showAuthError('Format email tidak valid');
            return false;
        }

        // Create user session
        const user = {
            id: generateUserId(),
            email: email,
            name: email.split('@')[0],
            loginTime: new Date().toISOString(),
            points: 0
        };

        // Save to localStorage
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        
        console.log('✅ User logged in:', user);
        showAuthSuccess(`Selamat datang ${user.name}!`);

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'action.html';
        }, 1500);

        return true;
    };

    /**
     * Register User
     */
    window.registerUser = function(name, email, password, confirmPassword) {
        if (!name || !email || !password || !confirmPassword) {
            showAuthError('Semua field harus diisi');
            return false;
        }

        if (password !== confirmPassword) {
            showAuthError('Password tidak cocok');
            return false;
        }

        if (password.length < 6) {
            showAuthError('Password minimal 6 karakter');
            return false;
        }

        // Create user session
        const user = {
            id: generateUserId(),
            email: email,
            name: name,
            registeredTime: new Date().toISOString(),
            points: 0
        };

        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        
        console.log('✅ User registered:', user);
        showAuthSuccess(`Akun ${name} berhasil dibuat!`);

        setTimeout(() => {
            window.location.href = 'action.html';
        }, 1500);

        return true;
    };

    /**
     * Logout User
     */
    window.logoutUser = function() {
        localStorage.removeItem(AUTH_KEY);
        console.log('✅ User logged out');
        window.location.href = 'auth.html';
    };

    /**
     * Get Current User
     */
    window.getCurrentUser = function() {
        const userJson = localStorage.getItem(AUTH_KEY);
        return userJson ? JSON.parse(userJson) : null;
    };

    /**
     * Check if User is Logged In
     */
    window.isLoggedIn = function() {
        return localStorage.getItem(AUTH_KEY) !== null;
    };

    /**
     * Add Points to User
     */
    window.addUserPoints = function(points, source = 'payment') {
        const user = getCurrentUser();
        
        if (!user) {
            console.warn('⚠️ User not logged in, points not saved');
            return false;
        }

        user.points = (user.points || 0) + points;
        user.lastPointsUpdate = new Date().toISOString();
        user.lastPointsSource = source;

        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        
        console.log(`✅ Added ${points} points to ${user.name}. Total: ${user.points}`);
        return true;
    };

    /**
     * Get User Points
     */
    window.getUserPoints = function() {
        const user = getCurrentUser();
        return user ? (user.points || 0) : 0;
    };

    /**
     * Validate Email Format
     */
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Generate User ID
     */
    function generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Setup Auth UI Events
     */
    function setupAuthUI() {
        // Update header with user info
        updateHeaderWithUserInfo();

        // Check if on auth page
        if (document.getElementById('login-form-content')) {
            setupLoginForm();
        }
        if (document.getElementById('register-form-content')) {
            setupRegisterForm();
        }
    }

    /**
     * Setup Login Form
     */
    function setupLoginForm() {
        const loginForm = document.querySelector('#login-form-content form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            
            loginUser(emailInput.value, passwordInput.value);
        });

        // Google login fallback
        const googleBtn = document.querySelector('.social-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                loginUser('user@google.com', 'password123');
            });
        }
    }

    /**
     * Setup Register Form
     */
    function setupRegisterForm() {
        const registerForm = document.querySelector('#register-form-content form');
        if (!registerForm) return;

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = registerForm.querySelector('input[type="text"]');
            const emailInput = registerForm.querySelector('input[type="email"]');
            const passwordInput = registerForm.querySelectorAll('input[type="password"]')[0];
            const confirmInput = registerForm.querySelectorAll('input[type="password"]')[1];
            
            registerUser(nameInput.value, emailInput.value, passwordInput.value, confirmInput.value);
        });
    }

    /**
     * Update Header with User Info
     */
    function updateHeaderWithUserInfo() {
        const user = getCurrentUser();
        
        if (!user) return;

        // Try both nav classes (.action-nav and .main-nav)
        const nav = document.querySelector('.action-nav') || document.querySelector('.main-nav');
        if (!nav) return;

        // Find and update login link
        const loginLink = nav.querySelector('a[href="auth.html"]');
        if (loginLink) {
            loginLink.innerHTML = `
                <span class="user-info">
                    👤 ${user.name}
                    <small>(${user.points} poin)</small>
                </span>
            `;
            loginLink.href = '#';
            loginLink.onclick = (e) => {
                e.preventDefault();
                showUserProfile(user);
            };
        }
    }

    /**
     * Show User Profile Modal
     */
    function showUserProfile(user) {
        const modal = document.createElement('div');
        modal.className = 'user-profile-modal';
        modal.innerHTML = `
            <div class="user-profile-content">
                <button class="close-btn">&times;</button>
                <div class="profile-header">
                    <h2>👤 Profil Anda</h2>
                </div>
                <div class="profile-info">
                    <div class="info-row">
                        <span>Nama:</span>
                        <strong>${user.name}</strong>
                    </div>
                    <div class="info-row">
                        <span>Email:</span>
                        <strong>${user.email}</strong>
                    </div>
                    <div class="info-row">
                        <span>Total Poin:</span>
                        <strong style="color: var(--accent-green); font-size: 1.2rem;">${user.points} 🌟</strong>
                    </div>
                    <div class="info-row">
                        <span>Bergabung:</span>
                        <strong>${new Date(user.registeredTime || user.loginTime).toLocaleDateString('id-ID')}</strong>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn logout-btn">Logout</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Logout button
        modal.querySelector('.logout-btn').addEventListener('click', () => {
            modal.remove();
            logoutUser();
        });
    }

    /**
     * Show Auth Error
     */
    function showAuthError(message) {
        const alert = document.createElement('div');
        alert.className = 'auth-alert error';
        alert.innerHTML = `
            <span class="alert-icon">❌</span>
            <span class="alert-message">${message}</span>
        `;
        document.body.appendChild(alert);

        setTimeout(() => alert.remove(), 4000);
    }

    /**
     * Show Auth Success
     */
    function showAuthSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'auth-alert success';
        alert.innerHTML = `
            <span class="alert-icon">✅</span>
            <span class="alert-message">${message}</span>
        `;
        document.body.appendChild(alert);

        setTimeout(() => alert.remove(), 4000);
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }

})();
