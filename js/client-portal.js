// EchoMind Dashboard with CORRECTED Slider Controls
// Two separate sliders: Brand Mention % + Product Mention %
// Backend API Configuration
const API_BASE_URL = 'https://echomind-backend-production.up.railway.app/api';

let currentClients = [];
let selectedClientId = null;

// ============================================================================
// VIEW MANAGEMENT
// ============================================================================

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show selected view
    document.getElementById(`${viewName}-view`).classList.remove('hidden');
    
    // Update navigation
    document.querySelectorAll('[id^="nav-"]').forEach(btn => {
        btn.classList.remove('text-blue-600', 'font-semibold');
        btn.classList.add('text-gray-700');
    });
    document.getElementById(`nav-${viewName}`).classList.add('text-blue-600', 'font-semibold');
    
    // Load data for specific views
    if (viewName === 'dashboard') {
        loadClients();
    } else if (viewName === 'strategy') {
        loadStrategyClients();
    }
}

// ============================================================================
// SLIDER CONTROLS
// ============================================================================

function updateReplyPostDisplay() {
    const replyPercentage = parseInt(document.getElementById('reply-percentage').value);
    const postPercentage = 100 - replyPercentage;
    
    document.getElementById('reply-value').textContent = `${replyPercentage}%`;
    document.getElementById('post-value').textContent = `${postPercentage}%`;
    
    // Update slider background gradient
    const slider = document.getElementById('reply-percentage');
    slider.style.background = `linear-gradient(to right, #667EEA 0%, #667EEA ${replyPercentage}%, #E5E7EB ${replyPercentage}%, #E5E7EB 100%)`;
}

function updateBrandMentionDisplay() {
    const percentage = parseInt(document.getElementById('brand-mention-percentage').value);
    document.getElementById('brand-mention-value').textContent = `${percentage}%`;
    
    // Update phase indicator
    const phaseIndicator = document.getElementById('current-phase');
    let phase = 1;
    let phaseText = 'Phase 1: Trust Building';
    let phaseClass = 'phase-1';
    
    if (percentage === 0) {
        phase = 1;
        phaseText = 'Phase 1: Trust Building';
        phaseClass = 'phase-1';
    } else if (percentage >= 1 && percentage <= 10) {
        phase = 2;
        phaseText = 'Phase 2: Soft Introduction';
        phaseClass = 'phase-2';
    } else if (percentage >= 11 && percentage <= 20) {
        phase = 3;
        phaseText = 'Phase 3: Product Integration';
        phaseClass = 'phase-3';
    } else {
        phase = 4;
        phaseText = 'Phase 4: Sustained Authority';
        phaseClass = 'phase-4';
    }
    
    phaseIndicator.textContent = phaseText;
    phaseIndicator.className = `phase-indicator ${phaseClass}`;
    
    // Update slider gradient
    const slider = document.getElementById('brand-mention-percentage');
    slider.style.background = `linear-gradient(to right, #10B981 0%, #10B981 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`;
}

function updateProductMentionDisplay() {
    const percentage = parseInt(document.getElementById('product-mention-percentage').value);
    document.getElementById('product-mention-value').textContent = `${percentage}%`;
    
    // Update slider gradient (purple theme)
    const slider = document.getElementById('product-mention-percentage');
    slider.style.background = `linear-gradient(to right, #9333EA 0%, #9333EA ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`;
}

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

async function loadClients() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const clients = await response.json();
        currentClients = clients;
        displayClients(clients);
    } catch (error) {
        console.error('Error loading clients:', error);
        displayError('Failed to load clients. Check backend connection.');
    }
}

function displayClients(clients) {
    const container = document.getElementById('clients-container');
    
    if (clients.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500 mb-4">No clients yet</p>
                <button onclick="switchView('onboarding')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Add First Client
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = clients.map(client => `
        <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">${client.company_name}</h3>
            <p class="text-gray-600 mb-4">${client.industry || 'No industry'}</p>
            <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Subreddits:</span>
                    <span class="font-medium">${client.target_subreddits?.length || 0}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Weekly Posts:</span>
                    <span class="font-medium">${client.posting_frequency || 10}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        ${client.subscription_status || 'active'}
                    </span>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <button onclick="viewClientDetails('${client.client_id}')" 
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                </button>
                <button onclick="editClientStrategy('${client.client_id}')" 
                        class="text-purple-600 hover:text-purple-800 text-sm font-medium">
                    Edit Strategy
                </button>
            </div>
        </div>
    `).join('');
}

function displayError(message) {
    const container = document.getElementById('clients-container');
    container.innerHTML = `
        <div class="col-span-full bg-red-50 border border-red-200 rounded-lg p-6">
            <p class="text-red-800">${message}</p>
        </div>
    `;
}

// ============================================================================
// STRATEGY MANAGEMENT
// ============================================================================

async function loadStrategyClients() {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        const clients = await response.json();
        
        const selector = document.getElementById('strategy-client-selector');
        selector.innerHTML = '<option value="">-- Select a client --</option>' +
            clients.map(c => `<option value="${c.client_id}">${c.company_name}</option>`).join('');
        
        selector.onchange = function() {
            if (this.value) {
                loadClientStrategy(this.value);
            } else {
                document.getElementById('strategy-controls').classList.add('hidden');
            }
        };
    } catch (error) {
        console.error('Error loading clients for strategy:', error);
    }
}

async function loadClientStrategy(clientId) {
    selectedClientId = clientId;
    
    try {
        // Load strategy settings
        const response = await fetch(`${API_BASE_URL}/client-settings/${clientId}`);
        
        if (response.ok) {
            const settings = await response.json();
            
            // Populate sliders with existing values
            document.getElementById('reply-percentage').value = settings.reply_percentage || 75;
            document.getElementById('brand-mention-percentage').value = settings.brand_mention_percentage || 0;
            document.getElementById('product-mention-percentage').value = settings.product_mention_percentage || 0;
            document.getElementById('explicit-instructions').value = settings.explicit_instructions || '';
            
            updateReplyPostDisplay();
            updateBrandMentionDisplay();
            updateProductMentionDisplay();
        } else {
            // No settings yet, use defaults
            document.getElementById('reply-percentage').value = 75;
            document.getElementById('brand-mention-percentage').value = 0;
            document.getElementById('product-mention-percentage').value = 0;
            document.getElementById('explicit-instructions').value = '';
            
            updateReplyPostDisplay();
            updateBrandMentionDisplay();
            updateProductMentionDisplay();
        }
        
        // Load knowledge base stats
        await loadKnowledgeBaseStats(clientId);
        
        document.getElementById('strategy-controls').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading client strategy:', error);
        // Still show controls with defaults
        document.getElementById('strategy-controls').classList.remove('hidden');
    }
}

async function loadKnowledgeBaseStats(clientId) {
    try {
        // Try to load document stats from backend
        const response = await fetch(`${API_BASE_URL}/clients/${clientId}/knowledge-base-stats`);
        
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('doc-count').textContent = stats.document_count || 0;
            document.getElementById('doc-size').textContent = (stats.total_size_gb || 0).toFixed(1);
            document.getElementById('chunk-count').textContent = stats.chunk_count || 0;
            document.getElementById('last-updated').textContent = stats.last_updated || 'Never';
        } else {
            // Default values if endpoint not available
            document.getElementById('doc-count').textContent = '0';
            document.getElementById('doc-size').textContent = '0.0';
            document.getElementById('chunk-count').textContent = '0';
            document.getElementById('last-updated').textContent = 'Not yet uploaded';
        }
    } catch (error) {
        console.error('Error loading knowledge base stats:', error);
        document.getElementById('doc-count').textContent = 'Unknown';
        document.getElementById('doc-size').textContent = '--';
        document.getElementById('chunk-count').textContent = '--';
        document.getElementById('last-updated').textContent = '--';
    }
}

function editClientStrategy(clientId) {
    switchView('strategy');
    // Wait for view to load, then select client
    setTimeout(() => {
        const selector = document.getElementById('strategy-client-selector');
        selector.value = clientId;
        loadClientStrategy(clientId);
    }, 100);
}

async function saveMonthlyStrategy() {
    if (!selectedClientId) {
        alert('Please select a client first');
        return;
    }
    
    const replyPercentage = parseInt(document.getElementById('reply-percentage').value);
    const brandMentionPercentage = parseInt(document.getElementById('brand-mention-percentage').value);
    const productMentionPercentage = parseInt(document.getElementById('product-mention-percentage').value);
    const explicitInstructions = document.getElementById('explicit-instructions').value;
    
    // Determine current phase based on brand mention percentage
    let currentPhase = 1;
    if (brandMentionPercentage >= 1 && brandMentionPercentage <= 10) currentPhase = 2;
    else if (brandMentionPercentage >= 11 && brandMentionPercentage <= 20) currentPhase = 3;
    else if (brandMentionPercentage > 20) currentPhase = 4;
    
    const strategyData = {
        client_id: selectedClientId,
        reply_percentage: replyPercentage,
        post_percentage: 100 - replyPercentage,
        brand_mention_percentage: brandMentionPercentage,
        product_mention_percentage: productMentionPercentage,
        product_relevance_threshold: 0.75, // Default threshold
        current_phase: currentPhase,
        explicit_instructions: explicitInstructions,
        updated_at: new Date().toISOString()
    };
    
    try {
        // Save strategy settings
        const response = await fetch(`${API_BASE_URL}/client-settings/${selectedClientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(strategyData)
        });
        
        if (response.ok) {
            alert('✅ Monthly strategy saved successfully!\n\n' +
                  `Reply/Post: ${replyPercentage}/${100-replyPercentage}\n` +
                  `Brand mentions: ${brandMentionPercentage}%\n` +
                  `Product mentions: ${productMentionPercentage}% (relevance-gated)\n` +
                  `Phase: ${currentPhase}`);
            switchView('dashboard');
        } else {
            throw new Error('Failed to save strategy');
        }
    } catch (error) {
        console.error('Error saving strategy:', error);
        alert('❌ Failed to save strategy. Please try again.');
    }
}

function cancelStrategyUpdate() {
    if (confirm('Cancel without saving changes?')) {
        switchView('dashboard');
    }
}

function viewDocumentLibrary() {
    // TODO: Implement document library modal/view
    alert('Document library view coming soon!\n\nThis will show all uploaded documents from Step 5 of onboarding.');
}

function uploadMoreDocuments() {
    // TODO: Implement additional document upload
    alert('Additional document upload coming soon!\n\nYou can add more documents to enhance the knowledge base.');
}

// ============================================================================
// CLIENT ONBOARDING
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('onboarding-form');
    if (form) {
        form.addEventListener('submit', handleOnboarding);
    }
    
    // Initialize dashboard
    switchView('dashboard');
    
    // Initialize sliders
    updateReplyPostDisplay();
    updateBrandMentionDisplay();
    updateProductMentionDisplay();
});

async function handleOnboarding(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const clientData = {
        company_name: formData.get('company_name'),
        industry: formData.get('industry'),
        website_url: formData.get('website_url'),
        target_subreddits: formData.get('target_subreddits').split(',').map(s => s.trim()),
        target_keywords: formData.get('target_keywords').split(',').map(s => s.trim()),
        contact_email: formData.get('contact_email'),
        subscription_status: 'active',
        onboarding_status: 'pending_data'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/clients/onboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Show success message
            document.getElementById('onboarding-form').classList.add('hidden');
            document.getElementById('onboarding-success').classList.remove('hidden');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                switchView('dashboard');
                document.getElementById('onboarding-form').classList.remove('hidden');
                document.getElementById('onboarding-success').classList.add('hidden');
                document.getElementById('onboarding-form').reset();
            }, 2000);
        } else {
            throw new Error('Failed to create client');
        }
    } catch (error) {
        console.error('Onboarding error:', error);
        alert('Failed to create client. Please try again.');
    }
}

function viewClientDetails(clientId) {
    // TODO: Implement client details modal
    alert(`Client details view coming soon for client: ${clientId}`);
}
