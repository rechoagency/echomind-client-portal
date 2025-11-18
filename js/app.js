// EchoMind Client Onboarding - EMERGENCY FIX
// Fixes: 1) Tag input not working, 2) Auto-identify checkboxes

// Configuration
const API_URL = 'https://echomind-backend-production.up.railway.app';

// Global state
let currentSection = 1;
const totalSections = 6;
let subreddits = [];
let keywords = [];
let excludedKeywords = [];
let brandOwnedSubreddits = [];
let profiles = [];
let uploadedFiles = [];
let autoIdentifySubreddits = false;
let autoIdentifyKeywords = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing onboarding form...');
    initializeTagInputs();
    initializeFileUpload();
    initializePostingFrequency();
    addProfile(); // Add first profile by default
});

// ==================== SECTION NAVIGATION ====================

function nextSection() {
    console.log('Next section clicked, current:', currentSection);
    console.log('Current subreddits:', subreddits);
    console.log('Current keywords:', keywords);
    
    if (validateSection(currentSection)) {
        currentSection++;
        if (currentSection > totalSections) {
            currentSection = totalSections;
        }
        updateUI();
    }
}

function prevSection() {
    currentSection--;
    if (currentSection < 1) {
        currentSection = 1;
    }
    updateUI();
}

function updateUI() {
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelector(`[data-section="${currentSection}"]`).classList.add('active');

    // Update progress bar
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentSection) {
            step.classList.add('active');
        } else if (stepNum < currentSection) {
            step.classList.add('completed');
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateSection(section) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('active');

    switch(section) {
        case 1:
            // Company Info validation
            const companyName = document.getElementById('companyName').value.trim();
            const industry = document.getElementById('industry').value.trim();
            const websiteUrl = document.getElementById('websiteUrl').value.trim();

            if (!companyName) {
                showError('Please enter your company name');
                return false;
            }
            if (!industry) {
                showError('Please enter your industry');
                return false;
            }
            if (!websiteUrl) {
                showError('Please enter your website URL');
                return false;
            }
            // Products are optional
            break;

        case 2:
            // Target Audience validation
            console.log('=== SECTION 2 VALIDATION ===');
            console.log('Auto-identify subreddits:', autoIdentifySubreddits);
            console.log('Subreddits array:', subreddits);
            console.log('Subreddits count:', subreddits.length);
            console.log('Auto-identify keywords:', autoIdentifyKeywords);
            console.log('Keywords array:', keywords);
            console.log('Keywords count:', keywords.length);
            
            // If auto-identify is checked, skip manual validation
            if (!autoIdentifySubreddits && subreddits.length === 0) {
                showError('Please add at least one target subreddit OR check the "Auto-Identify" box below the input field');
                return false;
            }
            if (!autoIdentifyKeywords && keywords.length === 0) {
                showError('Please add at least one target keyword OR check the "Auto-Identify" box below the input field');
                return false;
            }
            
            console.log('Section 2 validation PASSED');
            console.log('========================')
            
            // If brand owns checkbox is checked, validate brand-owned subreddits
            const brandOwnsChecked = document.getElementById('brandOwnsSubreddit').checked;
            if (brandOwnsChecked && brandOwnedSubreddits.length === 0) {
                showError('Please specify which subreddit(s) your brand owns or moderates');
                return false;
            }
            break;

        case 3:
            // Reddit Profiles validation
            if (profiles.length === 0) {
                showError('Please add at least one Reddit profile');
                return false;
            }
            
            // Validate each profile
            for (let i = 0; i < profiles.length; i++) {
                const profile = profiles[i];
                if (!profile.username || profile.username.trim() === '') {
                    showError(`Profile ${i + 1}: Please enter a username`);
                    return false;
                }
                if (!profile.profile_type || profile.profile_type === '') {
                    showError(`Profile ${i + 1}: Please select a profile type`);
                    return false;
                }
                if (profile.target_subreddits.length === 0) {
                    showError(`Profile ${i + 1}: Please add at least one target subreddit`);
                    return false;
                }
            }
            break;

        case 4:
            // Content Strategy validation
            const frequency = document.getElementById('postingFrequency').value;
            const budget = document.getElementById('opportunityBudget').value;
            const tone = document.getElementById('contentTone').value;

            if (!frequency || frequency < 1) {
                showError('Please enter a valid posting frequency');
                return false;
            }
            if (!budget || budget < 1) {
                showError('Please enter a valid opportunity budget');
                return false;
            }
            if (!tone) {
                showError('Please select a content tone');
                return false;
            }
            break;

        case 5:
            // Brand Materials - optional
            break;

        case 6:
            // Notifications validation
            const notificationEmail = document.getElementById('notificationEmail').value.trim();
            if (!notificationEmail) {
                showError('Please enter a notification email address');
                return false;
            }
            if (!isValidEmail(notificationEmail)) {
                showError('Please enter a valid email address');
                return false;
            }
            break;
    }

    return true;
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '⚠️ ' + message;
    errorDiv.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==================== TAG INPUT FUNCTIONALITY (EMERGENCY FIX) ====================

function initializeTagInputs() {
    console.log('Initializing tag inputs...');
    
    // Subreddits
    const subredditInput = document.getElementById('subredditInput');
    const subredditsContainer = document.getElementById('subredditsContainer');
    
    if (!subredditInput || !subredditsContainer) {
        console.error('Subreddit input elements not found!');
        return;
    }
    
    subredditInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = subredditInput.value.trim();
            if (value) {
                if (!subreddits.includes(value)) {
                    subreddits.push(value);
                    console.log('Added subreddit:', value, 'Total:', subreddits);
                }
                renderTags(subredditsContainer, subreddits, subredditInput);
                subredditInput.value = '';
            }
        }
    });

    subredditInput.addEventListener('blur', (e) => {
        const value = subredditInput.value.trim();
        if (value) {
            if (!subreddits.includes(value)) {
                subreddits.push(value);
                console.log('Added subreddit on blur:', value);
            }
            renderTags(subredditsContainer, subreddits, subredditInput);
            subredditInput.value = '';
        }
    });

    subredditInput.addEventListener('input', (e) => {
        if (e.target.value.includes(',')) {
            const values = e.target.value.split(',');
            values.forEach(val => {
                const trimmed = val.trim();
                if (trimmed && !subreddits.includes(trimmed)) {
                    subreddits.push(trimmed);
                    console.log('Added subreddit (comma):', trimmed);
                }
            });
            renderTags(subredditsContainer, subreddits, subredditInput);
            e.target.value = '';
        }
    });

    subredditsContainer.addEventListener('click', () => {
        subredditInput.focus();
    });

    // Keywords
    const keywordInput = document.getElementById('keywordInput');
    const keywordsContainer = document.getElementById('keywordsContainer');
    
    keywordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = keywordInput.value.trim();
            if (value) {
                if (!keywords.includes(value)) {
                    keywords.push(value);
                    console.log('Added keyword:', value);
                }
                renderTags(keywordsContainer, keywords, keywordInput);
                keywordInput.value = '';
            }
        }
    });

    keywordInput.addEventListener('blur', (e) => {
        const value = keywordInput.value.trim();
        if (value) {
            if (!keywords.includes(value)) {
                keywords.push(value);
            }
            renderTags(keywordsContainer, keywords, keywordInput);
            keywordInput.value = '';
        }
    });

    keywordInput.addEventListener('input', (e) => {
        if (e.target.value.includes(',')) {
            const values = e.target.value.split(',');
            values.forEach(val => {
                const trimmed = val.trim();
                if (trimmed && !keywords.includes(trimmed)) {
                    keywords.push(trimmed);
                }
            });
            renderTags(keywordsContainer, keywords, keywordInput);
            e.target.value = '';
        }
    });

    keywordsContainer.addEventListener('click', () => {
        keywordInput.focus();
    });

    // Excluded keywords
    const excludedInput = document.getElementById('excludedInput');
    const excludedContainer = document.getElementById('excludedContainer');
    
    excludedInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = excludedInput.value.trim();
            if (value) {
                if (!excludedKeywords.includes(value)) {
                    excludedKeywords.push(value);
                }
                renderTags(excludedContainer, excludedKeywords, excludedInput);
                excludedInput.value = '';
            }
        }
    });

    excludedInput.addEventListener('input', (e) => {
        if (e.target.value.includes(',')) {
            const values = e.target.value.split(',');
            values.forEach(val => {
                const trimmed = val.trim();
                if (trimmed && !excludedKeywords.includes(trimmed)) {
                    excludedKeywords.push(trimmed);
                }
            });
            renderTags(excludedContainer, excludedKeywords, excludedInput);
            e.target.value = '';
        }
    });

    excludedContainer.addEventListener('click', () => {
        excludedInput.focus();
    });

    // Brand-owned subreddits
    const brandOwnedInput = document.getElementById('brandOwnedInput');
    const brandOwnedContainer = document.getElementById('brandOwnedContainer');
    
    if (brandOwnedInput && brandOwnedContainer) {
        brandOwnedInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = brandOwnedInput.value.trim();
                if (value) {
                    if (!brandOwnedSubreddits.includes(value)) {
                        brandOwnedSubreddits.push(value);
                    }
                    renderTags(brandOwnedContainer, brandOwnedSubreddits, brandOwnedInput);
                    brandOwnedInput.value = '';
                }
            }
        });

        brandOwnedInput.addEventListener('input', (e) => {
            if (e.target.value.includes(',')) {
                const values = e.target.value.split(',');
                values.forEach(val => {
                    const trimmed = val.trim();
                    if (trimmed && !brandOwnedSubreddits.includes(trimmed)) {
                        brandOwnedSubreddits.push(trimmed);
                    }
                });
                renderTags(brandOwnedContainer, brandOwnedSubreddits, brandOwnedInput);
                e.target.value = '';
            }
        });

        brandOwnedContainer.addEventListener('click', () => {
            brandOwnedInput.focus();
        });
    }
    
    console.log('Tag inputs initialized successfully');
}

function renderTags(container, array, input) {
    console.log('Rendering tags for', container.id, 'Array:', array);
    
    // Clear existing tags (but not the input)
    const existingTags = container.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());

    // Add tags before input
    array.forEach(value => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${value}
            <span class="tag-remove" data-value="${value}" data-container="${container.id}">×</span>
        `;
        
        // Add click handler for remove
        const removeBtn = tag.querySelector('.tag-remove');
        removeBtn.addEventListener('click', function() {
            const val = this.getAttribute('data-value');
            const contId = this.getAttribute('data-container');
            removeTagByValue(contId, val);
        });
        
        container.insertBefore(tag, input);
    });
}

function removeTagByValue(containerId, value) {
    console.log('Removing tag:', value, 'from', containerId);
    const container = document.getElementById(containerId);
    const input = container.querySelector('input');
    
    if (containerId === 'subredditsContainer') {
        const index = subreddits.indexOf(value);
        if (index > -1) {
            subreddits.splice(index, 1);
        }
        renderTags(container, subreddits, input);
    } else if (containerId === 'keywordsContainer') {
        const index = keywords.indexOf(value);
        if (index > -1) {
            keywords.splice(index, 1);
        }
        renderTags(container, keywords, input);
    } else if (containerId === 'excludedContainer') {
        const index = excludedKeywords.indexOf(value);
        if (index > -1) {
            excludedKeywords.splice(index, 1);
        }
        renderTags(container, excludedKeywords, input);
    } else if (containerId === 'brandOwnedContainer') {
        const index = brandOwnedSubreddits.indexOf(value);
        if (index > -1) {
            brandOwnedSubreddits.splice(index, 1);
        }
        renderTags(container, brandOwnedSubreddits, input);
    }
}

// ==================== AUTO-IDENTIFY CHECKBOXES ====================

function toggleAutoIdentifySubreddits() {
    const checkbox = document.getElementById('autoIdentifySubredditsCheck');
    autoIdentifySubreddits = checkbox.checked;
    console.log('Auto-identify subreddits:', autoIdentifySubreddits);
    
    const container = document.getElementById('subredditsContainer');
    if (autoIdentifySubreddits) {
        container.style.borderColor = '#10b981';
        container.style.backgroundColor = '#d1fae5';
        alert('✅ Auto-identify enabled! System will identify 5-50 high-value subreddits based on your industry. You can skip manual input.');
    } else {
        container.style.borderColor = '#e2e8f0';
        container.style.backgroundColor = 'transparent';
    }
}

function toggleAutoIdentifyKeywords() {
    const checkbox = document.getElementById('autoIdentifyKeywordsCheck');
    autoIdentifyKeywords = checkbox.checked;
    console.log('Auto-identify keywords:', autoIdentifyKeywords);
    
    const container = document.getElementById('keywordsContainer');
    if (autoIdentifyKeywords) {
        container.style.borderColor = '#10b981';
        container.style.backgroundColor = '#d1fae5';
        alert('✅ Auto-identify enabled! System will extract keywords from your website using Google API + OpenAI. You can skip manual input.');
    } else {
        container.style.borderColor = '#e2e8f0';
        container.style.backgroundColor = 'transparent';
    }
}

// ==================== BRAND OWNERSHIP TOGGLE ====================

function toggleBrandOwnedField() {
    const checkbox = document.getElementById('brandOwnsSubreddit');
    const field = document.getElementById('brandOwnedField');
    
    if (checkbox.checked) {
        field.classList.add('active');
    } else {
        field.classList.remove('active');
        brandOwnedSubreddits = [];
        const container = document.getElementById('brandOwnedContainer');
        const input = document.getElementById('brandOwnedInput');
        if (container && input) {
            renderTags(container, brandOwnedSubreddits, input);
        }
    }
}

// ==================== PRODUCTS FUNCTIONALITY ====================

function getProducts() {
    const inputs = document.querySelectorAll('.product-input');
    const products = [];
    inputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
            products.push(value);
        }
    });
    return products;
}

function addProduct() {
    const productsList = document.getElementById('productsList');
    const itemEntry = document.createElement('div');
    itemEntry.className = 'item-entry';
    itemEntry.innerHTML = `
        <input type="text" placeholder="e.g., Another product or service" class="product-input">
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    productsList.appendChild(itemEntry);
}

// ==================== REDDIT PROFILES FUNCTIONALITY ====================

function addProfile() {
    if (profiles.length >= 10) {
        showError('Maximum 10 profiles allowed');
        return;
    }

    const profileId = Date.now();
    const profile = {
        id: profileId,
        username: '',
        profile_type: '',
        target_subreddits: []
    };
    
    profiles.push(profile);
    renderProfiles();
}

function removeProfile(profileId) {
    profiles = profiles.filter(p => p.id !== profileId);
    renderProfiles();
}

function renderProfiles() {
    const container = document.getElementById('profilesContainer');
    const addBtn = document.getElementById('addProfileBtn');
    
    container.innerHTML = '';
    
    profiles.forEach((profile, index) => {
        const profileCard = document.createElement('div');
        profileCard.className = 'profile-card';
        profileCard.innerHTML = `
            <div class="profile-header">
                <div class="profile-number">Profile ${index + 1}</div>
                ${profiles.length > 1 ? `<button type="button" class="remove-profile-btn" onclick="removeProfile(${profile.id})">Remove</button>` : ''}
            </div>
            
            <div class="form-group">
                <label>Reddit Username *</label>
                <input type="text" 
                       placeholder="e.g., u/TheWaite" 
                       value="${profile.username}"
                       onchange="updateProfile(${profile.id}, 'username', this.value)">
            </div>
            
            <div class="form-group">
                <label>Profile Type *</label>
                <select onchange="updateProfile(${profile.id}, 'profile_type', this.value)">
                    <option value="">Select profile type...</option>
                    <option value="official_brand" ${profile.profile_type === 'official_brand' ? 'selected' : ''}>Official Brand Account</option>
                    <option value="personal_brand" ${profile.profile_type === 'personal_brand' ? 'selected' : ''}>Personal Brand Account</option>
                    <option value="community_specific" ${profile.profile_type === 'community_specific' ? 'selected' : ''}>Community-Specific Account</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Target Subreddits for This Profile * <span class="label-hint">(Press Enter or comma after each)</span></label>
                <div class="tag-input-container" id="profile-subreddits-${profile.id}">
                    <input type="text" 
                           placeholder="e.g., r/Mommit"
                           onkeydown="handleProfileSubreddit(event, ${profile.id})"
                           onblur="handleProfileSubredditBlur(${profile.id}, this)"
                           oninput="handleProfileSubredditInput(event, ${profile.id})">
                </div>
            </div>
        `;
        
        container.appendChild(profileCard);
        renderProfileSubreddits(profile.id);
    });
    
    if (profiles.length >= 10) {
        addBtn.disabled = true;
        addBtn.textContent = '✓ Maximum 10 Profiles Reached';
    } else {
        addBtn.disabled = false;
        addBtn.textContent = '+ Add Reddit Profile';
    }
}

function updateProfile(profileId, field, value) {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
        profile[field] = value;
    }
}

function handleProfileSubreddit(event, profileId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addProfileSubreddit(profileId, event.target);
    }
}

function handleProfileSubredditBlur(profileId, input) {
    addProfileSubreddit(profileId, input);
}

function handleProfileSubredditInput(event, profileId) {
    if (event.target.value.includes(',')) {
        const input = event.target;
        const values = input.value.split(',');
        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            values.forEach(val => {
                const trimmed = val.trim();
                if (trimmed && !profile.target_subreddits.includes(trimmed)) {
                    profile.target_subreddits.push(trimmed);
                }
            });
            renderProfileSubreddits(profileId);
            input.value = '';
        }
    }
}

function addProfileSubreddit(profileId, input) {
    const value = input.value.trim();
    if (value) {
        const profile = profiles.find(p => p.id === profileId);
        if (profile && !profile.target_subreddits.includes(value)) {
            profile.target_subreddits.push(value);
            renderProfileSubreddits(profileId);
            input.value = '';
        }
    }
}

function removeProfileSubreddit(profileId, subreddit) {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
        profile.target_subreddits = profile.target_subreddits.filter(s => s !== subreddit);
        renderProfileSubreddits(profileId);
    }
}

function renderProfileSubreddits(profileId) {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    const container = document.getElementById(`profile-subreddits-${profileId}`);
    if (!container) return;
    
    const input = container.querySelector('input');
    const existingTags = container.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());
    
    profile.target_subreddits.forEach(subreddit => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${subreddit}
            <span class="tag-remove" onclick="removeProfileSubreddit(${profileId}, '${subreddit}')">×</span>
        `;
        container.insertBefore(tag, input);
    });
}

// ==================== POSTING FREQUENCY ====================

function initializePostingFrequency() {
    const frequencyInput = document.getElementById('postingFrequency');
    frequencyInput.addEventListener('input', updatePostingSchedule);
}

function updatePostingSchedule() {
    const frequency = parseInt(document.getElementById('postingFrequency').value);
    const scheduleDisplay = document.getElementById('scheduleDisplay');
    
    if (frequency && frequency > 0) {
        const mondayPosts = Math.ceil(frequency / 2);
        const thursdayPosts = Math.floor(frequency / 2);
        
        document.getElementById('mondayPosts').textContent = mondayPosts;
        document.getElementById('thursdayPosts').textContent = thursdayPosts;
        
        scheduleDisplay.style.display = 'block';
    } else {
        scheduleDisplay.style.display = 'none';
    }
}

// ==================== FILE UPLOAD ====================

function initializeFileUpload() {
    const container = document.getElementById('fileUploadContainer');
    const input = document.getElementById('fileInput');
    
    container.addEventListener('click', () => {
        input.click();
    });
    
    input.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('dragover');
    });
    
    container.addEventListener('dragleave', () => {
        container.classList.remove('dragover');
    });
    
    container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (!uploadedFiles.find(f => f.name === file.name && f.size === file.size)) {
            uploadedFiles.push(file);
        }
    });
    renderFileList();
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

function renderFileList() {
    const fileList = document.getElementById('fileList');
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSizeGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
    
    fileList.innerHTML = `
        <div style="margin-bottom: 15px; padding: 12px; background: #eff6ff; border-radius: 8px; border: 1px solid #bae6fd;">
            <strong style="color: #0369a1;">📊 ${uploadedFiles.length} files selected</strong>
            <span style="color: #0c4a6e; margin-left: 10px;">Total: ${totalSizeGB} GB</span>
        </div>
        ${uploadedFiles.map((file, index) => `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
                <button type="button" class="file-remove" onclick="removeFile(${index})">Remove</button>
            </div>
        `).join('')}
    `;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==================== FORM SUBMISSION ====================

async function submitForm() {
    if (!validateSection(6)) {
        return;
    }
    
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Processing...';
    
    try {
        const formData = {
            company_name: document.getElementById('companyName').value.trim(),
            industry: document.getElementById('industry').value.trim(),
            website_url: document.getElementById('websiteUrl').value.trim(),
            products: getProducts(),
            target_subreddits: autoIdentifySubreddits ? ['AUTO_IDENTIFY'] : subreddits,
            brand_owns_subreddit: document.getElementById('brandOwnsSubreddit').checked,
            brand_owned_subreddits: brandOwnedSubreddits,
            target_keywords: autoIdentifyKeywords ? ['AUTO_IDENTIFY'] : keywords,
            excluded_keywords: excludedKeywords,
            reddit_user_profiles: profiles.map(p => ({
                username: p.username,
                profile_type: p.profile_type,
                target_subreddits: p.target_subreddits
            })),
            posting_frequency: parseInt(document.getElementById('postingFrequency').value),
            monthly_opportunity_budget: parseInt(document.getElementById('opportunityBudget').value),
            content_tone: document.getElementById('contentTone').value,
            brand_voice_guidelines: document.getElementById('brandVoice').value.trim() || null,
            reply_percentage: parseInt(document.getElementById('replyPostSlider')?.value || 70),
            brand_mention_percentage: parseInt(document.getElementById('brandMentionSlider')?.value || 30),
            product_mention_percentage: parseInt(document.getElementById('productMentionSlider')?.value || 20),
            explicit_instructions: document.getElementById('specialInstructions')?.value.trim() || null,
            notification_email: document.getElementById('notificationEmail').value.trim(),
            slack_webhook_url: document.getElementById('slackWebhook').value.trim() || null,
            primary_contact_name: document.getElementById('contactName').value.trim() || null,
            primary_contact_email: document.getElementById('contactEmail').value.trim() || null,
            subscription_tier: 'professional',
            subscription_status: 'active',
            monthly_price_usd: 2000
        };
        
        console.log('Submitting form data:', formData);
        
        const response = await fetch(`${API_URL}/api/client-onboarding/onboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit onboarding form');
        }
        
        const result = await response.json();
        console.log('Onboarding successful:', result);
        
        if (uploadedFiles.length > 0) {
            uploadFiles(result.client_id).catch(err => {
                console.error('File upload error (non-critical):', err);
            });
        }
        
        // Redirect to dashboard after successful onboarding
        window.location.href = `/dashboard.html?client_id=${result.client_id}`;
        
    } catch (error) {
        console.error('Submission error:', error);
        showError(error.message || 'Failed to submit form. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Complete Onboarding';
    }
}

async function uploadFiles(clientId) {
    try {
        const formData = new FormData();
        formData.append('client_id', clientId);
        
        uploadedFiles.forEach(file => {
            formData.append('files', file);
        });
        
        const response = await fetch(`${API_URL}/api/client-onboarding/upload-files`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('File upload failed');
        }
        
        const result = await response.json();
        console.log('Files uploaded successfully:', result);
        
    } catch (error) {
        console.error('File upload error:', error);
    }
}

// Expose functions to global scope
window.nextSection = nextSection;
window.prevSection = prevSection;
window.addProduct = addProduct;
window.removeTagByValue = removeTagByValue;
window.toggleBrandOwnedField = toggleBrandOwnedField;
window.toggleAutoIdentifySubreddits = toggleAutoIdentifySubreddits;
window.toggleAutoIdentifyKeywords = toggleAutoIdentifyKeywords;
window.addProfile = addProfile;
window.removeProfile = removeProfile;
window.updateProfile = updateProfile;
window.handleProfileSubreddit = handleProfileSubreddit;
window.handleProfileSubredditBlur = handleProfileSubredditBlur;
window.handleProfileSubredditInput = handleProfileSubredditInput;
window.removeProfileSubreddit = removeProfileSubreddit;
window.removeFile = removeFile;
window.submitForm = submitForm;

// ============================================
// ONBOARDING SLIDER FUNCTIONS
// ============================================

// Update slider display values in onboarding form
function updateOnboardingSlider(elementId, value, type) {
    if (type === 'replyPost') {
        // Update reply/post split
        document.getElementById('replyValueOnboard').textContent = value + '%';
        document.getElementById('postValueOnboard').textContent = (100 - value) + '%';
    } else {
        // Update single value
        document.getElementById(elementId).textContent = value + '%';
    }
}

