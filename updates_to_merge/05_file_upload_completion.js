/**
 * File Upload Feature - Complete Implementation
 * Allows clients to upload additional documents after onboarding
 */

// Replace the placeholder uploadMoreDocuments() function with this complete version

async function uploadMoreDocuments() {
    // Create file input dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.pdf,.doc,.docx,.txt,.md';
    
    fileInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) {
            return;
        }
        
        // Show upload modal
        showUploadModal(files);
    };
    
    fileInput.click();
}

function showUploadModal(files) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'upload-modal';
    
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="p-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">📤 Upload Additional Documents</h3>
                
                <div class="mb-6">
                    <p class="text-sm text-gray-600 mb-4">
                        These documents will be added to your knowledge base and used to enhance content generation.
                    </p>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            <div class="text-sm text-blue-900">
                                <strong>What to upload:</strong> Product guides, blog posts, brand voice samples, FAQs, research papers, or any content that represents your expertise.
                            </div>
                        </div>
                    </div>
                    
                    <!-- File list -->
                    <div class="space-y-2 mb-6">
                        <div class="text-sm font-medium text-gray-700 mb-2">Files to upload (${files.length}):</div>
                        ${files.map((file, idx) => `
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-file-idx="${idx}">
                                <div class="flex items-center flex-1">
                                    <svg class="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                                    </svg>
                                    <div>
                                        <div class="text-sm font-medium text-gray-900">${file.name}</div>
                                        <div class="text-xs text-gray-500">${formatFileSize(file.size)}</div>
                                    </div>
                                </div>
                                <button onclick="removeFileFromUpload(${idx})" class="text-red-500 hover:text-red-700">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                    </svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Upload progress -->
                    <div id="upload-progress-container" class="hidden mb-6">
                        <div class="text-sm font-medium text-gray-700 mb-2">Uploading...</div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div id="upload-progress-bar" class="bg-blue-600 h-2.5 rounded-full transition-all" style="width: 0%"></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-2 text-center" id="upload-status-text">
                            Preparing upload...
                        </div>
                    </div>
                    
                    <!-- Success message -->
                    <div id="upload-success" class="hidden bg-green-50 border border-green-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                            </svg>
                            <div>
                                <div class="font-medium text-green-900">Upload Successful!</div>
                                <div class="text-sm text-green-700 mt-1" id="upload-stats"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Error message -->
                    <div id="upload-error" class="hidden bg-red-50 border border-red-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                            </svg>
                            <div>
                                <div class="font-medium text-red-900">Upload Failed</div>
                                <div class="text-sm text-red-700 mt-1" id="upload-error-text"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Action buttons -->
                <div class="flex justify-end gap-3">
                    <button onclick="closeUploadModal()" id="cancel-btn" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onclick="startUpload()" id="upload-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Upload Documents
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store files for upload
    window.pendingUploadFiles = files;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function removeFileFromUpload(fileIdx) {
    window.pendingUploadFiles = window.pendingUploadFiles.filter((_, idx) => idx !== fileIdx);
    
    // Remove from UI
    document.querySelector(`[data-file-idx="${fileIdx}"]`)?.remove();
    
    // If no files left, close modal
    if (window.pendingUploadFiles.length === 0) {
        closeUploadModal();
    }
}

function closeUploadModal() {
    document.getElementById('upload-modal')?.remove();
    window.pendingUploadFiles = null;
}

async function startUpload() {
    const files = window.pendingUploadFiles;
    
    if (!files || files.length === 0) {
        return;
    }
    
    // Get current client ID (should be set when user logs in)
    const clientId = currentClientId || 'test-client-id'; // Replace with actual client ID
    
    // Show progress UI
    document.getElementById('upload-progress-container').classList.remove('hidden');
    document.getElementById('upload-btn').disabled = true;
    document.getElementById('cancel-btn').disabled = true;
    document.getElementById('upload-success').classList.add('hidden');
    document.getElementById('upload-error').classList.add('hidden');
    
    try {
        // Create FormData
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        
        // Upload with progress tracking
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                document.getElementById('upload-progress-bar').style.width = percentComplete + '%';
                document.getElementById('upload-status-text').textContent = 
                    `Uploading... ${Math.round(percentComplete)}%`;
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                
                // Show success
                document.getElementById('upload-progress-container').classList.add('hidden');
                document.getElementById('upload-success').classList.remove('hidden');
                document.getElementById('upload-stats').textContent = 
                    `${response.files_processed} files processed, ${response.chunks_created} content chunks indexed, ${response.total_characters} characters analyzed`;
                
                // Update knowledge base stats in Strategy tab
                loadKnowledgeBaseStats();
                
                // Change buttons
                document.getElementById('upload-btn').classList.add('hidden');
                document.getElementById('cancel-btn').textContent = 'Close';
                document.getElementById('cancel-btn').disabled = false;
                
            } else {
                throw new Error(xhr.responseText || 'Upload failed');
            }
        });
        
        xhr.addEventListener('error', () => {
            showUploadError('Network error. Please check your connection and try again.');
        });
        
        xhr.open('POST', `/api/client-settings/${clientId}/upload-documents`);
        xhr.send(formData);
        
    } catch (error) {
        showUploadError(error.message);
    }
}

function showUploadError(message) {
    document.getElementById('upload-progress-container').classList.add('hidden');
    document.getElementById('upload-error').classList.remove('hidden');
    document.getElementById('upload-error-text').textContent = message;
    document.getElementById('upload-btn').disabled = false;
    document.getElementById('cancel-btn').disabled = false;
}

// Add upload endpoint to backend API (in client_settings_router.py)
/*
@router.post("/{client_id}/upload-documents")
async def upload_additional_documents(
    client_id: str = Path(..., description="Client UUID"),
    files: List[UploadFile] = File(...)
):
    """
    Upload additional documents to client knowledge base
    
    Processes files, extracts text, generates embeddings,
    and adds to existing knowledge base
    """
    
    try:
        from services.document_ingestion_service import process_uploaded_documents
        
        # Process files using existing ingestion service
        stats = await process_uploaded_documents(client_id, files)
        
        return {
            'success': True,
            'files_processed': stats['files_processed'],
            'chunks_created': stats['chunks_created'],
            'total_characters': stats['total_characters'],
            'message': 'Documents processed successfully'
        }
        
    except Exception as e:
        logger.error(f"Failed to upload documents for {client_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
*/
