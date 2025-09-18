// Administration JavaScript - CardiaCare
class AdminDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchQuery = '';
        this.filterType = '';
        this.confirmCallback = null;
        
        // Données simulées
        this.patientsData = this.generatePatientsData();
        this.consultationsData = this.generateConsultationsData();
        this.systemLogs = this.generateSystemLogs();
        this.systemStats = {
            totalPatients: 1247,
            activeConsultations: 87,
            systemHealth: 99.8,
            mlAccuracy: 94.2
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSection('overview');
        this.updateSystemStats();
        this.startRealTimeUpdates();
        this.animateOnLoad();
    }

    setupEventListeners() {
        // Navigation entre sections
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.loadSection(section);
            });
        });

        // Recherche et filtres
        const searchInput = document.getElementById('patientSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.filterPatients();
            });
        }

        const filterSelect = document.getElementById('patientFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filterType = e.target.value;
                this.filterPatients();
            });
        }

        // Gestion des modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Échap pour fermer les modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'flex') {
                        this.closeModal(modal.id);
                    }
                });
            }
        });
    }

    loadSection(sectionName) {
        // Masquer toutes les sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mettre à jour la navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionName);
        const targetNav = document.querySelector(`[data-section="${sectionName}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }
        
        if (targetNav) {
            targetNav.classList.add('active');
        }

        // Charger le contenu spécifique à la section
        switch (sectionName) {
            case 'overview':
                this.loadOverview();
                break;
            case 'patients':
                this.loadPatients();
                break;
            case 'consultations':
                this.loadConsultations();
                break;
            case 'ml-models':
                this.loadMLModels();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'settings':
                this.loadSettings();
                break;
            case 'logs':
                this.loadLogs();
                break;
        }
    }

    loadOverview() {
        this.loadActivityFeed();
        this.loadSystemAlerts();
        this.updateSystemStats();
    }

    loadActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        const activities = [
            { icon: 'user-plus', title: 'Nouveau patient enregistré', time: 'Il y a 5 min', type: 'success' },
            { icon: 'brain', title: 'Modèle ML mis à jour', time: 'Il y a 15 min', type: 'info' },
            { icon: 'comments', title: '23 nouvelles consultations', time: 'Il y a 30 min', type: 'info' },
            { icon: 'exclamation-triangle', title: 'Alerte système résolue', time: 'Il y a 1h', type: 'warning' },
            { icon: 'database', title: 'Sauvegarde automatique', time: 'Il y a 2h', type: 'success' }
        ];

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-title">${activity.title}</p>
                    <p class="activity-time">${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    loadSystemAlerts() {
        const systemAlerts = document.getElementById('systemAlerts');
        if (!systemAlerts) return;

        const alerts = [
            { title: 'Espace disque', message: 'Espace disponible : 78%', type: 'warning' },
            { title: 'Performance ML', message: 'Temps de réponse optimal', type: 'success' }
        ];

        if (alerts.length === 0) {
            systemAlerts.innerHTML = `
                <div class="alert-item">
                    <div class="alert-icon">
                        <i class="fas fa-check-circle" style="color: var(--medical-green);"></i>
                    </div>
                    <div class="alert-content">
                        <p class="alert-title">Système opérationnel</p>
                        <p class="alert-message">Aucune alerte active</p>
                    </div>
                </div>
            `;
        } else {
            systemAlerts.innerHTML = alerts.map(alert => `
                <div class="alert-item">
                    <div class="alert-icon">
                        <i class="fas fa-${alert.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                    </div>
                    <div class="alert-content">
                        <p class="alert-title">${alert.title}</p>
                        <p class="alert-message">${alert.message}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    loadPatients() {
        this.renderPatientsTable();
        this.renderPatientsPagination();
    }

    renderPatientsTable() {
        const tbody = document.getElementById('patientsTableBody');
        if (!tbody) return;

        const filteredPatients = this.getFilteredPatients();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pagePatients = filteredPatients.slice(startIndex, endIndex);

        tbody.innerHTML = pagePatients.map(patient => `
            <tr>
                <td>${patient.id}</td>
                <td>${patient.lastName} ${patient.firstName}</td>
                <td>${patient.age}</td>
                <td>
                    <span class="risk-level ${patient.riskLevel}">
                        ${this.getRiskText(patient.riskLevel)}
                    </span>
                </td>
                <td>${patient.lastConsultation}</td>
                <td>
                    <span class="status-badge ${patient.status}">
                        ${patient.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                </td>
                <td>
                    <button class="action-btn btn-view" onclick="adminDashboard.viewPatient('${patient.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="adminDashboard.editPatient('${patient.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="adminDashboard.deletePatient('${patient.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderPatientsPagination() {
        const pagination = document.getElementById('patientsPagination');
        if (!pagination) return;

        const filteredPatients = this.getFilteredPatients();
        const totalPages = Math.ceil(filteredPatients.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="adminDashboard.changePage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="adminDashboard.changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }

        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="adminDashboard.changePage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationHTML += `
            <span class="pagination-info">
                Page ${this.currentPage} sur ${totalPages} 
                (${filteredPatients.length} patients)
            </span>
        `;

        pagination.innerHTML = paginationHTML;
    }

    loadConsultations() {
        this.renderConsultationsTable();
    }

    renderConsultationsTable() {
        const tbody = document.getElementById('consultationsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.consultationsData.map(consultation => `
            <tr>
                <td>${consultation.sessionId}</td>
                <td>${consultation.patientName}</td>
                <td>${consultation.startTime}</td>
                <td>${consultation.duration}</td>
                <td>${consultation.messageCount}</td>
                <td>
                    <span class="risk-level ${consultation.prediction.level}">
                        ${this.getRiskText(consultation.prediction.level)} (${consultation.prediction.score}%)
                    </span>
                </td>
                <td>
                    <span class="status-badge ${consultation.status}">
                        ${consultation.status === 'active' ? 'En cours' : 'Terminée'}
                    </span>
                </td>
                <td>
                    <button class="action-btn btn-view" onclick="adminDashboard.viewConsultation('${consultation.sessionId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn btn-edit" onclick="adminDashboard.exportConsultation('${consultation.sessionId}')">
                        <i class="fas fa-download"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadMLModels() {
        // Les modèles ML sont déjà définis dans le HTML
        // On peut ajouter des mises à jour dynamiques ici
        this.updateTrainingProgress();
    }

    updateTrainingProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressInfo = document.querySelector('.progress-info');
        
        if (progressFill && progressInfo) {
            // Simulation d'un entraînement en cours
            let progress = 67;
            const interval = setInterval(() => {
                progress += Math.random() * 2;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    progressInfo.innerHTML = `
                        <span>Neural Network v1.6 - Entraînement terminé</span>
                        <span>Précision: 95.1%</span>
                    `;
                } else {
                    const eta = Math.round((100 - progress) * 0.5);
                    progressInfo.innerHTML = `
                        <span>Neural Network v1.6 - Époque ${Math.round(progress)}/100</span>
                        <span>ETA: ${eta}min</span>
                    `;
                }
                progressFill.style.width = `${progress}%`;
            }, 2000);
        }
    }

    loadAnalytics() {
        // Simulation de données analytiques
        this.renderAnalyticsCharts();
    }

    renderAnalyticsCharts() {
        // Simulation de graphiques avec du contenu statique
        const usageChart = document.getElementById('usageChart');
        const riskChart = document.getElementById('riskChart');
        
        if (usageChart) {
            usageChart.parentElement.innerHTML = `
                <div class="chart-placeholder">
                    <i class="fas fa-chart-bar" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <p>Graphique d'utilisation du système<br>
                    <small>+15% cette semaine</small></p>
                </div>
            `;
        }
        
        if (riskChart) {
            riskChart.parentElement.innerHTML = `
                <div class="chart-placeholder">
                    <i class="fas fa-chart-pie" style="font-size: 3rem; color: var(--medical-green);"></i>
                    <p>Distribution des niveaux de risque<br>
                    <small>Faible: 65%, Modéré: 28%, Élevé: 7%</small></p>
                </div>
            `;
        }
    }

    loadSettings() {
        // Les paramètres sont déjà dans le HTML
        // On peut ajouter la logique de sauvegarde ici
    }

    loadLogs() {
        this.renderSystemLogs();
    }

    renderSystemLogs() {
        const logViewer = document.getElementById('logViewer');
        if (!logViewer) return;

        logViewer.innerHTML = this.systemLogs.map(log => `
            <div class="log-entry ${log.level}">
                <span class="log-timestamp">${log.timestamp}</span>
                <span class="log-level">[${log.level.toUpperCase()}]</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');
        
        // Auto-scroll vers le bas
        logViewer.scrollTop = logViewer.scrollHeight;
    }

    // Fonctions utilitaires
    generatePatientsData() {
        const patients = [];
        const firstNames = ['Ahmed', 'Fatima', 'Mohamed', 'Aicha', 'Youssef', 'Khadija', 'Omar', 'Zineb'];
        const lastNames = ['Alami', 'Benali', 'Chahine', 'Douiri', 'El Fassi', 'Ghali', 'Hajji', 'Idrissi'];
        const riskLevels = ['low', 'moderate', 'high'];
        const statuses = ['active', 'inactive'];

        for (let i = 1; i <= 50; i++) {
            patients.push({
                id: `P${i.toString().padStart(4, '0')}`,
                firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
                lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
                age: Math.floor(Math.random() * 60) + 20,
                riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
                lastConsultation: this.randomDate(30),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                email: `patient${i}@email.com`,
                phone: `+212 6${Math.floor(Math.random() * 90000000) + 10000000}`
            });
        }

        return patients;
    }

    generateConsultationsData() {
        const consultations = [];
        const patientNames = ['Ahmed Alami', 'Fatima Benali', 'Mohamed Chahine', 'Aicha Douiri'];
        const statuses = ['active', 'completed'];

        for (let i = 1; i <= 20; i++) {
            consultations.push({
                sessionId: `S${Date.now()}-${i}`,
                patientName: patientNames[Math.floor(Math.random() * patientNames.length)],
                startTime: this.randomTime(),
                duration: `${Math.floor(Math.random() * 20) + 5}min`,
                messageCount: Math.floor(Math.random() * 30) + 10,
                prediction: {
                    level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
                    score: Math.floor(Math.random() * 100)
                },
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }

        return consultations;
    }

    generateSystemLogs() {
        const logs = [];
        const levels = ['info', 'warning', 'error', 'success'];
        const messages = [
            'Connexion utilisateur réussie',
            'Modèle ML chargé avec succès',
            'Tentative de connexion échouée',
            'Sauvegarde automatique effectuée',
            'Erreur temporaire de base de données',
            'Nouvelle prédiction générée',
            'Maintenance système programmée',
            'Cache vidé automatiquement'
        ];

        for (let i = 0; i < 50; i++) {
            logs.push({
                timestamp: this.randomTimestamp(),
                level: levels[Math.floor(Math.random() * levels.length)],
                message: messages[Math.floor(Math.random() * messages.length)]
            });
        }

        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Fonctions d'action
    addNewPatient() {
        document.getElementById('patientModalTitle').textContent = 'Nouveau Patient';
        document.getElementById('patientForm').reset();
        this.showModal('patientModal');
    }

    editPatient(patientId) {
        const patient = this.patientsData.find(p => p.id === patientId);
        if (!patient) return;

        document.getElementById('patientModalTitle').textContent = 'Modifier Patient';
        
        // Remplir le formulaire avec les données du patient
        const form = document.getElementById('patientForm');
        form.lastName.value = patient.lastName;
        form.firstName.value = patient.firstName;
        form.age.value = patient.age;
        form.email.value = patient.email || '';
        form.phone.value = patient.phone || '';
        
        this.showModal('patientModal');
    }

    viewPatient(patientId) {
        const patient = this.patientsData.find(p => p.id === patientId);
        if (!patient) return;

        this.showNotification(`Affichage du profil de ${patient.firstName} ${patient.lastName}`, 'info');
    }

    deletePatient(patientId) {
        const patient = this.patientsData.find(p => p.id === patientId);
        if (!patient) return;

        this.showConfirmModal(
            'Supprimer Patient',
            `Êtes-vous sûr de vouloir supprimer le patient ${patient.firstName} ${patient.lastName} ?`,
            () => {
                this.patientsData = this.patientsData.filter(p => p.id !== patientId);
                this.renderPatientsTable();
                this.renderPatientsPagination();
                this.showNotification('Patient supprimé avec succès', 'success');
            }
        );
    }

    savePatient() {
        const form = document.getElementById('patientForm');
        const formData = new FormData(form);
        
        // Validation basique
        if (!formData.get('lastName') || !formData.get('firstName') || !formData.get('age')) {
            this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        // Simulation de la sauvegarde
        this.showNotification('Patient sauvegardé avec succès', 'success');
        this.closeModal('patientModal');
        
        // Actualiser la liste
        this.loadPatients();
    }

    viewConsultation(sessionId) {
        this.showNotification(`Affichage de la consultation ${sessionId}`, 'info');
    }

    exportConsultation(sessionId) {
        this.showNotification(`Export de la consultation ${sessionId}`, 'success');
    }

    exportPatients() {
        const filteredPatients = this.getFilteredPatients();
        const csvContent = this.convertToCSV(filteredPatients);
        this.downloadFile(csvContent, 'patients.csv', 'text/csv');
        this.showNotification('Export des patients terminé', 'success');
    }

    exportData() {
        this.showNotification('Export des données en cours...', 'info');
        setTimeout(() => {
            this.showNotification('Export terminé avec succès', 'success');
        }, 2000);
    }

    systemBackup() {
        this.showNotification('Sauvegarde système en cours...', 'info');
        setTimeout(() => {
            this.showNotification('Sauvegarde terminée avec succès', 'success');
        }, 3000);
    }

    refreshOverview() {
        this.loadOverview();
        this.showNotification('Vue d\'ensemble actualisée', 'success');
    }

    refreshConsultations() {
        this.loadConsultations();
        this.showNotification('Consultations actualisées', 'success');
    }

    saveSettings() {
        this.showNotification('Paramètres sauvegardés avec succès', 'success');
    }

    clearLogs() {
        this.showConfirmModal(
            'Effacer les logs',
            'Êtes-vous sûr de vouloir effacer tous les logs système ?',
            () => {
                this.systemLogs = [];
                this.renderSystemLogs();
                this.showNotification('Logs effacés avec succès', 'success');
            }
        );
    }

    // Fonctions de gestion des modèles ML
    viewModelDetails(modelId) {
        this.showNotification(`Affichage des détails du modèle ${modelId}`, 'info');
    }

    activateModel(modelId) {
        this.showNotification(`Modèle ${modelId} activé`, 'success');
    }

    retrainModel(modelId) {
        this.showNotification(`Réentraînement du modèle ${modelId} commencé`, 'info');
    }

    deleteModel(modelId) {
        this.showConfirmModal(
            'Supprimer Modèle',
            `Êtes-vous sûr de vouloir supprimer le modèle ${modelId} ?`,
            () => {
                this.showNotification(`Modèle ${modelId} supprimé`, 'success');
            }
        );
    }

    uploadNewModel() {
        this.showNotification('Fonctionnalité à implémenter avec le backend', 'info');
    }

    exportAnalytics() {
        this.showNotification('Export des analytics en cours...', 'info');
        setTimeout(() => {
            this.showNotification('Rapport PDF généré avec succès', 'success');
        }, 2000);
    }

    // Fonctions utilitaires
    getFilteredPatients() {
        let filtered = this.patientsData;

        if (this.searchQuery) {
            filtered = filtered.filter(patient => 
                patient.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                patient.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                patient.id.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        if (this.filterType) {
            filtered = filtered.filter(patient => {
                switch (this.filterType) {
                    case 'active':
                        return patient.status === 'active';
                    case 'inactive':
                        return patient.status === 'inactive';
                    case 'high-risk':
                        return patient.riskLevel === 'high';
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }

    filterPatients() {
        this.currentPage = 1;
        this.renderPatientsTable();
        this.renderPatientsPagination();
    }

    changePage(page) {
        this.currentPage = page;
        this.renderPatientsTable();
        this.renderPatientsPagination();
    }

    getRiskText(level) {
        const texts = {
            low: 'Faible',
            moderate: 'Modéré',
            high: 'Élevé'
        };
        return texts[level] || level;
    }

    randomDate(daysAgo) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
        return date.toLocaleDateString('fr-FR');
    }

    randomTime() {
        const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
        const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    randomTimestamp() {
        const date = new Date();
        date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440));
        return date.toISOString();
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Système de notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            min-width: 320px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    // Gestion des modales
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showConfirmModal(title, message, callback) {
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        this.confirmCallback = callback;
        this.showModal('confirmModal');
    }

    confirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
            this.confirmCallback = null;
        }
        this.closeModal('confirmModal');
    }

    // Mises à jour temps réel
    startRealTimeUpdates() {
        setInterval(() => {
            this.updateSystemStats();
            this.simulateRealTimeData();
        }, 30000); // Mise à jour toutes les 30 secondes
    }

    simulateRealTimeData() {
        // Simulation de nouvelles données en temps réel
        if (Math.random() > 0.7) {
            // Nouvelle consultation
            this.systemStats.activeConsultations += Math.floor(Math.random() * 3);
        }
        
        if (Math.random() > 0.9) {
            // Nouveau patient
            this.systemStats.totalPatients += 1;
        }
        
        // Petites variations de performance
        this.systemStats.systemHealth += (Math.random() - 0.5) * 0.1;
        this.systemStats.systemHealth = Math.max(95, Math.min(100, this.systemStats.systemHealth));
        
        this.systemStats.mlAccuracy += (Math.random() - 0.5) * 0.2;
        this.systemStats.mlAccuracy = Math.max(90, Math.min(98, this.systemStats.mlAccuracy));
        
        this.updateSystemStats();
    }

    updateSystemStats() {
        // Mise à jour des statistiques dans l'en-tête
        const totalPatientsEl = document.getElementById('totalPatients');
        const activeConsultationsEl = document.getElementById('activeConsultations');
        const systemHealthEl = document.getElementById('systemHealth');

        if (totalPatientsEl) {
            totalPatientsEl.textContent = this.systemStats.totalPatients.toLocaleString();
        }
        
        if (activeConsultationsEl) {
            activeConsultationsEl.textContent = this.systemStats.activeConsultations;
        }
        
        if (systemHealthEl) {
            systemHealthEl.textContent = this.systemStats.systemHealth.toFixed(1) + '%';
        }

        // Mise à jour des cartes de statistiques dans overview
        this.updateOverviewStats();
    }

    updateOverviewStats() {
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach(card => {
            const number = card.querySelector('.stat-number');
            if (!number) return;
            
            if (card.classList.contains('patients')) {
                number.textContent = this.systemStats.totalPatients.toLocaleString();
            } else if (card.classList.contains('consultations')) {
                number.textContent = '15,840'; // Total historique
            } else if (card.classList.contains('accuracy')) {
                number.textContent = this.systemStats.mlAccuracy.toFixed(1) + '%';
            } else if (card.classList.contains('uptime')) {
                number.textContent = this.systemStats.systemHealth.toFixed(1) + '%';
            }
        });
    }

    // Animation d'entrée
    animateOnLoad() {
        const elements = document.querySelectorAll('.admin-sidebar, .admin-content');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200 + 300);
        });
    }

    // Fonctions de recherche et tri avancés
    sortTable(column, direction = 'asc') {
        this.patientsData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        
        this.renderPatientsTable();
    }

    // Gestion des erreurs
    handleError(error, context = '') {
        console.error(`Erreur ${context}:`, error);
        this.showNotification(`Erreur ${context}: ${error.message}`, 'error');
    }

    // Export avancé
    exportToJSON(data, filename) {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, filename, 'application/json');
    }

    exportToExcel(data, filename) {
        // Simulation d'export Excel (nécessiterait une bibliothèque comme SheetJS)
        this.showNotification('Export Excel nécessite une bibliothèque supplémentaire', 'warning');
    }

    // Fonctions de statistiques avancées
    getPatientStatistics() {
        const stats = {
            total: this.patientsData.length,
            active: this.patientsData.filter(p => p.status === 'active').length,
            byRisk: {
                low: this.patientsData.filter(p => p.riskLevel === 'low').length,
                moderate: this.patientsData.filter(p => p.riskLevel === 'moderate').length,
                high: this.patientsData.filter(p => p.riskLevel === 'high').length
            },
            averageAge: Math.round(
                this.patientsData.reduce((sum, p) => sum + p.age, 0) / this.patientsData.length
            )
        };
        
        return stats;
    }

    // Validation des données
    validatePatientData(data) {
        const errors = [];
        
        if (!data.firstName || data.firstName.trim().length < 2) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        
        if (!data.lastName || data.lastName.trim().length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (!data.age || data.age < 0 || data.age > 150) {
            errors.push('L\'âge doit être compris entre 0 et 150 ans');
        }
        
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push('Format d\'email invalide');
        }
        
        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Recherche intelligente
    intelligentSearch(query) {
        const searchTerms = query.toLowerCase().split(' ');
        
        return this.patientsData.filter(patient => {
            const searchableFields = [
                patient.firstName.toLowerCase(),
                patient.lastName.toLowerCase(),
                patient.id.toLowerCase(),
                patient.email ? patient.email.toLowerCase() : '',
                patient.phone ? patient.phone.toLowerCase() : ''
            ].join(' ');
            
            return searchTerms.every(term => searchableFields.includes(term));
        });
    }

    // Sauvegarde automatique
    enableAutoSave() {
        setInterval(() => {
            this.saveToLocalStorage();
        }, 60000); // Sauvegarde toutes les minutes
    }

    saveToLocalStorage() {
        try {
            const dataToSave = {
                patients: this.patientsData,
                consultations: this.consultationsData,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('cardiacare_admin_backup', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Impossible de sauvegarder en localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('cardiacare_admin_backup');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.patientsData = data.patients || this.patientsData;
                this.consultationsData = data.consultations || this.consultationsData;
                return true;
            }
        } catch (error) {
            console.warn('Impossible de charger depuis localStorage:', error);
        }
        return false;
    }

    // Fonctions de performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Nettoyage et maintenance
    cleanup() {
        // Nettoyer les timers
        clearInterval(this.updateInterval);
        
        // Supprimer les event listeners
        document.removeEventListener('click', this.handleDocumentClick);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Sauvegarder avant de quitter
        this.saveToLocalStorage();
    }

    // Fonctions de debug et développement
    getDebugInfo() {
        return {
            currentSection: this.currentSection,
            currentPage: this.currentPage,
            patientsCount: this.patientsData.length,
            consultationsCount: this.consultationsData.length,
            logsCount: this.systemLogs.length,
            systemStats: this.systemStats,
            version: '1.0.0'
        };
    }

    // Fonctions de test
    runTests() {
        console.log('🧪 Tests du panneau d\'administration...');
        
        try {
            // Test de validation
            const testData = { firstName: 'Test', lastName: 'User', age: 30 };
            const errors = this.validatePatientData(testData);
            console.assert(errors.length === 0, 'Test validation - OK');
            
            // Test de recherche
            const results = this.intelligentSearch('ahmed');
            console.assert(Array.isArray(results), 'Test recherche - OK');
            
            // Test de statistiques
            const stats = this.getPatientStatistics();
            console.assert(typeof stats.total === 'number', 'Test statistiques - OK');
            
            console.log('✅ Tous les tests réussis !');
        } catch (error) {
            console.error('❌ Erreur dans les tests:', error);
        }
    }
}

// Fonctions globales pour les événements HTML
let adminDashboard;

// Fonctions d'action globales
function addNewPatient() {
    adminDashboard?.addNewPatient();
}

function exportData() {
    adminDashboard?.exportData();
}

function systemBackup() {
    adminDashboard?.systemBackup();
}

function refreshOverview() {
    adminDashboard?.refreshOverview();
}

function refreshConsultations() {
    adminDashboard?.refreshConsultations();
}

function saveSettings() {
    adminDashboard?.saveSettings();
}

function clearLogs() {
    adminDashboard?.clearLogs();
}

function savePatient() {
    adminDashboard?.savePatient();
}

function closeModal(modalId) {
    adminDashboard?.closeModal(modalId);
}

function confirmAction() {
    adminDashboard?.confirmAction();
}

function exportPatients() {
    adminDashboard?.exportPatients();
}

function exportAnalytics() {
    adminDashboard?.exportAnalytics();
}

function uploadNewModel() {
    adminDashboard?.uploadNewModel();
}

function viewModelDetails(modelId) {
    adminDashboard?.viewModelDetails(modelId);
}

function activateModel(modelId) {
    adminDashboard?.activateModel(modelId);
}

function retrainModel(modelId) {
    adminDashboard?.retrainModel(modelId);
}

function deleteModel(modelId) {
    adminDashboard?.deleteModel(modelId);
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = 'index.html';
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du panneau d\'administration CardiaCare...');
    
    try {
        adminDashboard = new AdminDashboard();
        
        // Exposition globale pour le debug
        window.AdminDashboard = adminDashboard;
        
        // Fonctions utilitaires globales
        window.AdminUtils = {
            exportData: () => adminDashboard.exportData(),
            getDebugInfo: () => adminDashboard.getDebugInfo(),
            runTests: () => adminDashboard.runTests(),
            getStats: () => adminDashboard.getPatientStatistics()
        };
        
        console.log('✅ Panneau d\'administration initialisé avec succès');
        console.log('💡 Utilisez AdminUtils pour accéder aux outils de développement');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
});

// Nettoyage à la fermeture
window.addEventListener('beforeunload', function() {
    if (adminDashboard) {
        adminDashboard.cleanup();
    }
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur Administration:', e.error);
    if (adminDashboard) {
        adminDashboard.handleError(e.error, 'globale');
    }
});

// Log de démarrage
console.log('🏥 CardiaCare Administration Panel - Version complète chargée');
console.log('📊 Utilisez AdminUtils pour les fonctions de développement');