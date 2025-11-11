// EchoMind Client Onboarding - Wave 1 FIXED JavaScript
// Complete functionality for all 6 Wave 1 features + Section 2 fixes

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTagInputs();
    initializeFileUpload();
    initializePostingFrequency();
    addProfile(); // Add first profile by default
});

// ==================== SECTION NAVIGATION ====================

function nextSection() {
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
            const products = getProducts();

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
            // Products are optional (client DB has product feed)
            // No validation needed
            break;

        case 2:
            // Target Audience validation
            if (subreddits.length === 0) {
                showError('Please add at least one target subreddit');
                return false;
            }
            if (keywords.length === 0) {
                showError('Please add at least one target keyword');
                return false;
            }
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
            // Brand Materials - optional, so just validate file count if any
            if (uploadedFiles.length > 0 && uploadedFiles.length < 5) {
                const proceed = confirm('You have uploaded fewer than 5 files. For best results, we recommend 5-100+ files. Do you want to continue anyway?');
                if (!proceed) return false;
            }
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

// ==================== TAG INPUT FUNCTIONALITY (FIXED) ====================

function initializeTagInputs() {
    // Subreddits tag input - supports Enter and comma
    const subredditInput = document.getElementById('subredditInput');
    const subredditsContainer = document.getElementById('subredditsContainer');
    
    subredditInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTagFromInput(subredditInput, subredditsContainer, subreddits);
        }
    });

    subredditInput.addEventListener('input', (e) => {
        // Check for comma-separated values
        if (e.target.value.includes(',')) {
            const values = e.target.value.split(',');
            values.forEach(val => {
                const trimmed = val.trim();
                if (trimmed && !subreddits.includes(trimmed)) {
                    subreddits.push(trimmed);
                }
            });
            renderTags(subredditsContainer, subreddits, subredditInput);
            e.target.value = '';
        }
    });

    subredditsContainer.addEventListener('click', () => {
        subredditInput.focus();
    });

    // Keywords tag input - supports Enter and comma
    const keywordInput = document.getElementById('keywordInput');
    const keywordsContainer = document.getElementById('keywordsContainer');
    
    keywordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTagFromInput(keywordInput, keywordsContainer, keywords);
        }
    });

    keywordInput.addEventListener('input', (e) => {
        // Check for comma-separated values
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

    // Excluded keywords tag input - supports Enter and comma
    const excludedInput = document.getElementById('excludedInput');
    const excludedContainer = document.getElementById('excludedContainer');
    
    excludedInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTagFromInput(excludedInput, excludedContainer, excludedKeywords);
        }
    });

    excludedInput.addEventListener('input', (e) => {
        // Check for comma-separated values
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

    // Brand-owned subreddits tag input - supports Enter and comma
    const brandOwnedInput = document.getElementById('brandOwnedInput');
    const brandOwnedContainer = document.getElementById('brandOwnedContainer');
    
    if (brandOwnedInput) {
        brandOwnedInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTagFromInput(brandOwnedInput, brandOwnedContainer, brandOwnedSubreddits);
            }
        });

        brandOwnedInput.addEventListener('input', (e) => {
            // Check for comma-separated values
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
}

function addTagFromInput(input, container, array) {
    const value = input.value.trim();
    if (value && !array.includes(value)) {
        array.push(value);
        renderTags(container, array, input);
        input.value = '';
    }
}

function removeTag(container, array, value, input) {
    const index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
        renderTags(container, array, input);
    }
}

function renderTags(container, array, input) {
    // Clear existing tags
    const existingTags = container.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());

    // Add tags before input
    array.forEach(value => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        const escapedValue = value.replace(/'/g, "\\'");
        const containerId = container.id;
        tag.innerHTML = `
            ${value}
            <span class="tag-remove" onclick="removeTagByValue('${containerId}', '${escapedValue}')">×</span>
        `;
        container.insertBefore(tag, input);
    });
}

function removeTagByValue(containerId, value) {
    const container = document.getElementById(containerId);
    const input = container.querySelector('input');
    
    if (containerId === 'subredditsContainer') {
        removeTag(container, subreddits, value, input);
    } else if (containerId === 'keywordsContainer') {
        removeTag(container, keywords, value, input);
    } else if (containerId === 'excludedContainer') {
        removeTag(container, excludedKeywords, value, input);
    } else if (containerId === 'brandOwnedContainer') {
        removeTag(container, brandOwnedSubreddits, value, input);
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
        // Clear brand-owned subreddits if unchecked
        brandOwnedSubreddits = [];
        const container = document.getElementById('brandOwnedContainer');
        const input = document.getElementById('brandOwnedInput');
        if (container && input) {
            renderTags(container, brandOwnedSubreddits, input);
        }
    }
}

// ==================== AUTO-IDENTIFY FUNCTIONS ====================

async function autoIdentifySubreddits() {
    const btn = event.target;
    const industry = document.getElementById('industry').value.trim();
    
    if (!industry) {
        showError('Please enter your industry first to auto-identify subreddits');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = '🔄 Analyzing...';
    
    try {
        const response = await fetch(`${API_URL}/api/client-onboarding/auto-identify-subreddits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ industry: industry })
        });
        
        if (!response.ok) {
            throw new Error('Failed to auto-identify subreddits');
        }
        
        const result = await response.json();
        
        // Add suggested subreddits
        if (result.subreddits && result.subreddits.length > 0) {
            result.subreddits.forEach(sub => {
                if (!subreddits.includes(sub)) {
                    subreddits.push(sub);
                }
            });
            
            const container = document.getElementById('subredditsContainer');
            const input = document.getElementById('subredditInput');
            renderTags(container, subreddits, input);
            
            alert(`✅ Added ${result.subreddits.length} high-value subreddits for ${industry}!`);
        }
        
    } catch (error) {
        console.error('Auto-identify error:', error);
        showError('Auto-identify feature coming soon! Please add subreddits manually for now.');
    } finally {
        btn.disabled = false;
        btn.textContent = '🎯 Auto-Identify High-Value Subreddits';
    }
}

async function autoIdentifyKeywords() {
    const btn = event.target;
    const websiteUrl = document.getElementById('websiteUrl').value.trim();
    
    if (!websiteUrl) {
        showError('Please enter your website URL first to auto-identify keywords');
        return;
    }
    
    btn.disabled = true;
    btn.textContent = '🔄 Analyzing...';
    
    try {
        const response = await fetch(`${API_URL}/api/client-onboarding/auto-identify-keywords`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ website_url: websiteUrl })
        });
        
        if (!response.ok) {
            throw new Error('Failed to auto-identify keywords');
        }
        
        const result = await response.json();
        
        // Add suggested keywords
        if (result.keywords && result.keywords.length > 0) {
            result.keywords.forEach(kw => {
                if (!keywords.includes(kw)) {
                    keywords.push(kw);
                }
            });
            
            const container = document.getElementById('keywordsContainer');
            const input = document.getElementById('keywordInput');
            renderTags(container, keywords, input);
            
            alert(`✅ Added ${result.keywords.length} relevant keywords from your website!`);
        }
        
    } catch (error) {
        console.error('Auto-identify error:', error);
        showError('Auto-identify feature coming soon! Please add keywords manually for now.');
    } finally {
        btn.disabled = false;
        btn.textContent = '🎯 Auto-Identify Keywords from Website';
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
                           onkeydown="handleProfileSubreddit(event, ${profile.id})">
                </div>
            </div>
        `;
        
        container.appendChild(profileCard);
        
        // Render existing subreddits for this profile
        renderProfileSubreddits(profile.id);
    });
    
    // Update add button state
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
        const input = event.target;
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
    
    // Remove existing tags
    const existingTags = container.querySelectorAll('.tag');
    existingTags.forEach(tag => tag.remove());
    
    // Add new tags
    profile.target_subreddits.forEach(subreddit => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        const escapedSub = subreddit.replace(/'/g, "\\'");
        tag.innerHTML = `
            ${subreddit}
            <span class="tag-remove" onclick="removeProfileSubreddit(${profileId}, '${escapedSub}')">×</span>
        `;
        container.insertBefore(tag, input);
    });
}

// ==================== POSTING FREQUENCY FUNCTIONALITY ====================

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

// ==================== FILE UPLOAD FUNCTIONALITY ====================

function initializeFileUpload() {
    const container = document.getElementById('fileUploadContainer');
    const input = document.getElementById('fileInput');
    
    // Click to upload
    container.addEventListener('click', () => {
        input.click();
    });
    
    // File selection
    input.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Drag and drop
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
        // Check if file already exists
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
        // Prepare form data
        const formData = {
            // Section 1: Company Info
            company_name: document.getElementById('companyName').value.trim(),
            industry: document.getElementById('industry').value.trim(),
            website_url: document.getElementById('websiteUrl').value.trim(),
            products: getProducts(),
            
            // Section 2: Target Audience
            target_subreddits: subreddits,
            brand_owns_subreddit: document.getElementById('brandOwnsSubreddit').checked,
            brand_owned_subreddits: brandOwnedSubreddits,
            target_keywords: keywords,
            excluded_keywords: excludedKeywords,
            
            // Section 3: Reddit Profiles
            reddit_user_profiles: profiles.map(p => ({
                username: p.username,
                profile_type: p.profile_type,
                target_subreddits: p.target_subreddits
            })),
            
            // Section 4: Content Strategy
            posting_frequency: parseInt(document.getElementById('postingFrequency').value),
            monthly_opportunity_budget: parseInt(document.getElementById('opportunityBudget').value),
            content_tone: document.getElementById('contentTone').value,
            brand_voice_guidelines: document.getElementById('brandVoice').value.trim() || null,
            
            // Section 6: Notifications
            notification_email: document.getElementById('notificationEmail').value.trim(),
            slack_webhook_url: document.getElementById('slackWebhook').value.trim() || null,
            primary_contact_name: document.getElementById('contactName').value.trim() || null,
            primary_contact_email: document.getElementById('contactEmail').value.trim() || null,
            
            // Subscription info (defaults)
            subscription_tier: 'professional',
            subscription_status: 'active',
            monthly_price_usd: 2000
        };
        
        console.log('Submitting form data:', formData);
        
        // Submit main form data
        const response = await fetch(`${API_URL}/api/client-onboarding/onboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to submit onboarding form');
        }
        
        const result = await response.json();
        console.log('Onboarding successful:', result);
        
        // Upload files if any (non-blocking)
        if (uploadedFiles.length > 0) {
            uploadFiles(result.client_id).catch(err => {
                console.error('File upload error (non-critical):', err);
            });
        }
        
        // Show success message
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.add('active');
        
        // Update progress bar to completed
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.add('completed');
            step.classList.remove('active');
        });
        
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
        // Non-critical error, don't show to user
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Expose functions to global scope for onclick handlers
window.nextSection = nextSection;
window.prevSection = prevSection;
window.addProduct = addProduct;
window.removeTagByValue = removeTagByValue;
window.toggleBrandOwnedField = toggleBrandOwnedField;
window.autoIdentifySubreddits = autoIdentifySubreddits;
window.autoIdentifyKeywords = autoIdentifyKeywords;
window.addProfile = addProfile;
window.removeProfile = removeProfile;
window.updateProfile = updateProfile;
window.handleProfileSubreddit = handleProfileSubreddit;
window.removeProfileSubreddit = removeProfileSubreddit;
window.removeFile = removeFile;
window.submitForm = submitForm;
