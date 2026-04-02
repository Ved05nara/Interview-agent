// ============================================
// CONFIGURATION
// ============================================

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/Interview-agent";
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// DOM Elements
const roleInput = document.getElementById('roleInput');
const resumeUpload = document.getElementById('resumeUpload');
const practiceModeSelect = document.getElementById('practiceMode');
const generateBtn = document.getElementById('generateBtn');
const resultsPanel = document.getElementById('resultsPanel');
const resultsSection = document.getElementById('resultsSection');
const fileNameDisplay = document.getElementById('fileName');
const fileInfo = document.getElementById('fileInfo');
const removeFileBtn = document.getElementById('removeFile');
const copyResultsBtn = document.getElementById('copyResultsBtn');
const modeOptions = document.querySelectorAll('.mode-option');
const uploadArea = document.getElementById('uploadArea');
const connectionStatus = document.getElementById('connectionStatus');

let selectedFile = null;

// ============================================
// Mode Selector
// ============================================

modeOptions.forEach((option) => {
    option.addEventListener('click', () => {
        const mode = option.dataset.mode;
        
        if (practiceModeSelect) {
            practiceModeSelect.value = mode;
        }
        
        modeOptions.forEach((opt) => opt.classList.remove('active'));
        option.classList.add('active');
        
        console.log('Mode selected:', mode);
    });
});

const setDefaultMode = () => {
    const defaultMode = "General Interview Questions";
    if (practiceModeSelect) {
        practiceModeSelect.value = defaultMode;
    }
    modeOptions.forEach((option) => {
        if (option.dataset.mode === defaultMode) {
            option.classList.add('active');
        }
    });
};
setDefaultMode();

// ============================================
// File Upload Handling
// ============================================

if (uploadArea) {
    uploadArea.addEventListener('click', (e) => {
        if (e.target === removeFileBtn || removeFileBtn?.contains(e.target)) {
            return;
        }
        if (resumeUpload) resumeUpload.click();
    });
}

if (resumeUpload) {
    resumeUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!validateFile(file)) {
                resumeUpload.value = '';
                return;
            }
            
            selectedFile = file;
            if (fileNameDisplay) fileNameDisplay.textContent = file.name;
            if (fileInfo) fileInfo.style.display = 'flex';
            
            const uploadContent = uploadArea?.querySelector('.upload-content');
            if (uploadContent) {
                uploadContent.style.display = 'none';
            }
        }
    });
}

if (removeFileBtn) {
    removeFileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearFileSelection();
    });
}

// Drag and drop support
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#6366f1';
        uploadArea.style.background = 'rgba(99, 102, 241, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        uploadArea.style.background = 'rgba(39, 39, 42, 0.4)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        uploadArea.style.background = 'rgba(39, 39, 42, 0.4)';
        
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            selectedFile = file;
            if (resumeUpload) resumeUpload.files = e.dataTransfer.files;
            if (fileNameDisplay) fileNameDisplay.textContent = file.name;
            if (fileInfo) fileInfo.style.display = 'flex';
            
            const uploadContent = uploadArea?.querySelector('.upload-content');
            if (uploadContent) {
                uploadContent.style.display = 'none';
            }
        }
    });
}

// ============================================
// Helper Functions
// ============================================

const validateFile = (file) => {
    const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024;
    
    if (file.size > maxSize) {
        showError(`File too large. Maximum ${MAX_FILE_SIZE_MB}MB`);
        return false;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        showError('Only PDF or DOCX files are allowed');
        return false;
    }
    
    return true;
};

const clearFileSelection = () => {
    selectedFile = null;
    if (resumeUpload) resumeUpload.value = '';
    if (fileNameDisplay) fileNameDisplay.textContent = '';
    if (fileInfo) fileInfo.style.display = 'none';
    
    const uploadContent = uploadArea?.querySelector('.upload-content');
    if (uploadContent) {
        uploadContent.style.display = 'block';
    }
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const showLoading = () => {
    if (resultsSection) resultsSection.style.display = 'block';
    if (resultsPanel) {
        resultsPanel.innerHTML = `
            <div class="loading-state">
                <div class="loader"></div>
                <div class="loading-text">🧠 Generating interview questions...</div>
                <p style="font-size:0.8rem; color:#71717a; margin-top: 0.5rem;">
                    Connected to AI service
                </p>
            </div>
        `;
    }
    if (resultsPanel) resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

const showError = (message) => {
    if (resultsSection) resultsSection.style.display = 'block';
    if (resultsPanel) {
        resultsPanel.innerHTML = `
            <div class="error-message" style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 1rem; border-radius: 0.75rem;">
                <strong>⚠️ Error:</strong> ${escapeHtml(message)}
            </div>
        `;
    }
};

const escapeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const formatAIResponse = (aiText, selectedMode) => {
    if (!aiText || aiText.trim() === '') {
        return `<div class="result-card">
            <h3>📭 No Response</h3>
            <div class="result-content">No content received. Please try again.</div>
        </div>`;
    }
    
    let formattedText = aiText
        .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>`;
        })
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/### (.*?)(?:\n|$)/g, '<h4 style="margin: 1rem 0 0.5rem 0; color: #a5b4fc;">$1</h4>')
        .replace(/## (.*?)(?:\n|$)/g, '<h3 style="margin: 1rem 0 0.75rem 0; color: #c084fc;">$1</h3>')
        .replace(/\n/g, '<br>');
    
    // Format bullet points
    formattedText = formattedText.replace(/^[\*\-]\s(.*?)(?=<br>|$)/gm, '<li>• $1</li>');
    if (formattedText.includes('<li>')) {
        formattedText = `<ul style="margin: 0.5rem 0;">${formattedText}</ul>`.replace(/<\/li><br>/g, '</li>');
    }
    
    return `
        <div class="result-card">
            <h3>✨ ${escapeHtml(selectedMode)}</h3>
            <div class="result-content">${formattedText}</div>
        </div>
    `;
};

// ============================================
// Generate Interview Questions
// ============================================

const generateInterviewContent = async () => {
    const role = roleInput?.value.trim();
    const mode = practiceModeSelect?.value;
    
    console.log('Generating questions for:', { role, mode });
    
    if (!role) {
        showError('Please enter a job role or topic (e.g., "React Developer")');
        return;
    }
    
    showLoading();
    
    try {
        let resumeBase64 = null;
        let resumeFilename = null;
        let resumeMimeType = null;
        
        if (selectedFile) {
            resumeBase64 = await fileToBase64(selectedFile);
            resumeFilename = selectedFile.name;
            resumeMimeType = selectedFile.type;
        }
        
        const payload = {
            role: role,
            mode: mode,
            timestamp: new Date().toISOString(),
            resume: resumeBase64 ? {
                filename: resumeFilename,
                mimeType: resumeMimeType,
                contentBase64: resumeBase64
            } : null,
            instructions: `Generate interview preparation content for role: ${role}. Mode: ${mode}. ${resumeBase64 ? 'Analyze provided resume for personalized questions.' : 'Generate general questions based on role.'} Format the output clearly with sections, bullet points, and code blocks if relevant.`
        };
        
        console.log('Sending request to n8n webhook...');
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Response received');
        
        // Extract AI-generated text from response
        let aiGeneratedText = extractAIText(responseData);
        
        if (!aiGeneratedText || aiGeneratedText.trim() === '') {
            throw new Error('AI returned empty content');
        }
        
        const formattedResults = formatAIResponse(aiGeneratedText, mode);
        if (resultsPanel) resultsPanel.innerHTML = formattedResults;
        
    } catch (error) {
        console.error('Generation Error:', error);
        showError(`${error.message}. Make sure n8n is running at ${N8N_WEBHOOK_URL}`);
    }
};

const extractAIText = (responseData) => {
    if (typeof responseData === 'string') return responseData;
    if (responseData.output) return responseData.output;
    if (responseData.result) return responseData.result;
    if (responseData.text) return responseData.text;
    if (responseData.content) return responseData.content;
    if (responseData.choices && responseData.choices[0]?.message?.content) {
        return responseData.choices[0].message.content;
    }
    return JSON.stringify(responseData, null, 2);
};

// ============================================
// Copy Results
// ============================================

if (copyResultsBtn) {
    copyResultsBtn.addEventListener('click', async () => {
        const content = resultsPanel?.innerText.trim();
        
        if (!content || content.includes('generating interview questions')) {
            showError('No content to copy. Generate questions first.');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(content);
            const originalHTML = copyResultsBtn.innerHTML;
            copyResultsBtn.innerHTML = '✓ Copied!';
            setTimeout(() => {
                copyResultsBtn.innerHTML = originalHTML;
            }, 1500);
        } catch (err) {
            showError('Failed to copy to clipboard');
        }
    });
}

// ============================================
// Event Listeners
// ============================================

if (generateBtn) {
    generateBtn.addEventListener('click', generateInterviewContent);
}

if (roleInput) {
    roleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateInterviewContent();
        }
    });
}

// ============================================
// Initialization
// ============================================

console.log('✅ AI Interview Coach initialized');
console.log(`📡 Connected to: ${N8N_WEBHOOK_URL}`);

if (connectionStatus) {
    connectionStatus.textContent = '🟢 API Ready';
    connectionStatus.style.background = 'rgba(99, 102, 241, 0.2)';
    connectionStatus.style.color = '#818cf8';
}