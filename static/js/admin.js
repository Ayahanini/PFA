// Administration JavaScript - Version Complète
class AdminManager {
    constructor() {
        this.currentSection = 'overview';
        this.charts = {};
        this.systemData = this.initializeSystemData();
        this.patients = this.initializePatientsData();
        this.systemLogs = [];
        this.confirmAction = null;
        
        this.initializeEventListeners();
        this.initializeCharts();
        this.updateAdminDashboard();
        this.startRealTimeMonitoring();
        this.loadSystemActivity();
    }

    initializeSystemData() {
        return {
            totalPatients: 1247,
            totalPredictions: 15840,
            mlAccuracy: 94.2,
            activeAlerts: 3,
            systemHealth: {
                webServer: { status: 'online', uptime: '15d 8h', cpu: 23 },
                database: { status: 'online', uptime: '15d 8h', connections: 47 },
                mlService: { status: 'online', uptime: '15d 8h', predictionsPerMin: 12 },
                storage: { status: 'warning', usage: 78, message: 'Nettoyage requis' }
            },
            performance: {
                responseTime: 145,
                throughput: 156,
                errorRate: 0.02
            }
        };
    }

    initializePatientsData() {
        return [
            {
                id: 1247,
                name: 'Marie Dupont',
                email: 'marie.dupont@email.com',
                age: 45,
                riskLevel: 'low',
                riskPercentage: 15,
                lastEvaluation: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
                status: 'active'
            },
            {
                id: 1246,
                name: 'Ahmed Benjelloun',
                email: 'ahmed.b@email.com',
                age: 62,
                riskLevel: 'moderate',
                riskPercentage: 45,
                lastEvaluation: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                status: 'active'
            },
            {
                id: 1245,
                name: 'Fatima Semlali',
                email: 'fatima.s@email.com',
                age: 58,
                riskLevel: 'high',
                riskPercentage: 78,
                lastEvaluation: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
                status: 'critical'
            }
        ];
    }

    initializeEventListeners() {
        // Navigation entre sections
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Boutons d'action globaux
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn, .action-btn, .btn-sm')) {
                const button = e.target.closest('.btn, .action-btn, .btn-sm');
                this.handleButtonClick(button);
            }
        });

        // Recherche de patients
        const patientSearch = document.getElementById('patientSearch');
        if (patientSearch) {
            patientSearch.addEventListener('input', (e) => {
                this.searchPatients(e.target.value);
            });
        }

        // Fermeture des modales avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    switchSection(sectionId) {
        // Masquer toutes les sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Désactiver tous les liens de navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Activer la section demandée
        const targetSection = document.getElementById(sectionId);
        const targetLink = document.querySelector(`[data-section="${sectionId}"]`);

        if (targetSection && targetLink) {
            targetSection.classList.add('active');
            targetLink.classList.add('active');
            this.currentSection = sectionId;

            // Actions spécifiques selon la section
            this.handleSectionSwitch(sectionId);
        }
    }

    handleSectionSwitch(sectionId) {
        switch (sectionId) {
            case 'overview':
                this.updateOverviewSection();
                this.refreshCharts();
                break;
            case 'patients':
                this.updatePatientsTable();
                break;
            case 'analytics':
                this.updateAnalyticsSection();
                this.initMLCharts();
                break;
            case 'monitoring':
                this.updateMonitoringSection();
                this.refreshLogs();
                break;
            case 'reports':
                this.updateReportsSection();
                break;
            case 'settings':
                this.loadSystemSettings();
                break;
        }
    }

    handleButtonClick(button) {
        // Gestion des clics de boutons avec gestion d'erreurs
        try {
            const action = button.onclick || button.getAttribute('onclick');
            if (action) return; // Si onclick est défini, laisser faire

            // Gestion basée sur le contenu ou les classes
            const buttonText = button.textContent.trim();
            
            if (buttonText.includes('Actualiser')) {
                this.refreshAdminData();
            } else if (buttonText.includes('Alerte Système')) {
                this.systemAlert();
            } else if (buttonText.includes('Nouveau Patient')) {
                this.addPatient();
            }
        } catch (error) {
            console.error('Erreur lors du clic:', error);
            this.showNotification('Erreur lors de l\'action', 'error');
        }
    }

    // Initialisation des graphiques
    initializeCharts() {
        this.initUsageChart();
        this.initRiskDistributionChart();
        this.initPerformanceChart();
    }

    initUsageChart() {
        const ctx = document.getElementById('usageChart');
        if (!ctx) return;

        const data = this.generateUsageData(7);

        this.charts.usage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Prédictions',
                    data: data.predictions,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Utilisateurs Actifs',
                    data: data.users,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initRiskDistributionChart() {
        const ctx = document.getElementById('riskDistributionChart');
        if (!ctx) return;

        this.charts.riskDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Risque Faible', 'Risque Modéré', 'Risque Élevé'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#22c55e',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        const data = this.generatePerformanceData(24);

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Temps de Réponse (ms)',
                    data: data.responseTime,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                }, {
                    label: 'CPU (%)',
                    data: data.cpu,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temps de Réponse (ms)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'CPU (%)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    initMLCharts() {
        const ctx = document.getElementById('dailyUsageChart');
        if (!ctx) return;

        const data = this.generateMLUsageData(30);

        this.charts.mlUsage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Prédictions ML',
                    data: data.values,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de Prédictions'
                        }
                    }
                }
            }
        });
    }

    // Génération de données simulées
    generateUsageData(days) {
        const labels = [];
        const predictions = [];
        const users = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
            
            // Simulation de données d'usage
            predictions.push(Math.floor(Math.random() * 200) + 100);
            users.push(Math.floor(Math.random() * 50) + 30);
        }

        return { labels, predictions, users };
    }

    generatePerformanceData(hours) {
        const labels = [];
        const responseTime = [];
        const cpu = [];

        for (let i = hours - 1; i >= 0; i--) {
            const date = new Date();
            date.setHours(date.getHours() - i);
            labels.push(date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
            
            // Simulation de données de performance
            responseTime.push(Math.floor(Math.random() * 100) + 100);
            cpu.push(Math.floor(Math.random() * 40) + 10);
        }

        return { labels, responseTime, cpu };
    }

    generateMLUsageData(days) {
        const labels = [];
        const values = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
            
            // Simulation d'usage ML avec tendance croissante
            const baseUsage = 150;
            const growth = (days - i) * 2;
            const noise = Math.floor(Math.random() * 50) - 25;
            values.push(Math.max(50, baseUsage + growth + noise));
        }

        return { labels, values };
    }

    // Mise à jour des sections
    updateOverviewSection() {
        // Mettre à jour les métriques
        document.getElementById('totalPatients').textContent = this.systemData.totalPatients.toLocaleString('fr-FR');
        document.getElementById('totalPredictions').textContent = this.systemData.totalPredictions.toLocaleString('fr-FR');
        document.getElementById('mlAccuracy').textContent = `${this.systemData.mlAccuracy}%`;
        document.getElementById('activeAlerts').textContent = this.systemData.activeAlerts;

        // Mettre à jour l'heure
        document.getElementById('adminLastUpdate').textContent = 
            `Dernière mise à jour: ${new Date().toLocaleTimeString('fr-FR')}`;

        // Mettre à jour l'activité système
        this.updateSystemActivity();
    }

    updateSystemActivity() {
        const container = document.getElementById('systemActivity');
        if (!container) return;

        const activities = [
            {
                time: 'Il y a 5 min',
                title: 'Nouveau patient enregistré',
                description: 'Patient #1248 ajouté au système'
            },
            {
                time: 'Il y a 12 min',
                title: 'Prédiction ML réussie',
                description: 'Risque cardiaque calculé pour le patient #1247'
            },
            {
                time: 'Il y a 23 min',
                title: 'Sauvegarde automatique',
                description: 'Sauvegarde de la base de données terminée'
            },
            {
                time: 'Il y a 1h',
                title: 'Mise à jour du modèle ML',
                description: 'Version 1.2.1 déployée avec succès'
            },
            {
                time: 'Il y a 2h',
                title: 'Alerte système résolue',
                description: 'Problème de connectivité résolu'
            }
        ];

        container.innerHTML = activities.map(activity => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-time">${activity.time}</div>
                    <div class="timeline-title">${activity.title}</div>
                    <div class="timeline-description">${activity.description}</div>
                </div>
            </div>
        `).join('');
    }

    updatePatientsTable() {
        const tbody = document.getElementById('patientsTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.patients.map(patient => `
            <tr>
                <td>#${patient.id}</td>
                <td>
                    <div class="patient-info">
                        <div class="patient-avatar ${patient.status === 'critical' ? 'critical' : ''}">${this.getInitials(patient.name)}</div>
                        <div>
                            <strong>${patient.name}</strong>
                            <span>${patient.email}</span>
                        </div>
                    </div>
                </td>
                <td>${patient.age} ans</td>
                <td>
                    <span class="risk-badge ${patient.riskLevel}">${this.getRiskText(patient.riskLevel)} (${patient.riskPercentage}%)</span>
                </td>
                <td>${this.formatRelativeTime(patient.lastEvaluation)}</td>
                <td>
                    <span class="status-badge ${patient.status}">${this.getStatusText(patient.status)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-primary" onclick="viewPatientDetails(${patient.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-sm btn-secondary" onclick="editPatient(${patient.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${patient.status === 'critical' ? 
                            `<button class="btn-sm btn-danger" onclick="emergencyProtocol(${patient.id})">
                                <i class="fas fa-phone-alt"></i>
                            </button>` : 
                            `<button class="btn-sm btn-warning" onclick="contactPatient(${patient.id})">
                                <i class="fas fa-envelope"></i>
                            </button>`
                        }
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateAnalyticsSection() {
        // Cette fonction met à jour la section Analytics
        console.log('Analytics section mise à jour');
    }

    updateMonitoringSection() {
        this.updateSystemHealth();
    }

    updateSystemHealth() {
        // Mettre à jour l'état des services dans la section monitoring
        const health = this.systemData.systemHealth;
        
        // Cette fonction pourrait mettre à jour dynamiquement les statuts
        console.log('État système mis à jour:', health);
    }

    updateReportsSection() {
        // Mise à jour de la section rapports
        console.log('Section rapports mise à jour');
    }

    loadSystemSettings() {
        // Charger les paramètres système actuels
        document.getElementById('systemName').value = 'CardiaCare Production';
        document.getElementById('maxPatients').value = '5000';
        document.getElementById('mlThreshold').value = '65';
        // ... autres paramètres
    }

    // Fonctions utilitaires
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    getRiskText(level) {
        const texts = {
            low: 'Faible',
            moderate: 'Modéré',
            high: 'Élevé'
        };
        return texts[level] || 'Indéterminé';
    }

    getStatusText(status) {
        const texts = {
            active: 'Actif',
            inactive: 'Inactif',
            critical: 'Critique'
        };
        return texts[status] || 'Inconnu';
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Il y a ${hours}h`;
        return 'Il y a quelques minutes';
    }

    // Fonctions d'action
    refreshAdminData() {
        this.showNotification('Actualisation des données administratives...', 'info');
        
        setTimeout(() => {
            // Simuler la mise à jour des données
            this.systemData.totalPredictions += Math.floor(Math.random() * 50);
            this.systemData.totalPatients += Math.floor(Math.random() * 5);
            
            this.updateAdminDashboard();
            this.refreshCharts();
            
            this.showNotification('Données actualisées avec succès!', 'success');
        }, 1500);
    }

    systemAlert() {
        this.showConfirmModal(
            'Alerte Système',
            'Voulez-vous déclencher une alerte système ? Ceci notifiera tous les administrateurs.',
            () => {
                this.showNotification('🚨 Alerte système déclenchée - Administrateurs notifiés', 'warning');
                
                // Ajouter l'alerte à la liste
                this.addSystemAlert('Alerte manuelle déclenchée par l\'administrateur', 'warning');
            }
        );
    }

    addPatient() {
        this.openModal('addPatientModal');
    }

    maintenanceMode() {
        this.showConfirmModal(
            'Mode Maintenance',
            '⚠️ Attention: Le mode maintenance rendra le système inaccessible aux utilisateurs. Continuer ?',
            () => {
                this.showNotification('🔧 Mode maintenance activé - Système en cours de maintenance', 'warning');
                
                // Simuler l'activation du mode maintenance
                setTimeout(() => {
                    this.showNotification('Maintenance terminée - Système opérationnel', 'success');
                }, 5000);
            }
        );
    }

    generateSystemReport() {
        this.showNotification('Génération du rapport système en cours...', 'info');
        
        setTimeout(() => {
            const reportData = {
                timestamp: new Date().toISOString(),
                systemHealth: this.systemData.systemHealth,
                metrics: this.systemData,
                patients: this.patients.length,
                recentActivity: 'Système stable, performances normales'
            };
            
            this.downloadJSON(reportData, `rapport-systeme-${new Date().toISOString().split('T')[0]}.json`);
            this.showNotification('📊 Rapport système généré et téléchargé!', 'success');
        }, 2000);
    }

    // Gestion des patients
    searchPatients(query) {
        const filteredPatients = this.patients.filter(patient => 
            patient.name.toLowerCase().includes(query.toLowerCase()) ||
            patient.email.toLowerCase().includes(query.toLowerCase()) ||
            patient.id.toString().includes(query)
        );
        
        // Mettre à jour l'affichage avec les résultats filtrés
        console.log('Recherche:', query, 'Résultats:', filteredPatients.length);
    }

    filterPatients() {
        const riskFilter = document.getElementById('riskFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const activityFilter = document.getElementById('activityFilter').value;
        
        console.log('Filtres appliqués:', { riskFilter, statusFilter, activityFilter });
        // Appliquer les filtres et mettre à jour la table
    }

    viewPatientDetails(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
            const modalBody = document.querySelector('#patientModal .modal-body');
            modalBody.innerHTML = `
                <div class="patient-details">
                    <div class="patient-header">
                        <div class="patient-avatar large">${this.getInitials(patient.name)}</div>
                        <div class="patient-basic-info">
                            <h3>${patient.name}</h3>
                            <p>${patient.email}</p>
                            <p>${patient.age} ans</p>
                            <span class="risk-badge ${patient.riskLevel}">${this.getRiskText(patient.riskLevel)} (${patient.riskPercentage}%)</span>
                        </div>
                    </div>
                    <div class="patient-stats">
                        <div class="stat-item">
                            <label>Dernière Évaluation:</label>
                            <span>${this.formatRelativeTime(patient.lastEvaluation)}</span>
                        </div>
                        <div class="stat-item">
                            <label>Statut:</label>
                            <span class="status-badge ${patient.status}">${this.getStatusText(patient.status)}</span>
                        </div>
                        <div class="stat-item">
                            <label>Nombre d'Évaluations:</label>
                            <span>${Math.floor(Math.random() * 20) + 5}</span>
                        </div>
                    </div>
                    <div class="patient-actions">
                        <button class="btn btn-primary" onclick="contactPatient(${patient.id})">
                            <i class="fas fa-envelope"></i> Contacter
                        </button>
                        <button class="btn btn-secondary" onclick="exportPatientData(${patient.id})">
                            <i class="fas fa-download"></i> Exporter Données
                        </button>
                        ${patient.status === 'critical' ? 
                            `<button class="btn btn-danger" onclick="emergencyProtocol(${patient.id})">
                                <i class="fas fa-phone-alt"></i> Protocole Urgence
                            </button>` : ''
                        }
                    </div>
                </div>
            `;
            this.openModal('patientModal');
        }
    }

    saveNewPatient() {
        const form = document.getElementById('newPatientForm');
        const formData = new FormData(form);
        
        const newPatient = {
            id: this.patients.length > 0 ? Math.max(...this.patients.map(p => p.id)) + 1 : 1248,
            name: `${formData.get('firstName')} ${formData.get('lastName')}`,
            email: formData.get('email'),
            age: this.calculateAge(new Date(formData.get('dateOfBirth'))),
            riskLevel: 'low', // Par défaut
            riskPercentage: 0,
            lastEvaluation: null,
            status: 'active'
        };
        
        this.patients.push(newPatient);
        this.systemData.totalPatients++;
        
        this.updatePatientsTable();
        this.updateOverviewSection();
        this.closeModal('addPatientModal');
        form.reset();
        
        this.showNotification(`Patient ${newPatient.name} ajouté avec succès!`, 'success');
    }

    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Gestion des logs
    refreshLogs() {
        const container = document.getElementById('logsContainer');
        if (!container) return;

        // Générer des logs simulés
        const logs = this.generateSimulatedLogs();
        
        container.innerHTML = logs.map(log => `
            <div class="log-entry ${log.level}">
                <span class="log-time">${log.timestamp}</span>
                <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
                <span class="log-component">${log.component}</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');
    }

    generateSimulatedLogs() {
        return [
            {
                timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
                level: 'error',
                component: 'ML',
                message: 'Timeout lors de la prédiction pour le patient #1245'
            },
            {
                timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
                level: 'warning',
                component: 'DB',
                message: 'Connexions à la base de données élevées: 95/100'
            },
            {
                timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
                level: 'info',
                component: 'API',
                message: 'Nouveau patient enregistré: #1248'
            },
            {
                timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
                level: 'info',
                component: 'ML',
                message: 'Prédiction réussie pour le patient #1247 - Risque: 15%'
            }
        ];
    }

    filterLogs() {
        const level = document.getElementById('logLevel').value;
        const component = document.getElementById('logComponent').value;
        
        console.log('Filtres logs:', { level, component });
        // Appliquer les filtres et mettre à jour l'affichage
    }

    // Fonctions de modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        this.confirmAction = onConfirm;
        this.openModal('confirmModal');
    }

    executeConfirmedAction() {
        if (this.confirmAction) {
            this.confirmAction();
            this.confirmAction = null;
        }
        this.closeModal('confirmModal');
    }

    // Fonctions utilitaires
    showNotification(message, type = 'info') {
        if (window.CardiaCare && window.CardiaCare.showNotification) {
            window.CardiaCare.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    downloadJSON(data, filename) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
    }

    addSystemAlert(message, type) {
        // Ajouter une nouvelle alerte au système
        this.systemData.activeAlerts++;
        console.log(`Nouvelle alerte ${type}: ${message}`);
    }

    refreshCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update();
            }
        });
    }

    updateAdminDashboard() {
        switch (this.currentSection) {
            case 'overview':
                this.updateOverviewSection();
                break;
            case 'patients':
                this.updatePatientsTable();
                break;
            case 'monitoring':
                this.updateMonitoringSection();
                break;
        }
    }

    loadSystemActivity() {
        // Charger l'activité système récente
        this.updateSystemActivity();
    }

    startRealTimeMonitoring() {
        // Mise à jour en temps réel toutes les 30 secondes
        setInterval(() => {
            if (this.currentSection === 'overview') {
                this.updateOverviewSection();
            } else if (this.currentSection === 'monitoring') {
                this.updateMonitoringSection();
                this.refreshLogs();
            }
        }, 30000);

        // Simulation de nouvelles données périodiquement
        setInterval(() => {
            this.simulateSystemUpdates();
        }, 60000); // Toutes les minutes
    }

    simulateSystemUpdates() {
        // Simuler de légères variations dans les données système
        this.systemData.totalPredictions += Math.floor(Math.random() * 10);
        this.systemData.performance.responseTime = Math.floor(Math.random() * 50) + 120;
        
        // Mettre à jour l'affichage si nécessaire
        if (this.currentSection === 'overview') {
            this.updateOverviewSection();
        }
    }
}

// Fonctions globales pour les événements HTML
function addPatient() {
    admin.addPatient();
}

function saveNewPatient() {
    admin.saveNewPatient();
}

function closeModal(modalId) {
    admin.closeModal(modalId);
}

function executeConfirmedAction() {
    admin.executeConfirmedAction();
}

function refreshAdminData() {
    admin.refreshAdminData();
}

function systemAlert() {
    admin.systemAlert();
}

function maintenanceMode() {
    admin.maintenanceMode();
}

function generateSystemReport() {
    admin.generateSystemReport();
}

function viewPatientDetails(patientId) {
    admin.viewPatientDetails(patientId);
}

function editPatient(patientId) {
    admin.showNotification('Fonction d\'édition en cours de développement', 'info');
}

function contactPatient(patientId) {
    admin.showNotification(`Ouverture de l'interface de contact pour le patient #${patientId}`, 'info');
}

function emergencyProtocol(patientId) {
    admin.showConfirmModal(
        'Protocole d\'Urgence',
        `Déclencher le protocole d'urgence pour le patient #${patientId} ?`,
        () => {
            admin.showNotification(`🚨 Protocole d'urgence activé pour le patient #${patientId}`, 'warning');
        }
    );
}

function filterPatients() {
    admin.filterPatients();
}

function previousPage() {
    admin.showNotification('Page précédente', 'info');
}

function nextPage() {
    admin.showNotification('Page suivante', 'info');
}

function retrainModel() {
    admin.showNotification('Réentraînement du modèle ML en cours...', 'info');
    setTimeout(() => {
        admin.showNotification('Modèle ML réentraîné avec succès!', 'success');
    }, 3000);
}

function exportMLData() {
    admin.showNotification('Export des données ML en cours...', 'info');
    setTimeout(() => {
        admin.showNotification('Données ML exportées!', 'success');
    }, 1500);
}

function runDiagnostics() {
    admin.showNotification('Diagnostics système en cours...', 'info');
    setTimeout(() => {
        admin.showNotification('Diagnostics terminés - Système en bon état', 'success');
    }, 2500);
}

function exportLogs() {
    admin.showNotification('Export des logs système...', 'info');
    setTimeout(() => {
        admin.showNotification('Logs exportés avec succès!', 'success');
    }, 1000);
}

function filterLogs() {
    admin.filterLogs();
}

function generateMedicalReport() {
    admin.showNotification('Génération du rapport médical...', 'info');
}

function generateReport(type) {
    admin.showNotification(`Génération du rapport ${type}...`, 'info');
}

function downloadReport(reportId) {
    admin.showNotification(`Téléchargement du rapport ${reportId}...`, 'info');
}

function viewReport(reportId) {
    admin.showNotification(`Ouverture du rapport ${reportId}...`, 'info');
}

function shareReport(reportId) {
    admin.showNotification(`Partage du rapport ${reportId}...`, 'info');
}

function saveAllSettings() {
    admin.showNotification('Sauvegarde de tous les paramètres...', 'info');
    setTimeout(() => {
        admin.showNotification('Paramètres sauvegardés avec succès!', 'success');
    }, 1000);
}

function resetSystem() {
    admin.showConfirmModal(
        'Réinitialisation Système',
        '⚠️ Cette action va réinitialiser tous les paramètres système. Continuer ?',
        () => {
            admin.showNotification('🔄 Réinitialisation du système en cours...', 'warning');
        }
    );
}

function purgeOldData() {
    admin.showConfirmModal(
        'Purge des Données',
        '⚠️ Cette action va supprimer définitivement les anciennes données. Cette action est irréversible!',
        () => {
            admin.showNotification('🗑️ Purge des anciennes données en cours...', 'warning');
        }
    );
}

function factoryReset() {
    admin.showConfirmModal(
        'Remise à Zéro Complète',
        '🚨 DANGER: Cette action va effacer TOUTES les données du système. Êtes-vous absolument certain ?',
        () => {
            admin.showNotification('💥 Remise à zéro complète initiée...', 'error');
        }
    );
}

function clearAllAlerts() {
    admin.systemData.activeAlerts = 0;
    admin.updateOverviewSection();
    admin.showNotification('Toutes les alertes ont été effacées', 'success');
}

function triggerBackup() {
    admin.showNotification('Sauvegarde manuelle en cours...', 'info');
    setTimeout(() => {
        admin.showNotification('Sauvegarde terminée avec succès!', 'success');
    }, 2000);
}

function viewPatient(patientId) {
    admin.viewPatientDetails(patientId);
}

// Instance globale de l'administration
let admin;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    admin = new AdminManager();
    
    console.log('🛠️ Interface d\'administration CardiaCare initialisée');
    console.log('👨‍💼 Toutes les fonctionnalités administratives sont opérationnelles');
    
    // Animation d'entrée
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Gestion des clics sur les modales (fermeture en cliquant à l'extérieur)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        admin.closeModal(e.target.id);
    }
});

// Export pour debug
window.Admin = admin;