// Test Cardiaque IA - JavaScript
class CardiacTest {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.testData = {};
        this.init();
    }

    init() {
        this.updateProgress();
        this.setupEventListeners();
        this.showStep(1);
    }

    setupEventListeners() {
        // Validation en temps réel des champs
        document.addEventListener('input', (e) => {
            if (e.target.type === 'number' || e.target.type === 'text') {
                this.validateField(e.target);
            }
        });

        // Gestion des changements de radio et checkbox
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' || e.target.type === 'checkbox') {
                this.saveCurrentStepData();
            }
        });

        // Gestion des raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const activeStep = document.querySelector('.test-step.active');
                const nextBtn = activeStep.querySelector('.btn-next, .btn-analyze');
                if (nextBtn && !nextBtn.disabled) {
                    nextBtn.click();
                }
            }
        });
    }

    validateField(field) {
        const value = parseInt(field.value);
        let isValid = true;
        let message = '';

        switch (field.id) {
            case 'age':
                if (value < 18 || value > 120) {
                    isValid = false;
                    message = 'Âge doit être entre 18 et 120 ans';
                }
                break;
            case 'bloodPressure':
                if (field.value && (value < 70 || value > 300)) {
                    isValid = false;
                    message = 'Tension artérielle incorrecte (70-300 mmHg)';
                }
                break;
            case 'cholesterol':
                if (field.value && (value < 100 || value > 600)) {
                    isValid = false;
                    message = 'Cholestérol incorrect (100-600 mg/dL)';
                }
                break;
            case 'heartRate':
                if (field.value && (value < 30 || value > 250)) {
                    isValid = false;
                    message = 'Fréquence cardiaque incorrecte (30-250 bpm)';
                }
                break;
        }

        // Afficher/masquer le message d'erreur
        this.showFieldValidation(field, isValid, message);
        return isValid;
    }

    showFieldValidation(field, isValid, message) {
        // Supprimer l'ancien message d'erreur
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid && message) {
            field.style.borderColor = 'var(--danger-color)';
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.cssText = `
                color: var(--danger-color);
                font-size: 0.8rem;
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            `;
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            field.parentNode.appendChild(errorDiv);
        } else {
            field.style.borderColor = isValid ? 'var(--medical-green)' : 'var(--gray-200)';
        }
    }

    showStep(stepNumber) {
        // Masquer toutes les étapes
        document.querySelectorAll('.test-step').forEach(step => {
            step.classList.remove('active');
        });

        // Afficher l'étape demandée
        const targetStep = document.getElementById(`step${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
            this.currentStep = stepNumber;
            this.updateProgress();
            
            // Focus sur le premier champ
            setTimeout(() => {
                const firstInput = targetStep.querySelector('input');
                if (firstInput && firstInput.type !== 'radio' && firstInput.type !== 'checkbox') {
                    firstInput.focus();
                }
            }, 300);
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        const percentage = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = percentage + '%';
        
        if (this.currentStep <= 4) {
            progressText.textContent = `Étape ${this.currentStep} sur 4`;
        } else {
            progressText.textContent = 'Résultats';
        }
    }

    validateCurrentStep() {
        const currentStepEl = document.getElementById(`step${this.currentStep}`);
        let isValid = true;
        let errors = [];

        switch (this.currentStep) {
            case 1:
                // Validation âge et sexe
                const age = document.getElementById('age').value;
                const gender = document.querySelector('input[name="gender"]:checked');
                
                if (!age || parseInt(age) < 18 || parseInt(age) > 120) {
                    errors.push('Veuillez entrer un âge valide (18-120 ans)');
                    isValid = false;
                }
                
                if (!gender) {
                    errors.push('Veuillez sélectionner votre sexe');
                    isValid = false;
                }
                break;

            case 2:
                // Validation des données vitales (optionnelles mais vérifiées si remplies)
                const bloodPressure = document.getElementById('bloodPressure');
                const cholesterol = document.getElementById('cholesterol');
                const heartRate = document.getElementById('heartRate');
                
                if (bloodPressure.value && !this.validateField(bloodPressure)) isValid = false;
                if (cholesterol.value && !this.validateField(cholesterol)) isValid = false;
                if (heartRate.value && !this.validateField(heartRate)) isValid = false;
                break;

            case 3:
                // Validation des facteurs de risque (au moins une réponse)
                const smokingAnswered = document.querySelector('input[name="smoking"]:checked');
                const diabetesAnswered = document.querySelector('input[name="diabetes"]:checked');
                const familyAnswered = document.querySelector('input[name="familyHistory"]:checked');
                
                if (!smokingAnswered || !diabetesAnswered || !familyAnswered) {
                    errors.push('Veuillez répondre à toutes les questions sur les facteurs de risque');
                    isValid = false;
                }
                break;

            case 4:
                // Validation activité physique
                const activity = document.querySelector('input[name="activity"]:checked');
                if (!activity) {
                    errors.push('Veuillez sélectionner votre niveau d\'activité physique');
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            this.showStepErrors(errors);
        }

        return isValid;
    }

    showStepErrors(errors) {
        // Supprimer les anciens messages d'erreur
        const existingErrors = document.querySelectorAll('.step-error');
        existingErrors.forEach(error => error.remove());

        if (errors.length > 0) {
            const currentStepEl = document.getElementById(`step${this.currentStep}`);
            const stepActions = currentStepEl.querySelector('.step-actions');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'step-error';
            errorDiv.style.cssText = `
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
            `;
            
            errorDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; margin-bottom: 0.5rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Veuillez corriger les erreurs suivantes :
                </div>
                <ul style="margin: 0; padding-left: 1.5rem;">
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            `;
            
            stepActions.parentNode.insertBefore(errorDiv, stepActions);
        }
    }

    saveCurrentStepData() {
        const currentStepEl = document.getElementById(`step${this.currentStep}`);
        
        switch (this.currentStep) {
            case 1:
                this.testData.age = parseInt(document.getElementById('age').value) || null;
                const gender = document.querySelector('input[name="gender"]:checked');
                this.testData.gender = gender ? gender.value : null;
                break;

            case 2:
                this.testData.bloodPressure = parseInt(document.getElementById('bloodPressure').value) || null;
                this.testData.cholesterol = parseInt(document.getElementById('cholesterol').value) || null;
                this.testData.heartRate = parseInt(document.getElementById('heartRate').value) || null;
                break;

            case 3:
                const smoking = document.querySelector('input[name="smoking"]:checked');
                const diabetes = document.querySelector('input[name="diabetes"]:checked');
                const familyHistory = document.querySelector('input[name="familyHistory"]:checked');
                
                this.testData.smoking = smoking ? smoking.value === 'true' : null;
                this.testData.diabetes = diabetes ? diabetes.value === 'true' : null;
                this.testData.familyHistory = familyHistory ? familyHistory.value === 'true' : null;
                break;

            case 4:
                // Symptômes
                const symptoms = [];
                document.querySelectorAll('input[name="symptoms"]:checked').forEach(symptom => {
                    symptoms.push(symptom.value);
                });
                this.testData.symptoms = symptoms;
                
                // Activité physique
                const activity = document.querySelector('input[name="activity"]:checked');
                this.testData.activity = activity ? activity.value : null;
                break;
        }
    }

    nextStep() {
        // Sauvegarder les données de l'étape actuelle
        this.saveCurrentStepData();
        
        // Valider l'étape actuelle
        if (!this.validateCurrentStep()) {
            return;
        }

        // Passer à l'étape suivante
        if (this.currentStep < this.totalSteps - 1) {
            this.showStep(this.currentStep + 1);
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    async analyzeRisk() {
        // Sauvegarder les données de la dernière étape
        this.saveCurrentStepData();
        
        // Valider la dernière étape
        if (!this.validateCurrentStep()) {
            return;
        }

        // Afficher le modal de chargement
        this.showLoadingModal();

        try {
            // Attendre un peu pour l'effet visuel
            await this.simulateAnalysis();
            
            // Analyser le risque avec l'IA
            let prediction;
            if (window.predictHeartRisk) {
                prediction = await window.predictHeartRisk(this.testData);
            } else {
                prediction = this.calculateBasicRisk();
            }
            
            // Afficher les résultats
            this.hideLoadingModal();
            this.displayResults(prediction);
            this.showStep(5);
            
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            this.hideLoadingModal();
            this.showStepErrors(['Une erreur est survenue lors de l\'analyse. Veuillez réessayer.']);
        }
    }

    async simulateAnalysis() {
        // Simulation des étapes d'analyse
        const steps = ['loadingStep2', 'loadingStep3'];
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const step = document.getElementById(steps[i]);
            if (step) {
                step.classList.add('active');
            }
        }
    }

    calculateBasicRisk() {
        // Algorithme simplifié si le ML n'est pas disponible
        let riskScore = 0;
        let factors = [];
        
        // Facteurs d'âge
        if (this.testData.age > 65) {
            riskScore += 30;
            factors.push('Âge avancé (>65 ans)');
        } else if (this.testData.age > 55) {
            riskScore += 20;
            factors.push('Âge modéré (55-65 ans)');
        } else if (this.testData.age > 45) {
            riskScore += 10;
        }
        
        // Facteur de genre
        if (this.testData.gender === 'M' && this.testData.age > 45) {
            riskScore += 15;
            factors.push('Sexe masculin + âge');
        }
        
        // Facteurs de risque
        if (this.testData.smoking) {
            riskScore += 25;
            factors.push('Tabagisme actif');
        }
        
        if (this.testData.diabetes) {
            riskScore += 20;
            factors.push('Diabète');
        }
        
        if (this.testData.familyHistory) {
            riskScore += 15;
            factors.push('Antécédents familiaux');
        }
        
        // Données vitales
        if (this.testData.bloodPressure > 140) {
            riskScore += 20;
            factors.push('Hypertension artérielle');
        }
        
        if (this.testData.cholesterol > 240) {
            riskScore += 15;
            factors.push('Hypercholestérolémie');
        }
        
        // Symptômes
        if (this.testData.symptoms.includes('chest_pain')) {
            riskScore += 25;
            factors.push('Douleurs thoraciques');
        }
        
        if (this.testData.symptoms.includes('shortness_breath')) {
            riskScore += 20;
            factors.push('Essoufflement');
        }
        
        // Activité physique
        if (this.testData.activity === 'low') {
            riskScore += 10;
            factors.push('Sédentarité');
        } else if (this.testData.activity === 'high') {
            riskScore -= 10; // Facteur protecteur
        }
        
        // Normaliser le score (0-100)
        riskScore = Math.max(0, Math.min(100, riskScore));
        
        // Déterminer le niveau de risque
        let level;
        if (riskScore < 30) level = 'low';
        else if (riskScore < 70) level = 'moderate';
        else level = 'high';
        
        return {
            riskLevel: level,
            percentage: riskScore,
            factors: factors,
            recommendations: this.generateRecommendations(level, factors)
        };
    }

    generateRecommendations(level, factors) {
        const recommendations = [];
        
        // Recommandations générales
        recommendations.push('Maintenir une alimentation équilibrée');
        recommendations.push('Pratiquer une activité physique régulière');
        
        // Recommandations spécifiques au niveau de risque
        switch (level) {
            case 'low':
                recommendations.push('Continuer vos bonnes habitudes de vie');
                recommendations.push('Contrôle médical annuel recommandé');
                break;
            case 'moderate':
                recommendations.push('Surveillance médicale tous les 6 mois');
                recommendations.push('Considérer une consultation cardiologique');
                recommendations.push('Surveiller la tension artérielle régulièrement');
                break;
            case 'high':
                recommendations.push('⚠️ Consultation cardiologique urgente recommandée');
                recommendations.push('Surveillance médicale rapprochée');
                recommendations.push('Suivi strict des prescriptions médicales');
                break;
        }
        
        // Recommandations basées sur les facteurs de risque
        if (factors.includes('Tabagisme actif')) {
            recommendations.push('🚭 Arrêt du tabac PRIORITAIRE - consultez votre médecin');
        }
        
        if (factors.includes('Diabète')) {
            recommendations.push('📊 Contrôle strict de la glycémie');
        }
        
        if (factors.includes('Hypertension artérielle')) {
            recommendations.push('🩺 Surveillance quotidienne de la tension');
        }
        
        if (factors.includes('Sédentarité')) {
            recommendations.push('🏃‍♂️ Augmenter progressivement l\'activité physique');
        }
        
        return recommendations;
    }

    showLoadingModal() {
        const modal = document.getElementById('loadingModal');
        modal.classList.add('active');
    }

    hideLoadingModal() {
        const modal = document.getElementById('loadingModal');
        modal.classList.remove('active');
    }

    displayResults(prediction) {
        const riskResult = document.getElementById('riskResult');
        const recommendations = document.getElementById('recommendations');
        
        // Affichage du niveau de risque
        const riskConfig = {
            low: { 
                text: 'Risque Faible', 
                icon: '💚', 
                class: 'low',
                description: 'Votre risque cardiaque est faible. Continuez vos bonnes habitudes !'
            },
            moderate: { 
                text: 'Risque Modéré', 
                icon: '🟡', 
                class: 'moderate',
                description: 'Votre risque cardiaque est modéré. Une surveillance est recommandée.'
            },
            high: { 
                text: 'Risque Élevé', 
                icon: '🔴', 
                class: 'high',
                description: 'Votre risque cardiaque est élevé. Consultez rapidement un médecin.'
            }
        };
        
        const config = riskConfig[prediction.riskLevel];
        
        riskResult.innerHTML = `
            <div class="risk-level ${config.class}">
                <div class="risk-percentage">${prediction.percentage}%</div>
                <div class="risk-label">
                    ${config.icon} ${config.text}
                </div>
            </div>
            <div class="risk-description">
                ${config.description}
            </div>
        `;
        
        // Affichage des recommandations
        recommendations.innerHTML = `
            <h3>
                <i class="fas fa-list-check"></i>
                Recommandations Personnalisées
            </h3>
            <ul>
                ${prediction.recommendations.map(rec => `<li><i class="fas fa-check"></i> ${rec}</li>`).join('')}
            </ul>
        `;
        
        // Sauvegarder les résultats
        this.testResults = prediction;
        
        // Analytics
        this.trackTestCompletion(prediction);
    }

    restartTest() {
        // Réinitialiser les données
        this.testData = {};
        this.testResults = null;
        this.currentStep = 1;
        
        // Réinitialiser le formulaire
        document.querySelectorAll('input').forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        
        // Supprimer les messages d'erreur
        document.querySelectorAll('.step-error, .field-error').forEach(error => {
            error.remove();
        });
        
        // Retourner à la première étape
        this.showStep(1);
        
        // Notification
        this.showNotification('Test réinitialisé', 'info');
    }

    saveResults() {
        if (!this.testResults) {
            this.showNotification('Aucun résultat à sauvegarder', 'warning');
            return;
        }
        
        const saveData = {
            timestamp: new Date().toISOString(),
            testData: this.testData,
            results: this.testResults,
            version: '1.0'
        };
        
        // Sauvegarder dans localStorage
        try {
            const existingResults = JSON.parse(localStorage.getItem('cardiacare-test-results') || '[]');
            existingResults.unshift(saveData);
            
            // Garder seulement les 10 derniers résultats
            if (existingResults.length > 10) {
                existingResults.splice(10);
            }
            
            localStorage.setItem('cardiacare-test-results', JSON.stringify(existingResults));
            
            // Export en fichier
            const dataStr = JSON.stringify(saveData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `test-cardiaque-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showNotification('Résultats sauvegardés avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    goToChat() {
        // Transférer les résultats vers le chat
        if (this.testResults) {
            const chatData = {
                source: 'cardiac_test',
                timestamp: new Date().toISOString(),
                riskLevel: this.testResults.riskLevel,
                percentage: this.testResults.percentage,
                recommendations: this.testResults.recommendations
            };
            
            sessionStorage.setItem('chat-context', JSON.stringify(chatData));
        }
        
        window.location.href = 'chat.html';
    }

    trackTestCompletion(results) {
        // Analytics pour le suivi
        if (window.analyticsEngine) {
            window.analyticsEngine.recordEvent('test_completed', {
                riskLevel: results.riskLevel,
                percentage: results.percentage,
                age: this.testData.age,
                gender: this.testData.gender,
                hasVitals: !!(this.testData.bloodPressure || this.testData.cholesterol),
                symptomsCount: this.testData.symptoms.length,
                completionTime: Date.now() - this.startTime
            });
        }
        
        console.log('🎯 Test cardiaque terminé:', results);
    }

    showNotification(message, type = 'info', duration = 4000) {
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `test-notification ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const colorMap = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${colorMap[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            min-width: 300px;
        `;
        
        notification.innerHTML = `
            <i class="fas ${iconMap[type]}"></i>
            <span>${message}</span>
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
        }, duration);
    }

    // Fonctions utilitaires
    getTestSummary() {
        return {
            data: this.testData,
            results: this.testResults,
            currentStep: this.currentStep,
            isComplete: this.currentStep === 5
        };
    }

    loadPreviousResults() {
        try {
            const savedResults = localStorage.getItem('cardiacare-test-results');
            return savedResults ? JSON.parse(savedResults) : [];
        } catch (error) {
            console.error('Erreur lors du chargement des résultats:', error);
            return [];
        }
    }

    exportTestData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            testData: this.testData,
            results: this.testResults,
            summary: this.getTestSummary(),
            metadata: {
                version: '1.0',
                userAgent: navigator.userAgent,
                completedSteps: this.currentStep
            }
        };
        
        console.log('📋 Données du test:', exportData);
        return exportData;
    }
}

// Fonctions globales pour les événements HTML
function nextStep() {
    if (window.cardiacTest) {
        window.cardiacTest.nextStep();
    }
}

function previousStep() {
    if (window.cardiacTest) {
        window.cardiacTest.previousStep();
    }
}

function analyzeRisk() {
    if (window.cardiacTest) {
        window.cardiacTest.analyzeRisk();
    }
}

function restartTest() {
    if (window.cardiacTest) {
        window.cardiacTest.restartTest();
    }
}

function saveResults() {
    if (window.cardiacTest) {
        window.cardiacTest.saveResults();
    }
}

function goToChat() {
    if (window.cardiacTest) {
        window.cardiacTest.goToChat();
    }
}

// Fonctions d'aide et de raccourcis
window.TestUtils = {
    fillTestData: (level = 'moderate') => {
        // Remplir automatiquement le test pour les démos
        if (!window.cardiacTest) return;
        
        const testData = {
            low: {
                age: 35, gender: 'F', bloodPressure: 115, cholesterol: 180, heartRate: 65,
                smoking: false, diabetes: false, familyHistory: false, activity: 'high', symptoms: []
            },
            moderate: {
                age: 55, gender: 'M', bloodPressure: 135, cholesterol: 220, heartRate: 75,
                smoking: false, diabetes: false, familyHistory: true, activity: 'moderate', symptoms: ['fatigue']
            },
            high: {
                age: 65, gender: 'M', bloodPressure: 155, cholesterol: 260, heartRate: 85,
                smoking: true, diabetes: true, familyHistory: true, activity: 'low', symptoms: ['chest_pain', 'shortness_breath']
            }
        };
        
        const data = testData[level];
        if (!data) return;
        
        // Remplir les champs automatiquement
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`input[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    document.querySelector(`input[name="${key}"][value="${data[key]}"]`).checked = true;
                } else if (element.type === 'checkbox') {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(value => {
                            const checkbox = document.querySelector(`input[name="${key}"][value="${value}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else {
                    element.value = data[key];
                }
            }
        });
        
        window.cardiacTest.showNotification(`Test pré-rempli avec profil "${level}"`, 'info');
    },
    
    getResults: () => window.cardiacTest?.getTestSummary(),
    
    exportData: () => window.cardiacTest?.exportTestData(),
    
    simulateQuickTest: async () => {
        if (!window.cardiacTest) return;
        
        window.TestUtils.fillTestData('moderate');
        
        // Passer rapidement les étapes
        for (let i = 1; i <= 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            window.cardiacTest.nextStep();
        }
        
        // Lancer l'analyse
        setTimeout(() => {
            window.cardiacTest.analyzeRisk();
        }, 1000);
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🫀 Initialisation du Test Cardiaque IA...');
    
    try {
        // Créer l'instance du test
        window.cardiacTest = new CardiacTest();
        window.cardiacTest.startTime = Date.now();
        
        // Message de bienvenue
        setTimeout(() => {
            window.cardiacTest.showNotification('Test cardiaque IA prêt ! Répondez aux questions pour évaluer votre risque.', 'info', 6000);
        }, 1000);
        
        console.log('✅ Test cardiaque initialisé avec succès');
        console.log('💡 Utilisez TestUtils.fillTestData("low/moderate/high") pour les démos');
        console.log('🚀 Ou TestUtils.simulateQuickTest() pour un test automatique');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du test:', error);
    }
});

// Prévention de la perte de données
window.addEventListener('beforeunload', function(e) {
    if (window.cardiacTest && window.cardiacTest.currentStep > 1 && window.cardiacTest.currentStep < 5) {
        e.preventDefault();
        e.returnValue = 'Êtes-vous sûr de vouloir quitter ? Votre progression sera perdue.';
        return e.returnValue;
    }
});

// Gestion responsive mobile
function handleMobileView() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Ajustements pour mobile
        const header = document.querySelector('.test-header');
        if (header) {
            header.style.padding = '1.5rem 1rem';
        }
        
        const stepCards = document.querySelectorAll('.step-card, .results-card');
        stepCards.forEach(card => {
            card.style.padding = '2rem 1.5rem';
        });
    }
}

window.addEventListener('resize', handleMobileView);

console.log('🫀 Test Cardiaque IA - Version complète chargée');
console.log('🎯 Fonctions: TestUtils.fillTestData(), simulateQuickTest(), getResults()');
console.log('📊 Compatible avec le système ML de CardiaCare');