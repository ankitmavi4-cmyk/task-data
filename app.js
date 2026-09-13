// Client Application Status Portal Script
document.addEventListener('DOMContentLoaded', () => {
    let allApplications = [];
    let currentFilter = {
        search: '',
        service: 'ALL',
        status: 'ALL'
    };

    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const serviceFilters = document.getElementById('serviceFilters');
    const statusFilter = document.getElementById('statusFilter');
    const applicationsGrid = document.getElementById('applicationsGrid');
    const loadingSkeleton = document.getElementById('loadingSkeleton');
    const emptyState = document.getElementById('emptyState');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const resultsCount = document.getElementById('resultsCount');
    const lastSyncTime = document.getElementById('lastSyncTime');

    // Stats Elements
    const statTotal = document.getElementById('statTotal');
    const statInProgress = document.getElementById('statInProgress');
    const statReview = document.getElementById('statReview');
    const statCompleted = document.getElementById('statCompleted');

    // Modal Elements
    const detailModal = document.getElementById('detailModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModalFooterBtn = document.getElementById('closeModalFooterBtn');
    const modalClientName = document.getElementById('modalClientName');
    const modalAppId = document.getElementById('modalAppId');
    const modalServiceTag = document.getElementById('modalServiceTag');
    const modalPhone = document.getElementById('modalPhone');
    const modalEmail = document.getElementById('modalEmail');
    const modalCreatedDate = document.getElementById('modalCreatedDate');
    const modalTargetDate = document.getElementById('modalTargetDate');
    const modalStatusBanner = document.getElementById('modalStatusBanner');
    const modalStatusTitle = document.getElementById('modalStatusTitle');
    const modalStatusIcon = document.getElementById('modalStatusIcon');
    const modalCurrentStageText = document.getElementById('modalCurrentStageText');
    const modalProgressText = document.getElementById('modalProgressText');
    const modalStepperTimeline = document.getElementById('modalStepperTimeline');
    const modalDeliverablesContent = document.getElementById('modalDeliverablesContent');
    const modalDeliverablesBox = document.getElementById('modalDeliverablesBox');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const copyLinkText = document.getElementById('copyLinkText');

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('status_portal_theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.querySelector('.theme-icon').textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('status_portal_theme', 'dark');
            themeToggle.querySelector('.theme-icon').textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('status_portal_theme', 'light');
            themeToggle.querySelector('.theme-icon').textContent = '☀️';
        }
    });

    // Load Database
    async function loadApplicationsData() {
        try {
            const res = await fetch('tasks_status_db.json?t=' + Date.now());
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            allApplications = Array.isArray(data) ? data : [];
        } catch (err) {
            console.warn('Could not fetch tasks_status_db.json via HTTP (likely local file:// protocol), attempting inline fallback...', err);
            // Fallback sample data if opened locally via file:// without web server
            allApplications = [
                {
                    "id": "1789066445",
                    "clientName": "JSR FITNESS GYM",
                    "maskedPhone": "XXXXXX6901",
                    "phoneLast4": "6901",
                    "maskedEmail": "an********4@gmail.com",
                    "serviceType": "GST",
                    "reference": "DIRECT",
                    "staffAssigned": "ANKIT",
                    "createdDate": "2026-09-10",
                    "targetDate": "2026-09-25",
                    "status": "In Progress",
                    "completed": false,
                    "currentStage": "1. Documents Intake & Verification",
                    "currentStageIndex": 0,
                    "progress": 20,
                    "totalStages": 5,
                    "stages": [
                        "1. Documents Intake & Verification",
                        "2. TRN Generated & Part-B Drafted",
                        "3. Aadhaar OTP Authentication Done",
                        "4. ARN Generated / Officer Review",
                        "5. Approved (REG-06 Issued)"
                    ],
                    "paymentStatus": "PENDING",
                    "deliverables": {},
                    "lastUpdated": "Live"
                },
                {
                    "id": "1789065400",
                    "clientName": "MUNSHIRAM EDUCATION SOCIETY",
                    "maskedPhone": "XXXXXX3877",
                    "phoneLast4": "3877",
                    "maskedEmail": "vi****************7@gmail.com",
                    "serviceType": "PAN",
                    "reference": "VIKRANT SINGH",
                    "staffAssigned": "ANKIT",
                    "createdDate": "2026-09-10",
                    "targetDate": "2026-09-11",
                    "status": "Department Review",
                    "completed": false,
                    "currentStage": "3. NSDL/UTIITSL Ack Generated",
                    "currentStageIndex": 2,
                    "progress": 60,
                    "totalStages": 5,
                    "stages": [
                        "1. KYC Documents Received",
                        "2. Form 49A Filed Online",
                        "3. NSDL/UTIITSL Ack Generated",
                        "4. Income Tax Scrutiny Done",
                        "5. e-PAN Delivered & Dispatched"
                    ],
                    "paymentStatus": "PENDING",
                    "deliverables": {},
                    "lastUpdated": "Live"
                }
            ];
        }

        if (loadingSkeleton) loadingSkeleton.style.display = 'none';
        updateStats();
        renderApplications();
        checkUrlHashForDirectView();
    }

    // Calculate Statistics
    function updateStats() {
        const total = allApplications.length;
        const inProgress = allApplications.filter(a => a.status === 'In Progress' || a.status === 'Filing Initiated').length;
        const review = allApplications.filter(a => a.status === 'Department Review').length;
        const completed = allApplications.filter(a => a.completed || a.status === 'Completed').length;

        statTotal.textContent = total;
        statInProgress.textContent = inProgress;
        statReview.textContent = review;
        statCompleted.textContent = completed;

        if (allApplications.length > 0 && allApplications[0].lastUpdated) {
            lastSyncTime.textContent = `Last Synced: ${allApplications[0].lastUpdated}`;
        }
    }

    // Filter Logic
    function getFilteredApplications() {
        return allApplications.filter(app => {
            // Service Filter
            if (currentFilter.service !== 'ALL') {
                const appSvc = (app.serviceType || '').toUpperCase();
                const filterSvc = currentFilter.service.toUpperCase();
                if (!appSvc.includes(filterSvc)) return false;
            }

            // Status Filter
            if (currentFilter.status !== 'ALL') {
                if (app.status !== currentFilter.status) return false;
            }

            // Search Filter (ID, Name, or Phone Last 4)
            if (currentFilter.search) {
                const q = currentFilter.search.toLowerCase().trim();
                const matchId = (app.id || '').toLowerCase().includes(q);
                const matchName = (app.clientName || '').toLowerCase().includes(q);
                const matchPhone4 = (app.phoneLast4 || '').includes(q);
                const matchMaskedPhone = (app.maskedPhone || '').toLowerCase().includes(q);

                if (!matchId && !matchName && !matchPhone4 && !matchMaskedPhone) {
                    return false;
                }
            }

            return true;
        });
    }

    // Helper for Service CSS class
    function getServiceClass(serviceType) {
        const s = (serviceType || '').toUpperCase();
        if (s.includes('GST')) return 'gst';
        if (s.includes('PAN')) return 'pan';
        if (s.includes('DSC')) return 'dsc';
        if (s.includes('EPF')) return 'epfo';
        if (s.includes('ESI')) return 'esic';
        if (s.includes('MCA') || s.includes('COMP') || s.includes('LLP')) return 'mca';
        return 'general';
    }

    // Render Application Cards
    function renderApplications() {
        const filtered = getFilteredApplications();
        resultsCount.textContent = `${filtered.length} Record${filtered.length === 1 ? '' : 's'}`;

        if (filtered.length === 0) {
            applicationsGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        applicationsGrid.innerHTML = filtered.map(app => {
            const svcClass = getServiceClass(app.serviceType);
            const isDone = app.completed || app.progress >= 100;
            const progressPct = app.progress || 0;

            return `
                <div class="app-card" data-id="${app.id}">
                    <div class="card-top">
                        <span class="app-id-tag">ID: #${app.id}</span>
                        <span class="service-pill ${svcClass}">${app.serviceType}</span>
                    </div>

                    <div class="client-name">${escapeHtml(app.clientName || 'Untitled Client')}</div>

                    <div class="masked-details">
                        <div class="masked-item">
                            <span class="masked-label">Verified Mobile:</span>
                            <span class="masked-val">${app.maskedPhone || 'XXXXXX----'}</span>
                        </div>
                        <div class="masked-item">
                            <span class="masked-label">Verified Email:</span>
                            <span class="masked-val">${app.maskedEmail || '---@---.com'}</span>
                        </div>
                    </div>

                    <div class="card-progress-section">
                        <div class="progress-header">
                            <span class="current-stage-name" title="${escapeHtml(app.currentStage || '')}">${escapeHtml(app.currentStage || 'Filing Received')}</span>
                            <span class="progress-pct">${progressPct}%</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill ${isDone ? 'complete' : ''}" style="width: ${progressPct}%"></div>
                        </div>
                    </div>

                    <div class="card-footer-info">
                        <span>Due: ${app.targetDate || 'In Review'}</span>
                        <button class="view-btn" onclick="window.viewApplicationDetails('${app.id}')">
                            <span>Track Milestones</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal View Function
    window.viewApplicationDetails = function(appId) {
        const app = allApplications.find(a => String(a.id) === String(appId));
        if (!app) return;

        modalAppId.textContent = app.id;
        modalClientName.textContent = app.clientName || 'Client Name';
        
        const svcClass = getServiceClass(app.serviceType);
        modalServiceTag.className = `service-pill ${svcClass}`;
        modalServiceTag.textContent = app.serviceType;

        modalPhone.textContent = app.maskedPhone || 'N/A';
        modalEmail.textContent = app.maskedEmail || 'N/A';
        modalCreatedDate.textContent = app.createdDate || 'N/A';
        modalTargetDate.textContent = app.targetDate || 'Under Processing';

        const isDone = app.completed || app.progress >= 100;
        modalProgressText.textContent = `${app.progress || 0}%`;
        modalCurrentStageText.textContent = app.currentStage || 'Application Processing';

        if (isDone) {
            modalStatusBanner.className = 'modal-status-banner complete';
            modalStatusTitle.textContent = 'Application Completed';
            modalStatusIcon.textContent = '✅';
        } else if (app.status === 'Department Review') {
            modalStatusBanner.className = 'modal-status-banner';
            modalStatusTitle.textContent = 'Department Review';
            modalStatusIcon.textContent = '🔍';
        } else {
            modalStatusBanner.className = 'modal-status-banner';
            modalStatusTitle.textContent = 'Filing In Progress';
            modalStatusIcon.textContent = '⏳';
        }

        // Render Stepper Timeline
        const stages = Array.isArray(app.stages) && app.stages.length > 0 ? app.stages : [app.currentStage || 'Filing in progress'];
        const currentIdx = typeof app.currentStageIndex === 'number' ? app.currentStageIndex : (isDone ? stages.length - 1 : 0);

        modalStepperTimeline.innerHTML = stages.map((stg, idx) => {
            let statusClass = 'pending';
            let badgeText = `Stage ${idx + 1}`;
            let iconOrNum = idx + 1;

            if (isDone || idx < currentIdx) {
                statusClass = 'completed';
                badgeText = 'Completed';
                iconOrNum = '✓';
            } else if (idx === currentIdx) {
                statusClass = 'active';
                badgeText = 'Current Stage';
                iconOrNum = '●';
            }

            return `
                <div class="step-item ${statusClass}">
                    <div class="step-indicator">${iconOrNum}</div>
                    <div class="step-content">
                        <div class="step-title">${escapeHtml(stg)}</div>
                        <span class="step-badge">${badgeText}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Deliverables
        const deliverables = app.deliverables || {};
        const delivKeys = Object.keys(deliverables);
        if (delivKeys.length > 0) {
            modalDeliverablesBox.style.display = 'block';
            modalDeliverablesContent.innerHTML = delivKeys.map(k => `
                <div class="deliv-row">
                    <span class="deliv-key">${escapeHtml(k)}:</span>
                    <span class="deliv-val">${escapeHtml(deliverables[k])}</span>
                </div>
            `).join('');
        } else {
            modalDeliverablesBox.style.display = 'block';
            modalDeliverablesContent.innerHTML = `
                <div class="deliv-row">
                    <span class="deliv-key">Filing Reference / ARN:</span>
                    <span class="deliv-val">${isDone ? 'Delivered to Registered Contact' : 'Will be updated upon department approval'}</span>
                </div>
            `;
        }

        // Setup Direct Copy Link
        copyLinkBtn.onclick = () => {
            const url = `${window.location.origin}${window.location.pathname}#id=${app.id}`;
            navigator.clipboard.writeText(url).then(() => {
                copyLinkText.textContent = 'Copied!';
                setTimeout(() => { copyLinkText.textContent = 'Copy Link'; }, 2000);
            }).catch(() => {
                prompt('Copy direct tracking link:', url);
            });
        };

        // Update URL hash
        window.location.hash = `id=${app.id}`;

        detailModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    function closeModal() {
        detailModal.style.display = 'none';
        document.body.style.overflow = '';
        if (window.location.hash.includes('id=')) {
            history.pushState('', document.title, window.location.pathname + window.location.search);
        }
    }

    closeModalBtn.addEventListener('click', closeModal);
    closeModalFooterBtn.addEventListener('click', closeModal);
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailModal.style.display === 'flex') {
            closeModal();
        }
    });

    // Check for Deep Link on Load
    function checkUrlHashForDirectView() {
        const hash = window.location.hash;
        if (hash && hash.includes('id=')) {
            const id = hash.split('id=')[1];
            if (id) {
                window.viewApplicationDetails(id);
            }
        }
    }

    // Search Input Events
    searchInput.addEventListener('input', (e) => {
        currentFilter.search = e.target.value;
        clearSearchBtn.style.display = currentFilter.search ? 'block' : 'none';
        renderApplications();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentFilter.search = '';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
        renderApplications();
    });

    // Service Filters
    serviceFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-chip')) {
            serviceFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter.service = e.target.getAttribute('data-service') || 'ALL';
            renderApplications();
        }
    });

    // Status Filter Dropdown
    statusFilter.addEventListener('change', (e) => {
        currentFilter.status = e.target.value;
        renderApplications();
    });

    // Reset Filters Button
    resetFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentFilter.search = '';
        currentFilter.service = 'ALL';
        currentFilter.status = 'ALL';
        clearSearchBtn.style.display = 'none';
        serviceFilters.querySelectorAll('.filter-chip').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-service') === 'ALL');
        });
        statusFilter.value = 'ALL';
        renderApplications();
    });

    // Utility: HTML Escaping
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Initialize
    loadApplicationsData();
});
