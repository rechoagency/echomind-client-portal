// EchoMind Client Dashboard - Complete Application Logic

// API Configuration
const API_BASE_URL = 'https://echomind-backend-production.up.railway.app/api';

// State Management
let currentView = 'dashboard';
let clients = [];
let backendConnected = false;
let uploadedFile = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    checkBackendConnection();
    setupClientForm();
    setupFileUpload();
    setupPostReplyRatioSlider();
    setupAutoIdentifyToggles();
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

    document.getElementById('cancel-btn').addEventListener('click', () => {
        switchView('dashboard');
        document.getElementById('client-form').reset();
        uploadedFile = null;
        updateFileDisplay(null);
    });
}

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${viewName}-view`).classList.add('active');
    document.getElementById(`nav-${viewName}`).classList.add('active');

    currentView = viewName;

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
        
        showAlert('⚠️ Backend not connected. Check troubleshooting tab for help.', 'warning');
    }
}

// Post/Reply Ratio Slider
function setupPostReplyRatioSlider() {
    const slider = document.getElementById('post-reply-ratio');
    const postPercentage = document.getElementById('post-percentage');
    const replyPercentage = document.getElementById('reply-percentage');

    slider.addEventListener('input', (e) => {
        const postValue = e.target.value;
        const replyValue = 100 - postValue;
        postPercentage.textContent = `${postValue}%`;
        replyPercentage.textContent = `${replyValue}%`;
    });
}

// Auto-Identify Toggles
function setupAutoIdentifyToggles() {
    const autoSubreddits = document.getElementById('auto-subreddits');
    const autoKeywords = document.getElementById('auto-keywords');
    const subredditsInput = document.getElementById('target_subreddits');
    const keywordsInput = document.getElementById('target_keywords');

    autoSubreddits.addEventListener('change', (e) => {
        if (e.target.checked) {
            subredditsInput.disabled = true;
            subredditsInput.placeholder = '🤖 System will auto-identify best subreddits...';
            subredditsInput.value = '';
        } else {
            subredditsInput.disabled = false;
            subredditsInput.placeholder = 'r/BabyBumps, r/Mommit, r/pregnant';
        }
    });

    autoKeywords.addEventListener('change', (e) => {
        if (e.target.checked) {
            keywordsInput.disabled = true;
            keywordsInput.placeholder = '🤖 System will auto-extract keywords...';
            keywordsInput.value = '';
        } else {
            keywordsInput.disabled = false;
            keywordsInput.placeholder = 'maternity leggings, pregnancy clothes, baby essentials';
        }
    });
}

// File Upload Handler
function setupFileUpload() {
    const fileInput = document.getElementById('bulk-data-file');
    const uploadArea = document.getElementById('file-upload-area');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File selected
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadedFile = file;
            updateFileDisplay(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            uploadedFile = file;
            fileInput.files = e.dataTransfer.files;
            updateFileDisplay(file);
        }
    });
}

function updateFileDisplay(file) {
    const display = document.getElementById('file-name-display');
    if (file) {
        const sizeKB = (file.size / 1024).toFixed(2);
        display.textContent = `✅ ${file.name} (${sizeKB} KB)`;
        display.classList.remove('hidden');
    } else {
        display.textContent = '';
        display.classList.add('hidden');
    }
}

// Client Form Handling
function setupClientForm() {
    const form = document.getElementById('client-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!backendConnected) {
            showAlert('❌ Backend not connected. Cannot onboard client.', 'error');
            return;
        }

        const formData = new FormData(form);
        
        // Parse form data into client object
        const clientData = {
            client_name: formData.get('client_name'),
            industry: formData.get('industry'),
            website_url: formData.get('website_url') || null,
            existing_reddit_username: formData.get('existing_reddit_username') || null,
            existing_subreddit: formData.get('existing_subreddit') || null,
            product_name: null,  // Will be auto-scraped from website
            product_description: null,
            auto_identify_subreddits: formData.get('auto_identify_subreddits') === 'on',
            auto_identify_keywords: formData.get('auto_identify_keywords') === 'on',
            post_reply_ratio: parseInt(formData.get('post_reply_ratio')),
            posting_frequency: parseInt(formData.get('posting_frequency')),
            content_tone: formData.get('content_tone'),
            special_instructions: formData.get('special_instructions') || null,
            contact_email: formData.get('contact_email'),
            contact_name: formData.get('contact_name') || null,
            slack_webhook: formData.get('slack_webhook') || null,
            bulk_data_uploaded: uploadedFile !== null
        };

        // Handle target subreddits
        const subredditsInput = formData.get('target_subreddits');
        if (subredditsInput && subredditsInput.trim()) {
            clientData.target_subreddits = subredditsInput.split(',').map(s => s.trim()).filter(s => s);
        } else {
            clientData.target_subreddits = [];
        }

        // Handle target keywords
        const keywordsInput = formData.get('target_keywords');
        if (keywordsInput && keywordsInput.trim()) {
            clientData.target_keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);
        } else {
            clientData.target_keywords = [];
        }

        // Handle excluded topics
        const excludedInput = formData.get('excluded_topics');
        if (excludedInput && excludedInput.trim()) {
            clientData.excluded_topics = excludedInput.split(',').map(t => t.trim()).filter(t => t);
        } else {
            clientData.excluded_topics = [];
        }

        console.log('📤 Sending client data:', clientData);

        try {
            // Create client
            const response = await fetch(`${API_BASE_URL}/client-onboarding/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ Client created:', result);
                
                // Upload bulk data if file was selected
                if (uploadedFile && result.client_id) {
                    await uploadBulkData(result.client_id, uploadedFile);
                }

                // Show success message with next steps
                let successMessage = `🎉 ${result.message}\n\n`;
                if (result.next_steps && result.next_steps.length > 0) {
                    successMessage += 'Next steps:\n' + result.next_steps.join('\n');
                }

                showAlert(successMessage, 'success');
                
                form.reset();
                uploadedFile = null;
                updateFileDisplay(null);
                switchView('dashboard');
                loadClients();
            } else {
                console.error('❌ Server error:', result);
                const errorMessage = result.detail || result.message || 'Failed to onboard client';
                showAlert(`❌ Error: ${errorMessage}`, 'error');
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            showAlert(`❌ Network error: ${error.message}. Check backend connection.`, 'error');
        }
    });
}

async function uploadBulkData(clientId, file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('data_type', 'internal_docs');  // Default type

        const response = await fetch(`${API_BASE_URL}/client-onboarding/clients/${clientId}/bulk-data`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            console.log('📄 Bulk data uploaded:', result);
            showAlert(`📄 File "${file.name}" uploaded successfully. Vectorization in progress.`, 'info');
        } else {
            console.error('Failed to upload bulk data');
        }
    } catch (error) {
        console.error('Error uploading bulk data:', error);
    }
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
                    ${client.website_url ? `<p class="text-sm text-gray-600 mb-2"><strong>Website:</strong> <a href="${client.website_url}" target="_blank" class="text-blue-600 hover:underline">${client.website_url}</a></p>` : ''}
                    <p class="text-sm text-gray-600 mb-2"><strong>Subreddits:</strong> ${client.target_subreddits ? client.target_subreddits.length : 0}</p>
                    <p class="text-sm text-gray-600 mb-4"><strong>Keywords:</strong> ${client.target_keywords ? client.target_keywords.length : 0}</p>
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

// View Client Detail
function viewClientDetail(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        let details = `Client: ${client.client_name}\n`;
        details += `Industry: ${client.industry}\n`;
        details += `Contact: ${client.contact_email}\n`;
        if (client.website_url) details += `Website: ${client.website_url}\n`;
        if (client.target_subreddits && client.target_subreddits.length > 0) {
            details += `\nTarget Subreddits:\n${client.target_subreddits.join(', ')}\n`;
        }
        if (client.target_keywords && client.target_keywords.length > 0) {
            details += `\nTarget Keywords:\n${client.target_keywords.join(', ')}\n`;
        }
        if (client.special_instructions) {
            details += `\nSpecial Instructions:\n${client.special_instructions}\n`;
        }
        details += `\n(Full detail view coming soon)`;
        alert(details);
    }
}

// Alert System
function showAlert(message, type = 'info') {
    const alertEl = document.createElement('div');
    
    const typeClasses = {
        'success': 'bg-green-50 border-green-200 text-green-800',
        'error': 'bg-red-50 border-red-200 text-red-800',
        'warning': 'bg-yellow-50 border-yellow-200 text-yellow-800',
        'info': 'bg-blue-50 border-blue-200 text-blue-800'
    };
    
    alertEl.className = `alert border-2 rounded-lg p-4 mb-4 ${typeClasses[type] || typeClasses.info}`;
    alertEl.style.whiteSpace = 'pre-line';  // Preserve line breaks
    alertEl.textContent = message;
    
    const mainEl = document.querySelector('main');
    mainEl.insertBefore(alertEl, mainEl.firstChild);
    
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        alertEl.remove();
    }, 8000);
}

// Export for HTML onclick handlers
window.viewClientDetail = viewClientDetail;
