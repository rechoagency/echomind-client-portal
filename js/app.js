// EchoMind Client Dashboard - Application Logic

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// State Management
let currentView = 'dashboard';
let clients = [];
let backendConnected = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    checkBackendConnection();
    setupClientForm();
    loadClients();
}

// Navigation
function setupNavigation() {
    const navButtons = {
        'nav-dashboard': 'dashboard',
        'nav-add-client': 'add-client',
        'nav-troubleshoot': 'troubleshoot'
    };

    Object.entries(navButtons).forEach(([btnId, viewName]) => {
        document.getElementById(btnId).addEventListener('click', () => {
            switchView(viewName);
        });
    });

    // Cancel button in form
    document.getElementById('cancel-btn').addEventListener('click', () => {
        switchView('dashboard');
        document.getElementById('client-form').reset();
    });
}

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Remove active state from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected view
    document.getElementById(`${viewName}-view`).classList.add('active');
    document.getElementById(`nav-${viewName}`).classList.add('active');

    currentView = viewName;

    // Reload data if switching to dashboard
    if (viewName === 'dashboard') {
        loadClients();
    }
}

// Backend Connection Check
async function checkBackendConnection() {
    const statusEl = document.getElementById('backend-status');
    const iconEl = document.getElementById('status-icon');

    statusEl.textContent = 'Checking...';
    statusEl.className = 'text-2xl font-bold text-gray-900 status-checking';
    iconEl.textContent = '⚙️';

    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            backendConnected = true;
            statusEl.textContent = 'Connected';
            statusEl.className = 'text-2xl font-bold status-connected';
            iconEl.textContent = '✅';
        } else {
            throw new Error('Backend responded with error');
        }
    } catch (error) {
        backendConnected = false;
        statusEl.textContent = 'Disconnected';
        statusEl.className = 'text-2xl font-bold status-disconnected';
        iconEl.textContent = '❌';
        console.error('Backend connection failed:', error);
        
        showAlert('Backend is not connected. UI will work in demo mode. Check js/app.js for API configuration.', 'info');
    }
}

// Client Form Handling
function setupClientForm() {
    const form = document.getElementById('client-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!backendConnected) {
            showAlert('Backend not connected. Cannot save client data. This is demo mode.', 'error');
            return;
        }

        const formData = new FormData(form);
        const clientData = {
            client_name: formData.get('client_name'),
            industry: formData.get('industry'),
            product_name: formData.get('product_name'),
            product_description: formData.get('product_description'),
            target_subreddits: formData.get('target_subreddits').split(',').map(s => s.trim()),
            target_keywords: formData.get('target_keywords').split(',').map(k => k.trim()),
            excluded_topics: formData.get('excluded_topics').split(',').map(t => t.trim()).filter(t => t),
            contact_email: formData.get('contact_email'),
            slack_webhook: formData.get('slack_webhook') || null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/client-onboarding/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });

            if (response.ok) {
                const result = await response.json();
                showAlert(`Client "${clientData.client_name}" onboarded successfully! Voice analysis started.`, 'success');
                form.reset();
                switchView('dashboard');
                loadClients();
            } else {
                const error = await response.json();
                showAlert(`Error: ${error.detail || 'Failed to onboard client'}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('Network error. Check backend connection.', 'error');
        }
    });
}

// Load Clients List
async function loadClients() {
    const listEl = document.getElementById('clients-list');
    const activeClientsEl = document.getElementById('active-clients');
    const activeCampaignsEl = document.getElementById('active-campaigns');

    if (!backendConnected) {
        listEl.innerHTML = '<p class="text-gray-500 text-center py-8">Backend not connected. Cannot load clients.</p>';
        return;
    }

    listEl.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/client-onboarding/clients`);
        
        if (response.ok) {
            clients = await response.json();
            
            if (clients.length === 0) {
                listEl.innerHTML = '<p class="text-gray-500 text-center py-8">No clients onboarded yet. Click "Add New Client" to get started!</p>';
                activeClientsEl.textContent = '0';
                activeCampaignsEl.textContent = '0';
            } else {
                renderClientsList(clients);
                activeClientsEl.textContent = clients.length;
                // Count total campaigns (Reddit Answers + Reddit Pro)
                const totalCampaigns = clients.reduce((sum, client) => {
                    return sum + (client.active_campaigns || 0);
                }, 0);
                activeCampaignsEl.textContent = totalCampaigns;
            }
        } else {
            throw new Error('Failed to fetch clients');
        }
    } catch (error) {
        console.error('Error loading clients:', error);
        listEl.innerHTML = '<p class="text-red-500 text-center py-8">Error loading clients. Check backend connection.</p>';
    }
}

function renderClientsList(clientsData) {
    const listEl = document.getElementById('clients-list');
    
    const html = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${clientsData.map(client => `
                <div class="client-card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-lg font-semibold text-gray-900">${client.client_name}</h4>
                        <span class="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2"><strong>Industry:</strong> ${client.industry}</p>
                    <p class="text-sm text-gray-600 mb-2"><strong>Product:</strong> ${client.product_name}</p>
                    <p class="text-sm text-gray-600 mb-4"><strong>Subreddits:</strong> ${client.target_subreddits ? client.target_subreddits.length : 0}</p>
                    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span class="text-xs text-gray-500">Created: ${new Date(client.created_at).toLocaleDateString()}</span>
                        <button onclick="viewClientDetail('${client.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details →
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    listEl.innerHTML = html;
}

// View Client Detail (placeholder)
function viewClientDetail(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        alert(`Client Detail View\n\nClient: ${client.client_name}\nIndustry: ${client.industry}\nProduct: ${client.product_name}\n\n(Full detail view coming soon)`);
    }
}

// Alert System
function showAlert(message, type = 'info') {
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.textContent = message;
    
    const mainEl = document.querySelector('main');
    mainEl.insertBefore(alertEl, mainEl.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertEl.remove();
    }, 5000);
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Export for use in HTML onclick handlers
window.viewClientDetail = viewClientDetail;
