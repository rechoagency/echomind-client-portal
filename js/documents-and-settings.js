// Documents Tab Functions
async function loadKnowledgeBaseStats() {
    console.log('[DEBUG] loadKnowledgeBaseStats called');
    
    try {
        const response = await fetch(`${API_URL}/api/reports/${CLIENT_ID}/knowledge-base-stats`);
        console.log('[DEBUG] Knowledge base stats response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load knowledge base stats: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[DEBUG] Knowledge base stats:', data);
        
        // Update stat cards
        document.getElementById('knowledgeDocsCount').textContent = data.knowledge_base.documents_uploaded || 0;
        document.getElementById('knowledgeChunksCount').textContent = data.knowledge_base.knowledge_chunks || 0;
        document.getElementById('knowledgeInsightsUsed').textContent = data.usage_last_7_days.total_insights_cited || 0;
        document.getElementById('knowledgeUsageRate').textContent = `${data.usage_last_7_days.usage_rate_percentage || 0}%`;
        
    } catch (error) {
        console.error('Error loading knowledge base stats:', error);
        // Set to 0 on error
        document.getElementById('knowledgeDocsCount').textContent = '0';
        document.getElementById('knowledgeChunksCount').textContent = '0';
        document.getElementById('knowledgeInsightsUsed').textContent = '0';
        document.getElementById('knowledgeUsageRate').textContent = '0%';
    }
}

async function loadDocuments() {
    console.log('[DEBUG] loadDocuments called');
    console.log('[DEBUG] API_URL:', typeof API_URL !== 'undefined' ? API_URL : 'UNDEFINED');
    console.log('[DEBUG] CLIENT_ID:', typeof CLIENT_ID !== 'undefined' ? CLIENT_ID : 'UNDEFINED');
    
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}/documents`);
        console.log('[DEBUG] Documents response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load documents: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const documents = data.documents || [];
        
        if (documents.length === 0) {
            document.getElementById('documentsList').innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-folder-open" style="font-size: 48px; color: #e2e8f0;"></i>
                    <p class="mt-3">No documents uploaded yet</p>
                    <small>Upload brand guidelines, FAQs, product feeds above to get started</small>
                </div>
            `;
            return;
        }
        
        const html = documents.map(doc => {
            const sizeKB = Math.round(doc.file_size_bytes / 1024);
            const sizeMB = (doc.file_size_bytes / (1024 * 1024)).toFixed(2);
            const displaySize = sizeKB > 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
            const uploadDate = new Date(doc.created_at).toLocaleDateString();
            
            return `
                <div class="document-item" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="fas fa-file-pdf" style="font-size: 24px; color: #ef4444;"></i>
                            <div>
                                <strong>${doc.filename}</strong>
                                <div style="font-size: 12px; color: #666;">
                                    ${displaySize} • Uploaded ${uploadDate} • ${doc.chunks_created} chunks • ${doc.vectors_created} vectors
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <span class="badge bg-success">${doc.status}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('documentsList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading documents:', error);
        document.getElementById('documentsList').innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                Failed to load documents. Please refresh the page.
            </div>
        `;
    }
}

// Document Upload Handling
document.addEventListener('DOMContentLoaded', function() {
    const uploadZone = document.getElementById('documentUploadZone');
    const fileInput = document.getElementById('documentInput');
    
    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', async (e) => {
            const files = e.target.files;
            if (files.length === 0) return;
            
            await uploadDocuments(files);
        });
        
        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#667eea';
            uploadZone.style.background = '#f0f4ff';
        });
        
        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#e2e8f0';
            uploadZone.style.background = 'white';
        });
        
        uploadZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#e2e8f0';
            uploadZone.style.background = 'white';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                await uploadDocuments(files);
            }
        });
    }
    
    // Load documents when page loads
    loadDocuments();
    loadSpecialInstructions();
});

async function uploadDocuments(files) {
    const formData = new FormData();
    formData.append('client_id', CLIENT_ID);
    
    for (let file of files) {
        formData.append('files', file);
    }
    
    try {
        document.getElementById('uploadProgress').style.display = 'block';
        document.getElementById('uploadStatus').textContent = `Uploading ${files.length} file(s)...`;
        
        const response = await fetch(`${API_URL}/api/client-onboarding/upload-files`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`✅ Successfully uploaded ${result.successful} of ${result.total_files} files!`);
            loadDocuments(); // Reload document list
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('❌ Failed to upload documents. ' + error.message);
    } finally {
        document.getElementById('uploadProgress').style.display = 'none';
        document.getElementById('documentInput').value = ''; // Reset input
    }
}


// Special Instructions Functions
async function loadSpecialInstructions() {
    console.log('[DEBUG] loadSpecialInstructions called');
    console.log('[DEBUG] API_URL:', typeof API_URL !== 'undefined' ? API_URL : 'UNDEFINED');
    console.log('[DEBUG] CLIENT_ID:', typeof CLIENT_ID !== 'undefined' ? CLIENT_ID : 'UNDEFINED');
    
    const container = document.getElementById('specialInstructionsContainer');
    if (!container) {
        console.error('[ERROR] specialInstructionsContainer not found in DOM');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}/special-instructions`);
        console.log('[DEBUG] Special instructions response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to load special instructions: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[DEBUG] Special instructions data:', data);
        const instructions = data.instructions || [];
        
        displaySpecialInstructions(instructions);
        
    } catch (error) {
        console.error('[ERROR] Error loading special instructions:', error);
        // Show error in UI instead of spinner
        const container = document.getElementById('specialInstructionsContainer');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Failed to load special instructions: ${error.message}
                </div>
            `;
        }
    }
}

function displaySpecialInstructions(instructions) {
    const container = document.getElementById('specialInstructionsContainer');
    if (!container) return;
    
    if (instructions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-info-circle" style="font-size: 36px;"></i>
                <p class="mt-3">No special instructions added yet</p>
                <small>Add custom instructions below to guide content generation</small>
            </div>
        `;
        return;
    }
    
    const html = instructions.map((instruction, index) => `
        <div class="instruction-block" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1; font-family: 'Courier New', monospace; font-size: 14px; white-space: pre-wrap;">${instruction}</div>
                <button class="btn btn-sm btn-danger ms-3" onclick="deleteSpecialInstruction(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

async function addSpecialInstruction() {
    const textarea = document.getElementById('newSpecialInstruction');
    const instruction = textarea.value.trim();
    
    if (!instruction) {
        alert('Please enter an instruction');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}/special-instructions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instruction })
        });
        
        if (response.ok) {
            const data = await response.json();
            displaySpecialInstructions(data.instructions);
            textarea.value = ''; // Clear textarea
            alert('✅ Special instruction added!');
        } else {
            throw new Error('Failed to add instruction');
        }
    } catch (error) {
        console.error('Error adding special instruction:', error);
        alert('❌ Failed to add instruction. ' + error.message);
    }
}

async function deleteSpecialInstruction(index) {
    if (!confirm('Delete this special instruction?')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}/special-instructions/${index}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const data = await response.json();
            displaySpecialInstructions(data.instructions);
            alert('✅ Special instruction deleted!');
        } else {
            throw new Error('Failed to delete instruction');
        }
    } catch (error) {
        console.error('Error deleting special instruction:', error);
        alert('❌ Failed to delete instruction. ' + error.message);
    }
}

async function saveNotificationSettings() {
    const email = document.getElementById('notificationEmail').value;
    const slack = document.getElementById('slackWebhook').value;
    
    try {
        const response = await fetch(`${API_URL}/api/clients/${CLIENT_ID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                notification_email: email,
                slack_webhook_url: slack
            })
        });
        
        if (response.ok) {
            alert('✅ Notification settings saved!');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving notification settings:', error);
        alert('❌ Failed to save settings. ' + error.message);
    }
}

// Load knowledge base stats when Documents tab is shown
document.addEventListener('DOMContentLoaded', function() {
    // Listen for Documents tab activation
    const documentsTab = document.querySelector('[data-bs-target="#documents"]');
    if (documentsTab) {
        documentsTab.addEventListener('shown.bs.tab', function() {
            console.log('[DEBUG] Documents tab shown - loading knowledge base stats');
            loadKnowledgeBaseStats();
        });
    }
});
