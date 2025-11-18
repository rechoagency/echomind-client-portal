// API Configuration
const API_URL = 'https://echomind-backend-production.up.railway.app';

// Get client_id from URL or default to The Waite
const urlParams = new URLSearchParams(window.location.search);
const CLIENT_ID = urlParams.get('client_id') || '466046c9-9e68-4957-8445-9a4fcf92def6';

// Global client data
let clientData = null;

// Load client data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadClientData();
    loadClientSettings();
});

// Load client information
async function loadClientData() {
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}`);
        if (!response.ok) throw new Error('Failed to load client data');
        
        clientData = await response.json();
        
        // Update header
        document.getElementById('companyName').textContent = clientData.company_name || 'Unknown Company';
        
        // Update overview tab
        document.getElementById('industry').textContent = clientData.industry || '-';
        document.getElementById('website').textContent = clientData.website_url || '-';
        document.getElementById('contactEmail').textContent = clientData.contact_email || '-';
        document.getElementById('postingFrequency').textContent = clientData.posting_frequency || '-';
        
        // Show content, hide loading
        document.getElementById('overviewLoading').style.display = 'none';
        document.getElementById('overviewContent').style.display = 'block';
        
        // Load keywords and subreddits
        loadKeywords();
        loadSubreddits();
        
    } catch (error) {
        console.error('Error loading client data:', error);
        document.getElementById('overviewLoading').innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
            <p>Failed to load client data. Please refresh the page.</p>
        `;
    }
}

// Load client settings (sliders)
async function loadClientSettings() {
    try {
        const response = await fetch(`${API_URL}/api/client-settings/${CLIENT_ID}`);
        
        if (response.ok) {
            const settings = await response.json();
            
            // Update sliders
            document.getElementById('replyPostSlider').value = settings.reply_percentage || 70;
            document.getElementById('brandMentionSlider').value = settings.brand_mention_percentage || 30;
            document.getElementById('productMentionSlider').value = settings.product_mention_percentage || 20;
            
            // Update displays
            updateSliderValue('replyPostValue', settings.reply_percentage || 70, 'replyPost');
            updateSliderValue('brandMentionValue', settings.brand_mention_percentage || 30);
            updateSliderValue('productMentionValue', settings.product_mention_percentage || 20);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Update slider display values
function updateSliderValue(elementId, value, type) {
    if (type === 'replyPost') {
        // Update reply/post split
        document.getElementById('replyValue').textContent = value + '%';
        document.getElementById('postValue').textContent = (100 - value) + '%';
    } else {
        // Update single value
        document.getElementById(elementId).textContent = value + '%';
    }
}

// Save strategy settings
async function saveStrategy() {
    const replyPercentage = parseInt(document.getElementById('replyPostSlider').value);
    const brandPercentage = parseInt(document.getElementById('brandMentionSlider').value);
    const productPercentage = parseInt(document.getElementById('productMentionSlider').value);
    
    const settings = {
        client_id: CLIENT_ID,
        reply_percentage: replyPercentage,
        post_percentage: 100 - replyPercentage,
        brand_mention_percentage: brandPercentage,
        product_mention_percentage: productPercentage
    };
    
    try {
        const response = await fetch(`${API_URL}/api/client-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            alert('✅ Strategy settings saved successfully!');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('❌ Failed to save settings. Please try again.');
    }
}

// Load keywords
function loadKeywords() {
    if (!clientData || !clientData.target_keywords) {
        document.getElementById('keywordsList').innerHTML = '<p>No keywords configured</p>';
        return;
    }
    
    const keywords = Array.isArray(clientData.target_keywords) 
        ? clientData.target_keywords 
        : clientData.target_keywords.split(',');
    
    const html = keywords.map(keyword => 
        `<span class="badge-custom badge-primary">${keyword.trim()}</span>`
    ).join('');
    
    document.getElementById('keywordsList').innerHTML = html || '<p>No keywords configured</p>';
}

// Load subreddits
function loadSubreddits() {
    if (!clientData || !clientData.target_subreddits) {
        document.getElementById('subredditsList').innerHTML = '<p>No subreddits configured</p>';
        return;
    }
    
    const subreddits = Array.isArray(clientData.target_subreddits) 
        ? clientData.target_subreddits 
        : clientData.target_subreddits.split(',');
    
    const html = subreddits.map(subreddit => 
        `<span class="badge-custom badge-primary">r/${subreddit.trim().replace('r/', '')}</span>`
    ).join('');
    
    document.getElementById('subredditsList').innerHTML = html || '<p>No subreddits configured</p>';
}
