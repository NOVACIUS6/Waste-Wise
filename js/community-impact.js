(function() {
    'use strict';

    /**
     * Display user's last contribution on homepage
     */
    window.initCommunityImpact = function() {
        displayUserContribution();
        loadCommunityStats();
    };

    function displayUserContribution() {
        const user = getCurrentUser();
        const contribution = getLastContribution();
        const contentDiv = document.getElementById('contributionContent');
        const loginPrompt = document.getElementById('loginPrompt');

        if (!user) {
            // Not logged in - show login prompt
            if (loginPrompt) loginPrompt.style.display = 'block';
            if (contentDiv) contentDiv.innerHTML = '<p class="no-data">Belum ada kontribusi. <a href="action.html">Mulai sekarang!</a></p>';
            return;
        }

        if (loginPrompt) loginPrompt.style.display = 'none';

        if (!contribution) {
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <p class="no-data">Belum ada kontribusi. <a href="action.html">Mulai sekarang!</a></p>
                `;
            }
            return;
        }

        // Display contribution data
        const wasteTypeEmoji = {
            'plastik': '🧴',
            'elektronik': '💻',
            'organik': '🥬'
        };

        const emoji = wasteTypeEmoji[contribution.type] || '🗑️';
        const timestamp = new Date(contribution.timestamp).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="contribution-info">
                    <div class="contribution-item">
                        <div class="label">Jenis Sampah</div>
                        <div class="value">${emoji} ${formatWasteType(contribution.type)}</div>
                    </div>
                    <div class="contribution-item">
                        <div class="label">Berat</div>
                        <div class="value">${contribution.weight} kg</div>
                    </div>
                    <div class="contribution-item">
                        <div class="label">Poin Diperoleh</div>
                        <div class="value">+${contribution.points}</div>
                    </div>
                    <div class="contribution-item">
                        <div class="label">CO₂ Terselamatkan</div>
                        <div class="value">${contribution.co2} kg</div>
                    </div>
                </div>
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #999; font-size: 0.85rem;">
                    📍 Lokasi: ${contribution.location}<br>
                    🕐 ${timestamp}
                </div>
            `;
        }
    }

    function loadCommunityStats() {
        // Get stats from localStorage (simulated community data)
        const stats = getCommunityStats();
        
        const totalContributionsEl = document.getElementById('totalContributions');
        const totalCO2SavedEl = document.getElementById('totalCO2Saved');

        if (totalContributionsEl) {
            totalContributionsEl.innerText = stats.totalContributions;
        }
        if (totalCO2SavedEl) {
            totalCO2SavedEl.innerText = stats.totalCO2Saved;
        }
    }

    /**
     * Get current logged-in user from localStorage
     */
    function getCurrentUser() {
        try {
            const userStr = localStorage.getItem('wastewise_user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }

    /**
     * Get last contribution from localStorage
     */
    function getLastContribution() {
        try {
            const contribStr = localStorage.getItem('wastewise_last_contribution');
            return contribStr ? JSON.parse(contribStr) : null;
        } catch (e) {
            console.error('Error parsing contribution data:', e);
            return null;
        }
    }

    /**
     * Get community stats (simulated)
     */
    function getCommunityStats() {
        // In a real app, this would be fetched from the server
        // For now, we'll generate realistic numbers based on a seed
        const baseContributions = 2847;
        const baseCO2 = 14235;

        // Add some variation to make it look dynamic
        const randomFactor = Math.sin(Date.now() / 100000) * 0.1 + 1;

        return {
            totalContributions: Math.floor(baseContributions * randomFactor),
            totalCO2Saved: Math.floor(baseCO2 * randomFactor)
        };
    }

    /**
     * Format waste type for display
     */
    function formatWasteType(type) {
        const labels = {
            'plastik': 'Plastik',
            'elektronik': 'Elektronik',
            'organik': 'Organik',
            'kertas': 'Kertas'
        };
        return labels[type] || type;
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initCommunityImpact);
    } else {
        window.initCommunityImpact();
    }
})();
