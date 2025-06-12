// Dashboard JavaScript - Version Complète
class Dashboard {
    constructor() {
        this.data = {
            riskScore: 23,
            consultations: 47,
            medications: 12,
            appointments: 3,
            vitals: {
                bloodPressure: { systolic: 120, diastolic: 80 },
                heartRate: 72,
                cholesterol: 195,
                glucose: 5.8
            }
        };
        
        this.activities = [
            { 
                icon: 'robot', 
                title: 'Consultation IA terminée', 
                time: 'Il y a 2 heures',
                type: 'consultation' 
            },
            { 
                icon: 'pills', 
                title: 'Médicament pris', 
                time: 'Il y a 3 heures',
                type: 'medication' 
            },
            { 
                icon: 'heartbeat', 
                title: 'Données vitales mises à jour', 
                time: 'Hier',
                type: 'vitals' 
            },
            { 
                icon: 'calendar', 
                title: 'RDV cardiologie confirmé', 
                time: 'Il y a 2 jours',
                type: 'appointment' 
            },
            { 
                icon: 'user-md', 
                title: 'Rapport médical généré', 
                time: 'Il y a 3 jours',
                type: 'report' 
            }
        ];
        
        this.alerts = [];
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.startRealTimeUpdates();
        this.checkForAlerts();
        this.animateOnLoad();
    }

    setupEventListeners() {
        // Boutons d'action
        window.showChartDetails = () => this.showChartDetails();
        window.refreshActivity = () => this.refreshActivity();
        window.manageMedications = () => this.manageMedications();
        window.startAssessment = () => this.startAssessment();
        window.exportReport = () => this.exportReport();
        window.dismissAllAlerts = () => this.dismissAllAlerts();
        window.closeModal = () => this.closeModal();
        
        // Événements de redimensionnement
        window.addEventListener('resize', () => this.handleResize());
        
        // Gestion des clics sur les métriques
        this.setupMetricClickHandlers();
        
        // Mise à jour au focus de la page
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateDashboard();
            }
        });
    }

    setupMetricClickHandlers() {
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach(card => {
            card.addEventListener('click', () => {
                const label = card.querySelector('.metric-label').textContent;
                this.showMetricDetails(label, card.querySelector('.metric-value').textContent);
            });
        });
    }

    updateDashboard() {
        this.updateStats();
        this.updateVitals();
        this.updateActivities();
        this.simulateDataChanges();
    }

    updateStats() {
        // Mise à jour des statistiques principales
        document.getElementById('riskScore').textContent = this.data.riskScore + '%';
        document.getElementById('consultationsCount').textContent = this.data.consultations;
        document.getElementById('medicationsCount').textContent = this.data.medications;
        document.getElementById('appointmentsCount').textContent = this.data.appointments;
        
        // Mise à jour de la couleur du risque
        this.updateRiskColor();
    }

    updateRiskColor() {
        const riskElement = document.getElementById('riskScore');
        const widget = riskElement.closest('.stat-widget');
        const riskValue = this.data.riskScore;
        
        // Supprimer les classes existantes
        widget.classList.remove('risk-low', 'risk-moderate', 'risk-high');
        
        if (riskValue < 30) {
            widget.style.borderLeftColor = 'var(--medical-green)';
            riskElement.style.color = 'var(--medical-green)';
            widget.classList.add('risk-low');
        } else if (riskValue < 60) {
            widget.style.borderLeftColor = 'var(--accent-color)';
            riskElement.style.color = 'var(--accent-color)';
            widget.classList.add('risk-moderate');
        } else {
            widget.style.borderLeftColor = 'var(--danger-color)';
            riskElement.style.color = 'var(--danger-color)';
            widget.classList.add('risk-high');
        }
    }

    updateVitals() {
        const vitals = this.data.vitals;
        
        document.getElementById('bloodPressure').textContent = 
            `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`;
        document.getElementById('heartRate').textContent = vitals.heartRate;
        document.getElementById('cholesterol').textContent = vitals.cholesterol;
        document.getElementById('glucose').textContent = vitals.glucose;
    }

    updateActivities() {
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = '';
        
        this.activities.forEach(activity => {
            const li = document.createElement('li');
            li.className = 'activity-item';
            li.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-title">${activity.title}</p>
                    <p class="activity-time">${activity.time}</p>
                </div>
            `;
            
            // Animation d'entrée
            li.style.opacity = '0';
            li.style.transform = 'translateX(-20px)';
            activityList.appendChild(li);
            
            setTimeout(() => {
                li.style.transition = 'all 0.3s ease';
                li.style.opacity = '1';
                li.style.transform = 'translateX(0)';
            }, 100);
        });
    }

    simulateDataChanges() {
        // Simulation de variations réalistes des données
        const variations = {
            riskScore: (Math.random() - 0.5) * 2, // ±1%
            heartRate: (Math.random() - 0.5) * 4, // ±2 bpm
            bloodPressure: (Math.random() - 0.5) * 6, // ±3 mmHg
            cholesterol: (Math.random() - 0.5) * 8, // ±4 mg/dL
            glucose: (Math.random() - 0.5) * 0.4 // ±0.2 mmol/L
        };
        
        // Appliquer les variations avec des limites réalistes
        this.data.riskScore = Math.max(5, Math.min(95, this.data.riskScore + variations.riskScore));
        this.data.vitals.heartRate = Math.max(50, Math.min(120, this.data.vitals.heartRate + variations.heartRate));
        this.data.vitals.bloodPressure.systolic = Math.max(90, Math.min(180, 
            this.data.vitals.bloodPressure.systolic + variations.bloodPressure));
        this.data.vitals.cholesterol = Math.max(150, Math.min(300, 
            this.data.vitals.cholesterol + variations.cholesterol));
        this.data.vitals.glucose = Math.max(4.0, Math.min(8.0, 
            this.data.vitals.glucose + variations.glucose));
        
        // Arrondir les valeurs
        this.data.riskScore = Math.round(this.data.riskScore);
        this.data.vitals.heartRate = Math.round(this.data.vitals.heartRate);
        this.data.vitals.bloodPressure.systolic = Math.round(this.data.vitals.bloodPressure.systolic);
        this.data.vitals.cholesterol = Math.round(this.data.vitals.cholesterol);
        this.data.vitals.glucose = Math.round(this.data.vitals.glucose * 10) / 10;
    }

    startRealTimeUpdates() {
        // Mise à jour toutes les 30 secondes
        this.updateInterval = setInterval(() => {
            this.updateDashboard();
            this.checkForAlerts();
        }, 30000);
    }

    checkForAlerts() {
        const newAlerts = [];
        
        // Vérifier le risque cardiaque
        if (this.data.riskScore > 70) {
            newAlerts.push({
                type: 'danger',
                title: 'Risque Cardiaque Élevé',
                message: 'Votre risque cardiaque a dépassé 70%. Consultez rapidement un médecin.',
                action: 'Contacter médecin'
            });
        }
        
        // Vérifier la tension artérielle
        if (this.data.vitals.bloodPressure.systolic > 140) {
            newAlerts.push({
                type: 'warning',
                title: 'Tension Artérielle Élevée',
                message: `Tension systolique à ${this.data.vitals.bloodPressure.systolic} mmHg. Surveillez attentivement.`,
                action: 'Surveiller tension'
            });
        }
        
        // Vérifier la fréquence cardiaque
        if (this.data.vitals.heartRate > 100 || this.data.vitals.heartRate < 60) {
            newAlerts.push({
                type: 'warning',
                title: 'Fréquence Cardiaque Anormale',
                message: `Fréquence cardiaque à ${this.data.vitals.heartRate} bpm. Vérification recommandée.`,
                action: 'Vérifier rythme'
            });
        }
        
        // Mettre à jour les alertes si nécessaire
        if (newAlerts.length > 0) {
            this.alerts = newAlerts;
            this.displayAlerts();
        }
    }

    displayAlerts() {
        const alertsSection = document.getElementById('alertsSection');
        const alertsList = document.getElementById('alertsList');
        
        if (this.alerts.length === 0) {
            alertsSection.style.display = 'none';
            return;
        }
        
        alertsSection.style.display = 'block';
        alertsList.innerHTML = '';
        
        this.alerts.forEach((alert, index) => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-item';
            alertDiv.innerHTML = `
                <div class="alert-icon">
                    <i class="fas fa-${alert.type === 'danger' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
                </div>
                <div class="alert-content">
                    <p class="alert-title">${alert.title}</p>
                    <p class="alert-message">${alert.message}</p>
                </div>
                <div class="alert-actions">
                    <button class="alert-btn primary" onclick="dashboard.handleAlert(${index})">${alert.action}</button>
                    <button class="alert-btn secondary" onclick="dashboard.dismissAlert(${index})">Ignorer</button>
                </div>
            `;
            alertsList.appendChild(alertDiv);
        });
    }

    handleAlert(index) {
        const alert = this.alerts[index];
        switch (alert.action) {
            case 'Contacter médecin':
                this.showContactModal();
                break;
            case 'Surveiller tension':
                this.showTensionModal();
                break;
            case 'Vérifier rythme':
                this.showHeartRateModal();
                break;
        }
        this.dismissAlert(index);
    }

    dismissAlert(index) {
        this.alerts.splice(index, 1);
        this.displayAlerts();
    }

    dismissAllAlerts() {
        this.alerts = [];
        this.displayAlerts();
        this.showNotification('Toutes les alertes ont été effacées', 'success');
    }

    // Fonctions pour les modales
    showChartDetails() {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Évolution du Risque Cardiaque';
        modalBody.innerHTML = `
            <div class="chart-details">
                <h4>Analyse des 30 derniers jours</h4>
                <p>Votre risque cardiaque a évolué de <strong>25%</strong> à <strong>${this.data.riskScore}%</strong>.</p>
                <div class="trend-analysis">
                    <h5>Tendances observées :</h5>
                    <ul>
                        <li>📈 Légère augmentation depuis la semaine dernière</li>
                        <li>🎯 Objectif recommandé : < 30%</li>
                        <li>📊 Moyenne des patients similaires : 28%</li>
                    </ul>
                </div>
                <div class="recommendations">
                    <h5>Recommandations :</h5>
                    <ul>
                        <li>Maintenir une activité physique régulière</li>
                        <li>Surveiller l'alimentation (réduire le sel)</li>
                        <li>Prendre les médicaments selon prescription</li>
                        <li>Consultation de suivi dans 2 semaines</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal();
    }

    showMetricDetails(label, value) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = `Détails - ${label}`;
        
        let content = '';
        switch (label) {
            case 'Tension':
                content = `
                    <h4>Tension Artérielle : ${value} mmHg</h4>
                    <p><strong>Valeurs normales :</strong> < 120/80 mmHg</p>
                    <p><strong>Votre statut :</strong> ${this.getTensionStatus()}</p>
                    <h5>Historique récent :</h5>
                    <ul>
                        <li>Aujourd'hui : ${value} mmHg</li>
                        <li>Hier : 118/78 mmHg</li>
                        <li>Il y a 2 jours : 122/82 mmHg</li>
                    </ul>
                `;
                break;
            case 'BPM':
                content = `
                    <h4>Fréquence Cardiaque : ${value} bpm</h4>
                    <p><strong>Valeurs normales :</strong> 60-100 bpm au repos</p>
                    <p><strong>Votre statut :</strong> ${this.getHeartRateStatus()}</p>
                    <h5>Conseils :</h5>
                    <ul>
                        <li>Mesurez votre pouls au repos</li>
                        <li>Notez les variations avec l'activité</li>
                        <li>Consultez si > 100 bpm au repos</li>
                    </ul>
                `;
                break;
            case 'Cholestérol':
                content = `
                    <h4>Cholestérol Total : ${value} mg/dL</h4>
                    <p><strong>Valeurs recommandées :</strong> < 200 mg/dL</p>
                    <p><strong>Votre statut :</strong> ${this.getCholesterolStatus()}</p>
                    <h5>Actions recommandées :</h5>
                    <ul>
                        <li>Alimentation pauvre en graisses saturées</li>
                        <li>Exercice physique régulier</li>
                        <li>Contrôle annuel recommandé</li>
                    </ul>
                `;
                break;
            case 'Glycémie':
                content = `
                    <h4>Glycémie : ${value} mmol/L</h4>
                    <p><strong>Valeurs normales :</strong> 4.0-6.0 mmol/L à jeun</p>
                    <p><strong>Votre statut :</strong> ${this.getGlucoseStatus()}</p>
                    <h5>Surveillance :</h5>
                    <ul>
                        <li>Mesure à jeun recommandée</li>
                        <li>Évitez les sucres rapides</li>
                        <li>Activité physique bénéfique</li>
                    </ul>
                `;
                break;
        }
        
        modalBody.innerHTML = content;
        this.showModal();
    }

    getTensionStatus() {
        const systolic = this.data.vitals.bloodPressure.systolic;
        if (systolic < 120) return 'Normale ✅';
        if (systolic < 130) return 'Élevée normale ⚠️';
        if (systolic < 140) return 'Hypertension légère ⚠️';
        return 'Hypertension modérée ❗';
    }

    getHeartRateStatus() {
        const hr = this.data.vitals.heartRate;
        if (hr < 60) return 'Bradycardie ⚠️';
        if (hr <= 100) return 'Normale ✅';
        return 'Tachycardie ⚠️';
    }

    getCholesterolStatus() {
        const chol = this.data.vitals.cholesterol;
        if (chol < 200) return 'Optimal ✅';
        if (chol < 240) return 'Limite haute ⚠️';
        return 'Élevé ❗';
    }

    getGlucoseStatus() {
        const glucose = this.data.vitals.glucose;
        if (glucose < 6.0) return 'Normale ✅';
        if (glucose < 7.0) return 'Limite haute ⚠️';
        return 'Élevée ❗';
    }

    showContactModal() {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Contacts Médicaux d\'Urgence';
        modalBody.innerHTML = `
            <div class="emergency-contacts">
                <h4>Numéros d'urgence :</h4>
                <div class="contact-list">
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <strong>SAMU :</strong> 15
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-ambulance"></i>
                        <strong>Urgences :</strong> 112
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-user-md"></i>
                        <strong>Votre cardiologue :</strong> 05 35 XX XX XX
                    </div>
                </div>
                <p class="warning">⚠️ En cas de douleur thoracique intense, appelez immédiatement le 15.</p>
            </div>
        `;
        
        this.showModal();
    }

    showTensionModal() {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Surveillance de la Tension';
        modalBody.innerHTML = `
            <div class="tension-guide">
                <h4>Comment surveiller votre tension :</h4>
                <ol>
                    <li>Restez au calme 5 minutes avant la mesure</li>
                    <li>Asseyez-vous, pieds au sol</li>
                    <li>Placez le brassard au niveau du cœur</li>
                    <li>Effectuez 3 mesures à 1 minute d'intervalle</li>
                    <li>Notez la moyenne des 2 dernières mesures</li>
                </ol>
                <div class="tension-values">
                    <h5>Valeurs de référence :</h5>
                    <ul>
                        <li>Normal : < 120/80 mmHg</li>
                        <li>Élevé normal : 120-129/80-84 mmHg</li>
                        <li>Hypertension : ≥ 140/90 mmHg</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal();
    }

    showHeartRateModal() {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Vérification du Rythme Cardiaque';
        modalBody.innerHTML = `
            <div class="heartrate-guide">
                <h4>Auto-examen du pouls :</h4>
                <ol>
                    <li>Placez 2 doigts sur votre poignet</li>
                    <li>Trouvez le pouls de l'artère radiale</li>
                    <li>Comptez les battements pendant 15 secondes</li>
                    <li>Multipliez par 4 pour obtenir le rythme/minute</li>
                </ol>
                <div class="heartrate-info">
                    <h5>Quand consulter :</h5>
                    <ul>
                        <li>Rythme < 60 bpm au repos</li>
                        <li>Rythme > 100 bpm au repos</li>
                        <li>Rythme irrégulier</li>
                        <li>Palpitations fréquentes</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal();
    }

    showModal() {
        document.getElementById('detailsModal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('detailsModal').style.display = 'none';
    }

    // Autres fonctions d'action
    refreshActivity() {
        // Ajouter une nouvelle activité
        const newActivity = {
            icon: 'sync',
            title: 'Données actualisées',
            time: 'À l\'instant',
            type: 'update'
        };
        
        this.activities.unshift(newActivity);
        if (this.activities.length > 10) {
            this.activities.pop();
        }
        
        this.updateActivities();
        this.showNotification('Activités actualisées', 'success');
    }

    manageMedications() {
        window.location.href = 'chat.html#medications';
    }

    startAssessment() {
        window.location.href = 'chat.html#assessment';
    }

    exportReport() {
        this.showNotification('Génération du rapport PDF en cours...', 'info');
    // Redirige vers l'endpoint Flask qui sert le PDF
    window.location.href = '/generate-pdf-report';
    }
    generateRecommendations() {
        const recommendations = [];
        
        if (this.data.riskScore > 50) {
            recommendations.push('Consultation cardiologique recommandée');
        }
        
        if (this.data.vitals.bloodPressure.systolic > 130) {
            recommendations.push('Surveiller la tension artérielle quotidiennement');
        }
        
        if (this.data.vitals.cholesterol > 200) {
            recommendations.push('Régime pauvre en graisses saturées');
        }
        
        recommendations.push('Activité physique régulière (30 min/jour)');
        recommendations.push('Suivi médical régulier');
        
        return recommendations;
    }

    // Fonctions utilitaires
    animateOnLoad() {
        const elements = document.querySelectorAll('.stat-widget, .dashboard-card, .action-card');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        const dashboardTitle = document.querySelector('.dashboard-title');
        
        if (isMobile) {
            dashboardTitle.style.flexDirection = 'column';
            dashboardTitle.style.textAlign = 'center';
            dashboardTitle.style.gap = '1rem';
        } else {
            dashboardTitle.style.flexDirection = 'row';
            dashboardTitle.style.textAlign = 'left';
            dashboardTitle.style.gap = '0';
        }
    }

    showNotification(message, type = 'info') {
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            min-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-suppression
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
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

    // Gestion des données simulées pour démo
    simulateNewConsultation() {
        this.data.consultations += 1;
        this.activities.unshift({
            icon: 'robot',
            title: 'Nouvelle consultation IA',
            time: 'À l\'instant',
            type: 'consultation'
        });
        
        this.updateDashboard();
        this.showNotification('Nouvelle consultation enregistrée', 'success');
    }

    simulateMedicationTaken() {
        this.activities.unshift({
            icon: 'pills',
            title: 'Médicament confirmé pris',
            time: 'À l\'instant',
            type: 'medication'
        });
        
        this.updateDashboard();
        this.showNotification('Prise de médicament confirmée', 'success');
    }

    simulateVitalsUpdate() {
        // Légère variation des constantes vitales
        this.data.vitals.heartRate += (Math.random() - 0.5) * 6;
        this.data.vitals.bloodPressure.systolic += (Math.random() - 0.5) * 8;
        this.data.vitals.cholesterol += (Math.random() - 0.5) * 10;
        
        this.activities.unshift({
            icon: 'heartbeat',
            title: 'Constantes vitales mises à jour',
            time: 'À l\'instant',
            type: 'vitals'
        });
        
        this.updateDashboard();
        this.showNotification('Données vitales actualisées', 'info');
    }

    // Fonctions de performance et monitoring
    getPerformanceMetrics() {
        return {
            totalUpdates: this.activities.filter(a => a.type === 'update').length,
            currentRisk: this.data.riskScore,
            vitalsStatus: this.getVitalsStatus(),
            alertsCount: this.alerts.length,
            lastUpdate: new Date().toISOString()
        };
    }

    getVitalsStatus() {
        const vitals = this.data.vitals;
        const status = {
            bloodPressure: vitals.bloodPressure.systolic < 130 ? 'normal' : 'elevated',
            heartRate: (vitals.heartRate >= 60 && vitals.heartRate <= 100) ? 'normal' : 'abnormal',
            cholesterol: vitals.cholesterol < 200 ? 'normal' : 'elevated',
            glucose: vitals.glucose < 6.0 ? 'normal' : 'elevated'
        };
        
        return status;
    }

    // Fonction de nettoyage et maintenance
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Nettoyer les event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.updateDashboard);
        
        console.log('Dashboard cleanup completed');
    }

    // Export des données pour debug
    exportDebugData() {
        return {
            data: this.data,
            activities: this.activities,
            alerts: this.alerts,
            performance: this.getPerformanceMetrics(),
            timestamp: new Date().toISOString()
        };
    }

    // Import de données (pour restauration)
    importData(importedData) {
        if (importedData.data) {
            this.data = { ...this.data, ...importedData.data };
        }
        if (importedData.activities) {
            this.activities = importedData.activities;
        }
        if (importedData.alerts) {
            this.alerts = importedData.alerts;
        }
        
        this.updateDashboard();
        this.displayAlerts();
        this.showNotification('Données importées avec succès', 'success');
    }

    // Fonction de test pour développement
    runTests() {
        console.log('🧪 Tests du Dashboard...');
        
        // Test mise à jour des stats
        const originalRisk = this.data.riskScore;
        this.data.riskScore = 85;
        this.updateStats();
        console.log('✅ Test mise à jour stats - OK');
        
        // Test alertes
        this.checkForAlerts();
        console.log('✅ Test système d\'alertes - OK');
        
        // Test notifications
        this.showNotification('Test notification', 'success');
        console.log('✅ Test notifications - OK');
        
        // Restaurer les données
        this.data.riskScore = originalRisk;
        this.updateStats();
        
        console.log('🎉 Tous les tests réussis !');
    }
}

// Classe pour la gestion des graphiques (simulation)
class ChartManager {
    constructor() {
        this.chartData = this.generateMockData();
    }

    generateMockData() {
        const data = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Génération de données réalistes avec tendance
            const baseRisk = 25;
            const variation = Math.sin(i * 0.2) * 5 + (Math.random() - 0.5) * 8;
            const risk = Math.max(10, Math.min(60, baseRisk + variation));
            
            data.push({
                date: date.toISOString().split('T')[0],
                risk: Math.round(risk),
                heartRate: Math.round(70 + (Math.random() - 0.5) * 20),
                bloodPressure: Math.round(120 + (Math.random() - 0.5) * 30)
            });
        }
        
        return data;
    }

    renderRiskChart(containerId) {
        // Simulation d'affichage de graphique
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="mock-chart">
                <div class="chart-title">Évolution du Risque (30 jours)</div>
                <div class="chart-line">
                    ${this.chartData.map((point, index) => `
                        <div class="chart-point" style="
                            left: ${(index / (this.chartData.length - 1)) * 100}%;
                            bottom: ${(point.risk / 100) * 80 + 10}%;
                        " title="${point.date}: ${point.risk}%"></div>
                    `).join('')}
                </div>
                <div class="chart-axis">
                    <span>Il y a 30j</span>
                    <span>Aujourd'hui</span>
                </div>
            </div>
        `;
    }

    getLatestTrend() {
        if (this.chartData.length < 7) return 'insufficient_data';
        
        const recent = this.chartData.slice(-7);
        const older = this.chartData.slice(-14, -7);
        
        const recentAvg = recent.reduce((sum, point) => sum + point.risk, 0) / recent.length;
        const olderAvg = older.reduce((sum, point) => sum + point.risk, 0) / older.length;
        
        const change = recentAvg - olderAvg;
        
        if (Math.abs(change) < 2) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }
}

// Classe pour la gestion des médicaments
class MedicationManager {
    constructor() {
        this.medications = [
            {
                id: 1,
                name: 'Aspirine',
                dosage: '100mg',
                frequency: 'Une fois par jour',
                nextDose: new Date(Date.now() + 30 * 60 * 1000), // Dans 30 min
                taken: false
            },
            {
                id: 2,
                name: 'Lisinopril',
                dosage: '10mg',
                frequency: 'Une fois par jour',
                nextDose: new Date(Date.now() + 2 * 60 * 60 * 1000), // Dans 2h
                taken: false
            },
            {
                id: 3,
                name: 'Atorvastatine',
                dosage: '20mg',
                frequency: 'Le soir',
                nextDose: new Date(Date.now() + 8 * 60 * 60 * 1000), // Ce soir
                taken: false
            }
        ];
    }

    getUpcomingMedications() {
        const now = new Date();
        return this.medications
            .filter(med => !med.taken && med.nextDose > now)
            .sort((a, b) => a.nextDose - b.nextDose);
    }

    markAsTaken(medicationId) {
        const medication = this.medications.find(med => med.id === medicationId);
        if (medication) {
            medication.taken = true;
            // Programmer la prochaine dose (exemple: +24h)
            medication.nextDose = new Date(medication.nextDose.getTime() + 24 * 60 * 60 * 1000);
            medication.taken = false; // Reset pour la prochaine dose
        }
    }

    getAdherenceRate() {
        // Calcul simulé du taux d'observance
        return Math.round(85 + Math.random() * 10); // 85-95%
    }
}

// Initialisation globale
let dashboard, chartManager, medicationManager;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du Dashboard CardiaCare...');
    
    try {
        // Créer les instances principales
        dashboard = new Dashboard();
        chartManager = new ChartManager();
        medicationManager = new MedicationManager();
        
        // Exposition globale pour le debug
        window.Dashboard = dashboard;
        window.ChartManager = chartManager;
        window.MedicationManager = medicationManager;
        
        // Fonctions utilitaires globales
        window.DashboardUtils = {
            exportData: () => dashboard.exportDebugData(),
            importData: (data) => dashboard.importData(data),
            runTests: () => dashboard.runTests(),
            simulateConsultation: () => dashboard.simulateNewConsultation(),
            simulateMedication: () => dashboard.simulateMedicationTaken(),
            simulateVitals: () => dashboard.simulateVitalsUpdate(),
            getMetrics: () => dashboard.getPerformanceMetrics()
        };
        
        // Message de succès
        setTimeout(() => {
            dashboard.showNotification('Dashboard CardiaCare initialisé avec succès', 'success');
        }, 1000);
        
        console.log('✅ Dashboard CardiaCare prêt !');
        console.log('💡 Utilisez DashboardUtils pour accéder aux outils de développement');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du dashboard:', error);
    }
});

// Nettoyage à la fermeture de la page
window.addEventListener('beforeunload', function() {
    if (dashboard) {
        dashboard.cleanup();
    }
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur Dashboard:', e.error);
    if (dashboard) {
        dashboard.showNotification('Une erreur est survenue', 'error');
    }
});

// CSS additionnel pour les graphiques simulés
const additionalStyles = `
    <style>
        .mock-chart {
            position: relative;
            height: 100%;
            padding: 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 8px;
        }
        
        .chart-title {
            text-align: center;
            font-weight: 600;
            color: var(--gray-700);
            margin-bottom: 20px;
        }
        
        .chart-line {
            position: relative;
            height: 200px;
            background: linear-gradient(to top, rgba(37, 99, 235, 0.1) 0%, transparent 100%);
            border-radius: 4px;
        }
        
        .chart-point {
            position: absolute;
            width: 8px;
            height: 8px;
            background: var(--primary-color);
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transform: translate(-50%, 50%);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .chart-point:hover {
            transform: translate(-50%, 50%) scale(1.5);
            z-index: 10;
        }
        
        .chart-axis {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 0.8rem;
            color: var(--gray-600);
        }
        
        .notification {
            font-family: 'Inter', sans-serif;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    </style>
`;

// Injection des styles additionnels
document.head.insertAdjacentHTML('beforeend', additionalStyles);

console.log('📊 Dashboard CardiaCare - Version complète chargée');