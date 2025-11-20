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
        populateOverviewSettings();
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
            document.getElementById('replyPostSlider').value = settings.reply_percentage || 75;
            document.getElementById('brandMentionSlider').value = settings.brand_mention_percentage || 0;
            document.getElementById('productMentionSlider').value = settings.product_mention_percentage || 0;
            
            // Update displays
            updateSliderValue('replyPostValue', settings.reply_percentage || 75, 'replyPost');
            updateSliderValue('brandMentionValue', settings.brand_mention_percentage || 0);
            updateSliderValue('productMentionValue', settings.product_mention_percentage || 0);
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

// Save strategy settings - UPDATED to use /strategy endpoint
async function saveStrategy() {
    const replyPercentage = parseFloat(document.getElementById('replyPostSlider').value);
    const brandPercentage = parseFloat(document.getElementById('brandMentionSlider').value);
    const productPercentage = parseFloat(document.getElementById('productMentionSlider').value);
    
    const settings = {
        reply_percentage: replyPercentage,
        brand_mention_percentage: brandPercentage,
        product_mention_percentage: productPercentage
    };
    
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}/strategy`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            alert('✅ Strategy settings saved successfully!');
            // Refresh Overview tab to show updated settings
            await refreshOverviewSettings();
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('❌ Failed to save settings. ' + error.message);
    }
}

// NEW: Refresh Overview settings after strategy change
async function refreshOverviewSettings() {
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}`);
        if (!response.ok) return;
        
        clientData = await response.json();
        populateOverviewSettings();
        
        console.log('✅ Overview settings refreshed after strategy change');
    } catch (error) {
        console.error('Error refreshing overview:', error);
    }
}

// Load keywords with edit capability
function loadKeywords() {
    if (!clientData || !clientData.target_keywords) {
        document.getElementById('keywordsList').innerHTML = `
            <p>No keywords configured</p>
            <button class="btn btn-sm btn-primary mt-2" onclick="addKeyword()">
                <i class="fas fa-plus"></i> Add Keyword
            </button>
        `;
        return;
    }
    
    const keywords = Array.isArray(clientData.target_keywords) 
        ? clientData.target_keywords 
        : clientData.target_keywords.split(',');
    
    const html = keywords.map((keyword, index) => 
        `<span class="badge-custom badge-primary">
            ${keyword.trim()}
            <button class="btn-remove-badge" onclick="removeKeyword(${index})">&times;</button>
        </span>`
    ).join('');
    
    document.getElementById('keywordsList').innerHTML = html + `
        <button class="btn btn-sm btn-primary mt-2" onclick="addKeyword()">
            <i class="fas fa-plus"></i> Add Keyword
        </button>
    `;
}

// Load subreddits with edit capability and ownership indicators
function loadSubreddits() {
    if (!clientData || !clientData.target_subreddits) {
        document.getElementById('subredditsList').innerHTML = `
            <p>No subreddits configured</p>
            <button class="btn btn-sm btn-primary mt-2" onclick="addSubreddit()">
                <i class="fas fa-plus"></i> Add Subreddit
            </button>
        `;
        return;
    }
    
    const subreddits = Array.isArray(clientData.target_subreddits) 
        ? clientData.target_subreddits 
        : clientData.target_subreddits.split(',');
    
    const ownedSubreddits = clientData.owned_subreddits || [];
    
    const html = subreddits.map((subreddit, index) => {
        const subName = subreddit.trim().replace('r/', '');
        const isOwned = ownedSubreddits.includes(subName) || ownedSubreddits.includes('r/' + subName);
        const ownershipIcon = isOwned 
            ? '<i class="fas fa-crown" title="Owned by brand" style="color: #FFD700; margin-right: 6px;"></i>'
            : '<i class="fas fa-users" title="Community subreddit" style="color: #666; margin-right: 6px;"></i>';
        
        return `<span class="badge-custom badge-primary">
            ${ownershipIcon}r/${subName}
            <button class="btn-remove-badge" onclick="removeSubreddit(${index})">&times;</button>
        </span>`;
    }).join('');
    
    document.getElementById('subredditsList').innerHTML = html + `
        <button class="btn btn-sm btn-primary mt-2" onclick="addSubreddit()">
            <i class="fas fa-plus"></i> Add Subreddit
        </button>
    `;
}

// Add keyword
async function addKeyword() {
    const keyword = prompt('Enter a new keyword:');
    if (!keyword || !keyword.trim()) return;
    
    try {
        const keywords = Array.isArray(clientData.target_keywords) 
            ? clientData.target_keywords 
            : clientData.target_keywords.split(',');
        
        keywords.push(keyword.trim());
        
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_keywords: keywords })
        });
        
        if (response.ok) {
            clientData.target_keywords = keywords;
            loadKeywords();
        populateOverviewSettings();
            alert('✅ Keyword added successfully!');
        } else {
            throw new Error('Failed to add keyword');
        }
    } catch (error) {
        console.error('Error adding keyword:', error);
        alert('❌ Failed to add keyword. Please try again.');
    }
}

// Remove keyword
async function removeKeyword(index) {
    if (!confirm('Remove this keyword?')) return;
    
    try {
        const keywords = Array.isArray(clientData.target_keywords) 
            ? clientData.target_keywords 
            : clientData.target_keywords.split(',');
        
        keywords.splice(index, 1);
        
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_keywords: keywords })
        });
        
        if (response.ok) {
            clientData.target_keywords = keywords;
            loadKeywords();
        populateOverviewSettings();
            alert('✅ Keyword removed successfully!');
        } else {
            throw new Error('Failed to remove keyword');
        }
    } catch (error) {
        console.error('Error removing keyword:', error);
        alert('❌ Failed to remove keyword. Please try again.');
    }
}

// Add subreddit
async function addSubreddit() {
    const subreddit = prompt('Enter a new subreddit (without r/):');
    if (!subreddit || !subreddit.trim()) return;
    
    try {
        const subreddits = Array.isArray(clientData.target_subreddits) 
            ? clientData.target_subreddits 
            : clientData.target_subreddits.split(',');
        
        subreddits.push(subreddit.trim().replace('r/', ''));
        
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_subreddits: subreddits })
        });
        
        if (response.ok) {
            clientData.target_subreddits = subreddits;
            loadSubreddits();
            alert('✅ Subreddit added successfully!');
        } else {
            throw new Error('Failed to add subreddit');
        }
    } catch (error) {
        console.error('Error adding subreddit:', error);
        alert('❌ Failed to add subreddit. Please try again.');
    }
}

// Remove subreddit
async function removeSubreddit(index) {
    if (!confirm('Remove this subreddit?')) return;
    
    try {
        const subreddits = Array.isArray(clientData.target_subreddits) 
            ? clientData.target_subreddits 
            : clientData.target_subreddits.split(',');
        
        subreddits.splice(index, 1);
        
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_subreddits: subreddits })
        });
        
        if (response.ok) {
            clientData.target_subreddits = subreddits;
            loadSubreddits();
            alert('✅ Subreddit removed successfully!');
        } else {
            throw new Error('Failed to remove subreddit');
        }
    } catch (error) {
        console.error('Error removing subreddit:', error);
        alert('❌ Failed to remove subreddit. Please try again.');
    }
}

// Populate Overview System Settings section
async function populateOverviewSettings() {
    try {
        // Fetch client settings for ratios
        const settingsResponse = await fetch(`${API_URL}/api/client-settings/${CLIENT_ID}`);
        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();
            
            // Update strategy ratios
            const replyRatio = settings.reply_percentage || 75;
            const postRatio = settings.post_percentage || 25;
            document.getElementById('overview-reply-ratio').textContent = replyRatio;
            document.getElementById('overview-post-ratio').textContent = postRatio;
            document.getElementById('overview-brand-ratio').textContent = settings.brand_mention_percentage || 0;
            document.getElementById('overview-product-ratio').textContent = settings.product_mention_percentage || 0;
        }
        
        // Populate keywords
        if (clientData.target_keywords && clientData.target_keywords.length > 0) {
            const keywords = Array.isArray(clientData.target_keywords) 
                ? clientData.target_keywords 
                : clientData.target_keywords.split(',');
            
            document.getElementById('overview-keywords').innerHTML = keywords
                .map(kw => `<span class="badge bg-primary me-1 mb-1">${kw.trim()}</span>`)
                .join('');
        } else {
            document.getElementById('overview-keywords').innerHTML = '<span class="text-muted">No keywords configured</span>';
        }
        
        // Populate subreddits
        if (clientData.target_subreddits && clientData.target_subreddits.length > 0) {
            const subreddits = Array.isArray(clientData.target_subreddits) 
                ? clientData.target_subreddits 
                : clientData.target_subreddits.split(',');
            
            document.getElementById('overview-subreddits').innerHTML = subreddits
                .map(sub => `<span class="badge bg-info me-1 mb-1">r/${sub.trim()}</span>`)
                .join('');
        } else {
            document.getElementById('overview-subreddits').innerHTML = '<span class="text-muted">No subreddits configured</span>';
        }
        
        // Populate owned subreddits
        const ownedSubreddits = clientData.owned_subreddits || clientData.brand_owned_subreddits || [];
        if (ownedSubreddits.length > 0) {
            const owned = Array.isArray(ownedSubreddits) ? ownedSubreddits : [];
            document.getElementById('overview-owned-subreddits').innerHTML = owned
                .map(sub => `<span class="badge bg-warning me-1 mb-1"><i class="fas fa-crown"></i> r/${sub.trim()}</span>`)
                .join('');
        } else {
            document.getElementById('overview-owned-subreddits').innerHTML = '<span class="text-muted">No owned subreddits. All subreddits are community-managed.</span>';
        }
        
        // Populate custom instructions - show BOTH brand voice AND special instructions
        const brandVoice = clientData.brand_voice || clientData.brand_voice_guidelines;
        const specialInstructions = clientData.special_instructions || clientData.explicit_instructions;
        
        let instructionsHTML = '';
        
        if (brandVoice) {
            instructionsHTML += `<div class="mb-3">
                <strong class="text-primary">Brand Voice:</strong>
                <div class="mt-1">${brandVoice}</div>
            </div>`;
        }
        
        if (specialInstructions) {
            instructionsHTML += `<div class="mb-3">
                <strong class="text-warning">Special Instructions:</strong>
                <div class="mt-1">${specialInstructions}</div>
            </div>`;
        }
        
        if (instructionsHTML) {
            document.getElementById('overview-instructions').innerHTML = instructionsHTML;
        } else {
            document.getElementById('overview-instructions').innerHTML = '<span class="text-muted">No custom instructions configured. Content will use default brand guidelines.</span>';
        }
        
        // Populate user profiles from clientData or fetch from database
        if (clientData.reddit_usernames && clientData.reddit_usernames.length > 0) {
            // Use reddit_usernames field if available
            const usernames = Array.isArray(clientData.reddit_usernames) 
                ? clientData.reddit_usernames 
                : clientData.reddit_usernames.split(',');
            document.getElementById('overview-user-profiles').innerHTML = usernames
                .map(u => {
                    const username = u.trim();
                    // Remove u/ prefix if it already exists
                    const displayName = username.startsWith('u/') ? username : `u/${username}`;
                    return `<span class="badge bg-success me-1 mb-1">${displayName}</span>`;
                })
                .join('');
        } else {
            // Try fetching from user profiles endpoint
            try {
                const profilesResponse = await fetch(`${API_URL}/api/user-profiles?client_id=${CLIENT_ID}`);
                if (profilesResponse.ok) {
                    const profiles = await profilesResponse.json();
                    if (profiles && profiles.length > 0) {
                        document.getElementById('overview-user-profiles').innerHTML = profiles
                            .map(p => {
                                const username = p.username || '';
                                // Clean username - remove 'u/' if present, then add it back consistently
                                const cleanUsername = username.replace(/^u\//, '');
                                const displayName = cleanUsername ? `u/${cleanUsername}` : username;
                                return `<span class="badge bg-success me-1 mb-1">${displayName}</span>`;
                            })
                            .join('');
                    } else {
                        document.getElementById('overview-user-profiles').innerHTML = '<span class="text-muted">No user profiles configured</span>';
                    }
                } else {
                    document.getElementById('overview-user-profiles').innerHTML = '<span class="text-muted">No user profiles configured</span>';
                }
            } catch (error) {
                console.error('Error loading profiles:', error);
                document.getElementById('overview-user-profiles').innerHTML = '<span class="text-muted">No user profiles configured</span>';
            }
        }
        
    } catch (error) {
        console.error('Error populating overview settings:', error);
    }
}
