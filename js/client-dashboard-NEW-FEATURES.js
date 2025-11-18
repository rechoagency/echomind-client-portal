// ============================================
// NEW FEATURES - Analytics, Content History, Documents, Settings
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
        
        // Load activity feed
        loadActivityFeed();
        
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

// Load Content Delivery History
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
                        <span class="badge-custom" style="background: #fef3c7; color: #92400e;">r/${item.subreddit}</span>
                        ${item.brand_mentioned ? '<span class="badge-custom" style="background: #dbeafe; color: #1e40af;">Brand Mentioned</span>' : ''}
                        ${item.product_mentioned ? '<span class="badge-custom" style="background: #d1fae5; color: #065f46;">Product: ' + item.product_mentioned + '</span>' : ''}
                    </div>
                    <small class="text-muted">${new Date(item.delivery_time).toLocaleString()}</small>
                </div>
                <p style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; font-size: 14px; line-height: 1.6;">
                    ${item.content_text}
                </p>
                <div style="display: flex; gap: 15px; font-size: 13px; color: #718096;">
                    <span><i class="fas fa-font"></i> ${item.word_count} words</span>
                    <span><i class="fas fa-brain"></i> ${item.generation_model}</span>
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

// Upload Documents Function
async function uploadDocuments(files) {
    const progressDiv = document.getElementById('uploadProgress');
    const progressBar = progressDiv.querySelector('.progress-bar');
    const statusText = document.getElementById('uploadStatus');
    
    progressDiv.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = `Uploading ${files.length} file(s)...`;
    
    try {
        const formData = new FormData();
        formData.append('client_id', CLIENT_ID);
        files.forEach(file => formData.append('files', file));
        
        const response = await fetch(`${API_URL}/api/client-onboarding/upload-files`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        progressBar.style.width = '100%';
        statusText.textContent = 'Upload complete!';
        statusText.style.color = '#10b981';
        
        // Reload documents list
        setTimeout(() => {
            progressDiv.style.display = 'none';
            loadDocumentsList();
        }, 2000);
        
    } catch (error) {
        console.error('Error uploading documents:', error);
        statusText.textContent = 'Upload failed. Please try again.';
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
        
        alert('Document deleted successfully');
        loadDocumentsList();
        
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
    }
}

// Load Special Instructions
async function loadSpecialInstructions() {
    try {
        const response = await fetch(`${API_URL}/api/client-settings/${CLIENT_ID}`);
        if (!response.ok) throw new Error('Failed to load settings');
        
        const data = await response.json();
        document.getElementById('specialInstructions').value = data.explicit_instructions || '';
        document.getElementById('notificationEmail').value = clientData?.notification_email || '';
        document.getElementById('slackWebhook').value = clientData?.slack_webhook_url || '';
        
    } catch (error) {
        console.error('Error loading special instructions:', error);
    }
}

// Save Special Instructions
async function saveSpecialInstructions() {
    const instructions = document.getElementById('specialInstructions').value;
    
    try {
        const response = await fetch(`${API_URL}/api/client-settings/${CLIENT_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ explicit_instructions: instructions })
        });
        
        if (!response.ok) throw new Error('Failed to save special instructions');
        
        alert('✅ Special instructions saved successfully!');
        
    } catch (error) {
        console.error('Error saving special instructions:', error);
        alert('❌ Failed to save special instructions. Please try again.');
    }
}

// Save Notification Settings
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
        
        if (!response.ok) throw new Error('Failed to save notification settings');
        
        alert('✅ Notification settings saved successfully!');
        
    } catch (error) {
        console.error('Error saving notification settings:', error);
        alert('❌ Failed to save notification settings. Please try again.');
    }
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
window.uploadDocuments = uploadDocuments;
window.loadDocumentsList = loadDocumentsList;
window.deleteDocument = deleteDocument;
window.loadSpecialInstructions = loadSpecialInstructions;
window.saveSpecialInstructions = saveSpecialInstructions;
window.saveNotificationSettings = saveNotificationSettings;
