// ============================================
// NEW FEATURES - Analytics, Content History, Documents, Settings
// FIXED VERSION with all requested features
// ============================================

// Load Analytics Data
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/api/analytics/performance/${CLIENT_ID}`);
        if (!response.ok) throw new Error('Failed to load analytics');
        
        const data = await response.json();
        
        // Update counters
        document.getElementById('brandMentionCount').textContent = data.brand_mentions || 0;
        document.getElementById('replyCount').textContent = data.replies_received || 0;
        document.getElementById('autoResponseCount').textContent = data.auto_responses_sent || 0;
        document.getElementById('engagementRate').textContent = (data.engagement_rate || 0).toFixed(2) + '%';
        
        // Load activity feed, auto-responses log, and negative mentions
        loadActivityFeed();
        loadAutoResponsesLog();
        loadNegativeMentions();
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        document.getElementById('brandMentionCount').textContent = 'Error';
    }
}

// Load Real-Time Activity Feed
async function loadActivityFeed() {
    try {
        const response = await fetch(`${API_URL}/api/analytics/activity-feed/${CLIENT_ID}?limit=50`);
        if (!response.ok) throw new Error('Failed to load activity feed');
        
        const data = await response.json();
        const feed = document.getElementById('activityFeed');
        
        if (!data.activities || data.activities.length === 0) {
            feed.innerHTML = '<p class="text-center text-muted">No recent activity</p>';
            return;
        }
        
        feed.innerHTML = data.activities.map(activity => {
            const icon = activity.type === 'brand_mention' ? 'bullhorn' :
                        activity.type === 'reply_received' ? 'reply' :
                        activity.type === 'auto_response' ? 'robot' : 'circle';
            
            const color = activity.type === 'brand_mention' ? '#667eea' :
                         activity.type === 'reply_received' ? '#764ba2' :
                         activity.type === 'auto_response' ? '#10b981' : '#718096';
            
            return `
                <div style="border-left: 4px solid ${color}; padding: 15px; margin-bottom: 10px; background: #f7fafc; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <i class="fas fa-${icon}" style="color: ${color}; margin-right: 10px;"></i>
                            <strong>${activity.title}</strong>
                        </div>
                        <small class="text-muted">${new Date(activity.timestamp).toLocaleString()}</small>
                    </div>
                    <p class="mb-0 mt-2" style="color: #4a5568; font-size: 14px;">${activity.description}</p>
                    ${activity.subreddit ? `<small class="text-muted">r/${activity.subreddit}</small>` : ''}
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading activity feed:', error);
        document.getElementById('activityFeed').innerHTML = '<p class="text-center text-danger">Failed to load activity feed</p>';
    }
}

// NEW: Load Auto-Responses Log
async function loadAutoResponsesLog() {
    const startDate = document.getElementById('autoResponsesStartDate')?.value || '';
    const endDate = document.getElementById('autoResponsesEndDate')?.value || '';
    
    try {
        let url = `${API_URL}/api/analytics/activity-feed/${CLIENT_ID}?limit=100&type=auto_response`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load auto-responses');
        
        const data = await response.json();
        const container = document.getElementById('autoResponsesList');
        
        if (!data.activities || data.activities.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No auto-responses yet</p>';
            return;
        }
        
        container.innerHTML = data.activities.map(response => `
            <div class="info-card mb-3" style="position: relative;">
                <button class="btn btn-sm btn-danger" style="position: absolute; top: 10px; right: 10px;" 
                        onclick="deleteAutoResponse('${response.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <span class="badge-custom badge-primary">AUTO-RESPONSE</span>
                            <span class="badge-custom" style="background: #fef3c7; color: #92400e;">
                                r/${response.subreddit || 'Unknown'}
                            </span>
                        </div>
                        <small class="text-muted">${new Date(response.timestamp).toLocaleString()}</small>
                    </div>
                </div>
                
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #f59e0b;">
                    <strong style="display: block; margin-bottom: 5px; color: #92400e;">
                        <i class="fas fa-comment-dots"></i> Original Post/Comment
                    </strong>
                    <p style="margin: 0; font-size: 14px; color: #4a5568;">${response.original_content || response.description}</p>
                </div>
                
                <div style="background: #d1fae5; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
                    <strong style="display: block; margin-bottom: 5px; color: #065f46;">
                        <i class="fas fa-robot"></i> Our Auto-Response
                    </strong>
                    <p style="margin: 0; font-size: 14px; color: #4a5568;">${response.response_text || 'Response content not available'}</p>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading auto-responses:', error);
        document.getElementById('autoResponsesList').innerHTML = '<p class="text-center text-danger">Failed to load auto-responses log</p>';
    }
}

// NEW: Load Negative Brand Mentions
async function loadNegativeMentions() {
    try {
        const response = await fetch(`${API_URL}/api/analytics/activity-feed/${CLIENT_ID}?limit=50&sentiment=negative`);
        if (!response.ok) throw new Error('Failed to load negative mentions');
        
        const data = await response.json();
        const container = document.getElementById('negativeMentionsList');
        
        if (!data.activities || data.activities.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No negative mentions detected ✅</p>';
            return;
        }
        
        container.innerHTML = data.activities.map(mention => `
            <div class="info-card mb-3" style="border-left: 4px solid #ef4444;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <span class="badge-custom" style="background: #fee2e2; color: #991b1b;">
                            <i class="fas fa-exclamation-triangle"></i> NEGATIVE
                        </span>
                        <span class="badge-custom" style="background: #fef3c7; color: #92400e;">
                            r/${mention.subreddit || 'Unknown'}
                        </span>
                    </div>
                    <small class="text-muted">${new Date(mention.timestamp).toLocaleString()}</small>
                </div>
                <p style="background: #fef2f2; padding: 12px; border-radius: 8px; margin: 0; font-size: 14px; color: #4a5568;">
                    ${mention.description}
                </p>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="respondToMention('${mention.id}')">
                        <i class="fas fa-reply"></i> Respond
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="viewFullContext('${mention.id}')">
                        <i class="fas fa-external-link-alt"></i> View on Reddit
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading negative mentions:', error);
        document.getElementById('negativeMentionsList').innerHTML = '<p class="text-center text-danger">Failed to load negative mentions</p>';
    }
}

// Delete auto-response
async function deleteAutoResponse(responseId) {
    if (!confirm('Delete this auto-response from the log?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/analytics/auto-response/${responseId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('✅ Auto-response deleted');
            loadAutoResponsesLog();
        } else {
            throw new Error('Failed to delete');
        }
    } catch (error) {
        console.error('Error deleting auto-response:', error);
        alert('❌ Failed to delete. This feature may not be available yet.');
    }
}

// Load Content Delivery History - ENHANCED with username and subreddit
async function loadContentHistory() {
    const startDate = document.getElementById('contentStartDate').value;
    const endDate = document.getElementById('contentEndDate').value;
    const typeFilter = document.getElementById('contentTypeFilter').value;
    
    try {
        let url = `${API_URL}/api/analytics/delivery-history/${CLIENT_ID}?`;
        if (startDate) url += `start_date=${startDate}&`;
        if (endDate) url += `end_date=${endDate}&`;
        if (typeFilter !== 'all') url += `content_type=${typeFilter}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load content history');
        
        const data = await response.json();
        const container = document.getElementById('contentHistoryList');
        
        if (!data.content || data.content.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No content delivered yet</p>';
            return;
        }
        
        container.innerHTML = data.content.map(item => `
            <div class="info-card mb-3">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <span class="badge-custom badge-primary">${item.content_type.toUpperCase()}</span>
                        <span class="badge-custom" style="background: #fef3c7; color: #92400e;">
                            <i class="fas fa-reddit"></i> r/${item.subreddit || 'Unknown'}
                        </span>
                        <span class="badge-custom" style="background: #dbeafe; color: #1e3a8a;">
                            <i class="fas fa-user"></i> u/${item.reddit_username || item.posted_by || 'Unknown'}
                        </span>
                        ${item.brand_mentioned ? '<span class="badge-custom" style="background: #dbeafe; color: #1e40af;">Brand Mentioned</span>' : ''}
                        ${item.product_mentioned ? '<span class="badge-custom" style="background: #d1fae5; color: #065f46;">Product: ' + item.product_mentioned + '</span>' : ''}
                    </div>
                    <small class="text-muted">${new Date(item.delivery_time).toLocaleString()}</small>
                </div>
                <p style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; font-size: 14px; line-height: 1.6;">
                    ${item.content_text}
                </p>
                <div style="display: flex; gap: 15px; font-size: 13px; color: #718096;">
                    <span><i class="fas fa-font"></i> ${item.word_count || 0} words</span>
                    <span><i class="fas fa-brain"></i> ${item.generation_model || 'N/A'}</span>
                    ${item.delivery_batch ? `<span><i class="fas fa-calendar"></i> ${item.delivery_batch}</span>` : ''}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading content history:', error);
        document.getElementById('contentHistoryList').innerHTML = '<p class="text-center text-danger">Failed to load content history</p>';
    }
}

// Document Upload Handlers
document.addEventListener('DOMContentLoaded', function() {
    const uploadZone = document.getElementById('documentUploadZone');
    const fileInput = document.getElementById('documentInput');
    
    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            await uploadDocuments(files);
        });
        
        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#667eea';
            uploadZone.style.background = '#f0f4ff';
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = '#e2e8f0';
            uploadZone.style.background = 'white';
        });
        
        uploadZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#e2e8f0';
            uploadZone.style.background = 'white';
            
            const files = Array.from(e.dataTransfer.files);
            await uploadDocuments(files);
        });
    }
});

// Upload Documents Function - IMPROVED with better progress tracking
async function uploadDocuments(files) {
    const progressDiv = document.getElementById('uploadProgress');
    const progressBar = progressDiv.querySelector('.progress-bar');
    const statusText = document.getElementById('uploadStatus');
    
    progressDiv.style.display = 'block';
    progressBar.style.width = '10%';
    statusText.textContent = `Uploading ${files.length} file(s)...`;
    statusText.style.color = '#667eea';
    
    try {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        progressBar.style.width = '30%';
        statusText.textContent = 'Processing files...';
        
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}/documents/upload`, {
            method: 'POST',
            body: formData
        });
        
        progressBar.style.width = '70%';
        statusText.textContent = 'Generating embeddings...';
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }
        
        const result = await response.json();
        
        progressBar.style.width = '100%';
        statusText.textContent = `✅ Upload complete! ${result.successful} file(s) uploaded, ${result.failed || 0} failed.`;
        statusText.style.color = '#10b981';
        
        // Reload documents list
        setTimeout(() => {
            progressDiv.style.display = 'none';
            loadDocumentsList();
        }, 3000);
        
    } catch (error) {
        console.error('Error uploading documents:', error);
        progressBar.style.width = '100%';
        progressBar.style.background = '#ef4444';
        statusText.textContent = '❌ Upload failed: ' + error.message;
        statusText.style.color = '#ef4444';
    }
}

// Load Documents List
async function loadDocumentsList() {
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}/documents`);
        if (!response.ok) throw new Error('Failed to load documents');
        
        const documents = await response.json();
        const container = document.getElementById('documentsList');
        
        if (!documents || documents.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No documents uploaded yet</p>';
            return;
        }
        
        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Embeddings</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${documents.map(doc => `
                        <tr>
                            <td><i class="fas fa-file"></i> ${doc.filename}</td>
                            <td><span class="badge-custom badge-primary">${doc.file_type}</span></td>
                            <td>${(doc.file_size / 1024 / 1024).toFixed(2)} MB</td>
                            <td><span class="badge-custom" style="background: #d1fae5; color: #065f46;">
                                ${doc.embedding_count || 0} vectors
                            </span></td>
                            <td>${new Date(doc.uploaded_at).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteDocument('${doc.id}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
    } catch (error) {
        console.error('Error loading documents:', error);
        document.getElementById('documentsList').innerHTML = '<p class="text-center text-danger">Failed to load documents</p>';
    }
}

// Delete Document
async function deleteDocument(documentId) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}/documents/${documentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete document');
        
        alert('✅ Document deleted successfully');
        loadDocumentsList();
        
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('❌ Failed to delete document. Please try again.');
    }
}

// Load Special Instructions
async function loadSpecialInstructions() {
    try {
        const response = await fetch(`${API_URL}/api/client-settings/${CLIENT_ID}`);
        if (!response.ok) throw new Error('Failed to load settings');
        
        const data = await response.json();
        document.getElementById('specialInstructions').value = data.explicit_instructions || '';
        
        // Load notification settings from client data
        if (clientData) {
            document.getElementById('notificationEmail').value = clientData.notification_email || '';
            document.getElementById('slackWebhook').value = clientData.slack_webhook_url || '';
        }
        
    } catch (error) {
        console.error('Error loading special instructions:', error);
    }
}

// Save Special Instructions - FIXED with correct payload
async function saveSpecialInstructions() {
    const instructions = document.getElementById('specialInstructions').value;
    
    try {
        // Get current settings first
        const getResponse = await fetch(`${API_URL}/api/client-settings/${CLIENT_ID}`);
        const currentSettings = await getResponse.json();
        
        // Update with new instructions
        const response = await fetch(`${API_URL}/api/client-settings/${CLIENT_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reply_percentage: currentSettings.reply_percentage || 75,
                post_percentage: currentSettings.post_percentage || 25,
                brand_mention_percentage: currentSettings.brand_mention_percentage || 0,
                product_mention_percentage: currentSettings.product_mention_percentage || 0,
                product_relevance_threshold: currentSettings.product_relevance_threshold || 0.75,
                current_phase: currentSettings.current_phase || 1,
                explicit_instructions: instructions,
                auto_phase_progression: currentSettings.auto_phase_progression || false
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to save');
        }
        
        alert('✅ Special instructions saved successfully!');
        
    } catch (error) {
        console.error('Error saving special instructions:', error);
        alert('❌ Failed to save special instructions: ' + error.message);
    }
}

// Save Notification Settings - FIXED
async function saveNotificationSettings() {
    const email = document.getElementById('notificationEmail').value;
    const webhook = document.getElementById('slackWebhook').value;
    
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notification_email: email,
                slack_webhook_url: webhook
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to save');
        }
        
        alert('✅ Notification settings saved successfully!');
        
    } catch (error) {
        console.error('Error saving notification settings:', error);
        alert('❌ Failed to save notification settings: ' + error.message);
    }
}

// Filter auto-responses by date
function filterAutoResponses() {
    loadAutoResponsesLog();
}

// Tab activation handlers
document.addEventListener('shown.bs.tab', function (e) {
    const targetTab = e.target.getAttribute('data-bs-target');
    
    if (targetTab === '#analytics') {
        loadAnalytics();
    } else if (targetTab === '#content') {
        loadContentHistory();
    } else if (targetTab === '#documents') {
        loadDocumentsList();
    } else if (targetTab === '#settings') {
        loadSpecialInstructions();
    }
});

// Export functions to global scope
window.loadAnalytics = loadAnalytics;
window.loadActivityFeed = loadActivityFeed;
window.loadContentHistory = loadContentHistory;
window.loadDocumentsList = loadDocumentsList;
window.uploadDocuments = uploadDocuments;
window.deleteDocument = deleteDocument;
window.saveSpecialInstructions = saveSpecialInstructions;
window.saveNotificationSettings = saveNotificationSettings;
window.loadAutoResponsesLog = loadAutoResponsesLog;
window.loadNegativeMentions = loadNegativeMentions;
window.deleteAutoResponse = deleteAutoResponse;
window.filterAutoResponses = filterAutoResponses;
