// Dashboard functionality
class BotDashboard {
    constructor() {
        this.statusInterval = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.startStatusUpdates();
        this.loadRecentAds();
        this.setupChart();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('[data-section]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                this.showSection(sectionId);
                
                // Update active nav
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.add('d-none');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('d-none');
        }

        // Load section-specific data
        if (sectionId === 'recent-ads') {
            this.loadRecentAds();
        } else if (sectionId === 'statistics') {
            this.updateChart();
        }
    }

    async fetchBotStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching bot status:', error);
            return null;
        }
    }

    async updateStatus() {
        const status = await this.fetchBotStatus();
        if (!status) return;

        // Update bot status
        const botStatusEl = document.getElementById('bot-status');
        if (status.botOnline) {
            botStatusEl.innerHTML = '<i class="fas fa-circle text-success"></i> Online';
        } else {
            botStatusEl.innerHTML = '<i class="fas fa-circle text-danger"></i> Offline';
        }

        // Update guild count
        document.getElementById('guild-count').textContent = status.guilds || 0;

        // Update bot tag
        document.getElementById('bot-tag').textContent = status.botTag || 'Not connected';

        // Update uptime
        if (status.uptime) {
            const hours = Math.floor(status.uptime / (1000 * 60 * 60));
            const minutes = Math.floor((status.uptime % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('uptime').textContent = `${hours}h ${minutes}m`;
        } else {
            document.getElementById('uptime').textContent = '0h 0m';
        }

        // Update voice status
        const voiceStatusEl = document.getElementById('voice-status');
        if (status.voiceConnected) {
            voiceStatusEl.innerHTML = '<i class="fas fa-circle text-success"></i> Connected';
        } else {
            voiceStatusEl.innerHTML = '<i class="fas fa-circle text-danger"></i> Disconnected';
        }

        // Update last update time
        document.getElementById('last-update').textContent = new Date().toLocaleString();

        // Update quick stats
        this.updateQuickStats();
    }

    async updateQuickStats() {
        try {
            const response = await fetch('/api/recent-ads');
            const ads = await response.json();
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const adsToday = ads.filter(ad => new Date(ad.timestamp) >= today).length;
            const adsThisWeek = ads.filter(ad => new Date(ad.timestamp) >= weekAgo).length;
            
            document.getElementById('total-ads-today').textContent = adsToday;
            document.getElementById('total-ads-week').textContent = adsThisWeek;
            
        } catch (error) {
            console.error('Error updating quick stats:', error);
        }
    }

    async loadRecentAds() {
        try {
            const response = await fetch('/api/recent-ads');
            const ads = await response.json();
            
            const tableBody = document.querySelector('#recent-ads-table tbody');
            tableBody.innerHTML = '';

            if (ads.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No recent advertisements</td></tr>';
                return;
            }

            ads.reverse().forEach(ad => {
                const row = document.createElement('tr');
                const timestamp = new Date(ad.timestamp).toLocaleString();
                
                row.innerHTML = `
                    <td>
                        <strong>${this.escapeHtml(ad.user)}</strong><br>
                        <small class="text-muted">${ad.userId}</small>
                    </td>
                    <td>${this.escapeHtml(ad.server)}</td>
                    <td>${timestamp}</td>
                    <td>
                        <code>${ad.inviteCode}</code>
                        <a href="https://discord.gg/${ad.inviteCode}" target="_blank" class="btn btn-sm btn-outline-primary ms-2">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error loading recent ads:', error);
            const tableBody = document.querySelector('#recent-ads-table tbody');
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading data</td></tr>';
        }
    }

    setupChart() {
        const ctx = document.getElementById('adsChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Advertisements per Day',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    }

    async updateChart() {
        try {
            const response = await fetch('/api/recent-ads');
            const ads = await response.json();
            
            // Group ads by date
            const adsByDate = {};
            const last7Days = [];
            
            // Generate last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                last7Days.push(dateStr);
                adsByDate[dateStr] = 0;
            }
            
            // Count ads by date
            ads.forEach(ad => {
                const date = new Date(ad.timestamp).toISOString().split('T')[0];
                if (adsByDate.hasOwnProperty(date)) {
                    adsByDate[date]++;
                }
            });
            
            // Update chart
            this.chart.data.labels = last7Days.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
            this.chart.data.datasets[0].data = last7Days.map(date => adsByDate[date]);
            this.chart.update();
            
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }

    startStatusUpdates() {
        this.updateStatus();
        this.statusInterval = setInterval(() => {
            this.updateStatus();
        }, 5000); // Update every 5 seconds
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global refresh function
function refreshData() {
    if (window.dashboard) {
        window.dashboard.updateStatus();
        window.dashboard.loadRecentAds();
        window.dashboard.updateChart();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new BotDashboard();
});