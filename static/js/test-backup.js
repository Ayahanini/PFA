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
        this.showNotification('Test réinitialisé', 'info');    }

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
            
            // Génération du PDF professionnel
            this.generateProfessionalPDF(saveData);
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    generateProfessionalPDF(saveData) {
        // Vérifier si jsPDF est disponible avec plusieurs méthodes
        let jsPDFConstructor = null;
        
        if (typeof window.jsPDF !== 'undefined') {
            jsPDFConstructor = window.jsPDF;
            console.log('jsPDF trouvé via window.jsPDF');
        } else if (typeof jsPDF !== 'undefined') {
            jsPDFConstructor = jsPDF;
            console.log('jsPDF trouvé via jsPDF global');
        } else if (window.jspdf && window.jspdf.jsPDF) {
            jsPDFConstructor = window.jspdf.jsPDF;
            console.log('jsPDF trouvé via window.jspdf.jsPDF');
        }
        
        if (jsPDFConstructor) {
            try {
                console.log('Génération du PDF professionnel en cours...');
                this.createProfessionalPDF(jsPDFConstructor, saveData);
            } catch (error) {
                console.error('Erreur lors de la génération PDF:', error);
                this.fallbackToJSON(saveData);
            }
        } else {
            console.warn('jsPDF non disponible, téléchargement JSON...');
            this.fallbackToJSON(saveData);
        }
    }

    createProfessionalPDF(jsPDFConstructor, saveData) {// Créer une nouvelle instance de jsPDF
                const doc = new jsPDFConstructor();
                
                // =================== PAGE DE COUVERTURE ===================
                // Arrière-plan gradient (simulation)
                doc.setFillColor(240, 248, 255); // Bleu très clair
                doc.rect(0, 0, 210, 297, 'F');
                
                // En-tête principal
                doc.setFillColor(41, 128, 185);
                doc.rect(0, 0, 210, 60, 'F');
                
                // Logo et titre
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(28);
                doc.setFont("helvetica", "bold");
                doc.text("CARDIACARE", 105, 25, { align: 'center' });
                
                doc.setFontSize(14);
                doc.setFont("helvetica", "normal");
                doc.text("Intelligence Artificielle Médicale", 105, 35, { align: 'center' });
                
                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text("RAPPORT D'ÉVALUATION CARDIAQUE", 105, 50, { align: 'center' });
                
                // Informations centrales
                doc.setTextColor(52, 73, 94);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("ANALYSE PERSONNALISÉE DU RISQUE CARDIOVASCULAIRE", 105, 100, { align: 'center' });
                
                // Informations patient (encadré)
                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(41, 128, 185);
                doc.setLineWidth(2);
                doc.rect(40, 120, 130, 50, 'FD');
                
                doc.setTextColor(52, 73, 94);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("INFORMATIONS PATIENT", 105, 135, { align: 'center' });
                
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                doc.text(`Patient: ${this.testData.gender === 'M' ? 'Homme' : 'Femme'}, ${this.testData.age || 'âge non renseigné'} ans`, 105, 150, { align: 'center' });
                
                const reportDate = new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                const reportNumber = `RAP-${Date.now().toString().slice(-6)}`;
                
                doc.text(`Date d'évaluation: ${reportDate}`, 105, 160, { align: 'center' });
                doc.text(`Numéro de rapport: ${reportNumber}`, 105, 170, { align: 'center' });
                
                // Résultat principal (encadré coloré)
                const coverRiskColor = this.testResults.riskLevel === 'low' ? [34, 139, 34] : 
                                 this.testResults.riskLevel === 'moderate' ? [255, 165, 0] : 
                                 [231, 76, 60];
                
                const coverRiskText = {
                    low: 'RISQUE FAIBLE',
                    moderate: 'RISQUE MODÉRÉ',
                    high: 'RISQUE ÉLEVÉ'
                };
                
                doc.setFillColor(...coverRiskColor);
                doc.rect(50, 200, 110, 30, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text(coverRiskText[this.testResults.riskLevel], 105, 215, { align: 'center' });
                doc.setFontSize(14);
                doc.text(`Score: ${this.testResults.percentage}%`, 105, 225, { align: 'center' });
                
                // Footer de la page de couverture
                doc.setTextColor(128, 128, 128);
                doc.setFontSize(10);
                doc.setFont("helvetica", "italic");
                doc.text("Ce rapport est confidentiel et destiné uniquement au patient concerné", 105, 260, { align: 'center' });
                doc.text("Consultation médicale recommandée pour toute décision thérapeutique", 105, 270, { align: 'center' });
                
                // =================== PAGE 2: TABLE DES MATIÈRES ===================
                doc.addPage();
                
                // En-tête
                doc.setFillColor(52, 73, 94);
                doc.rect(0, 0, 210, 25, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("TABLE DES MATIÈRES", 105, 15, { align: 'center' });
                
                // Contenu de la table
                let tocY = 50;
                doc.setTextColor(52, 73, 94);
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                
                const tocItems = [
                    "1. Informations Patient ......................................................... 3",
                    "2. Données Vitales ............................................................. 3",
                    "3. Facteurs de Risque .......................................................... 3",
                    "4. Symptômes Déclarés ........................................................ 3",
                    "5. Activité Physique ........................................................... 3",
                    "6. Résultats de l'Évaluation .................................................. 4",
                    "7. Facteurs de Risque Identifiés ............................................ 4",
                    "8. Recommandations Personnalisées ........................................ 4",
                    "9. Avertissement Médical ..................................................... 5"
                ];
                
                tocItems.forEach(item => {
                    doc.text(item, 30, tocY);
                    tocY += 12;
                });
                
                // Note importante
                doc.setFillColor(255, 249, 196);
                doc.rect(20, tocY + 20, 170, 40, 'F');
                doc.setTextColor(184, 134, 11);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text("NOTE IMPORTANTE", 30, tocY + 35);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text("Cette évaluation utilise l'intelligence artificielle pour analyser vos données", 30, tocY + 45);
                doc.text("et estimer votre risque cardiovasculaire de manière indicative.", 30, tocY + 52);
                
                // =================== PAGE 3: CONTENU PRINCIPAL ===================
                doc.addPage();
                
                // =================== EN-TÊTE PROFESSIONNEL ===================
                // Couleurs du thème
                const primaryColor = [41, 128, 185]; // Bleu médical
                const secondaryColor = [231, 76, 60]; // Rouge cardiaque
                const grayColor = [52, 73, 94];
                const lightGray = [236, 240, 241];
                
                // En-tête avec fond coloré
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, 210, 35, 'F');
                
                // Logo et titre principal
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(24);
                doc.setFont("helvetica", "bold");
                doc.text("CARDIACARE", 20, 22);
                
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.text("Rapport d'Évaluation Cardiaque IA", 20, 30);
                
                // Date et numéro de rapport
                doc.setFontSize(10);
                doc.text(`Rapport N°: ${reportNumber}`, 150, 22);
                doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 150, 30);
                
                // =================== PAGE DE COUVERTURE ===================
                // Arrière-plan gradient (simulation)
                doc.setFillColor(240, 248, 255); // Bleu très clair
                doc.rect(0, 0, 210, 297, 'F');
                
                // En-tête principal
                doc.setFillColor(41, 128, 185);
                doc.rect(0, 0, 210, 60, 'F');
                
                // Logo et titre
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(28);
                doc.setFont("helvetica", "bold");
                doc.text("CARDIACARE", 105, 25, { align: 'center' });
                
                doc.setFontSize(14);
                doc.setFont("helvetica", "normal");
                doc.text("Intelligence Artificielle Médicale", 105, 35, { align: 'center' });
                
                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text("RAPPORT D'ÉVALUATION CARDIAQUE", 105, 50, { align: 'center' });
                
                // Informations centrales
                doc.setTextColor(52, 73, 94);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("ANALYSE PERSONNALISÉE DU RISQUE CARDIOVASCULAIRE", 105, 100, { align: 'center' });
                
                // Informations patient (encadré)
                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(41, 128, 185);
                doc.setLineWidth(2);
                doc.rect(40, 120, 130, 50, 'FD');
                
                doc.setTextColor(52, 73, 94);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("INFORMATIONS PATIENT", 105, 135, { align: 'center' });
                
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                doc.text(`Patient: ${this.testData.gender === 'M' ? 'Homme' : 'Femme'}, ${this.testData.age || 'âge non renseigné'} ans`, 105, 150, { align: 'center' });
                
                const reportDate = new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                const reportNumber = `RAP-${Date.now().toString().slice(-6)}`;
                
                doc.text(`Date d'évaluation: ${reportDate}`, 105, 160, { align: 'center' });
                doc.text(`Numéro de rapport: ${reportNumber}`, 105, 170, { align: 'center' });
                
                // Résultat principal (encadré coloré)
                const riskColor = this.testResults.riskLevel === 'low' ? [34, 139, 34] : 
                                 this.testResults.riskLevel === 'moderate' ? [255, 165, 0] : 
                                 [231, 76, 60];
                
                const riskText = {
                    low: 'RISQUE FAIBLE',
                    moderate: 'RISQUE MODÉRÉ',
                    high: 'RISQUE ÉLEVÉ'
                };
                
                doc.setFillColor(...riskColor);
                doc.rect(50, 200, 110, 30, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text(riskText[this.testResults.riskLevel], 105, 215, { align: 'center' });
                doc.setFontSize(14);
                doc.text(`Score: ${this.testResults.percentage}%`, 105, 225, { align: 'center' });
                
                // Footer de la page de couverture
                doc.setTextColor(128, 128, 128);
                doc.setFontSize(10);
                doc.setFont("helvetica", "italic");
                doc.text("Ce rapport est confidentiel et destiné uniquement au patient concerné", 105, 260, { align: 'center' });
                doc.text("Consultation médicale recommandée pour toute décision thérapeutique", 105, 270, { align: 'center' });
                
                // =================== PAGE 2: TABLE DES MATIÈRES ===================
                doc.addPage();
                
                // En-tête
                doc.setFillColor(52, 73, 94);
                doc.rect(0, 0, 210, 25, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("TABLE DES MATIÈRES", 105, 15, { align: 'center' });
                
                // Contenu de la table
                let tocY = 50;
                doc.setTextColor(52, 73, 94);
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                
                const tocItems = [
                    "1. Informations Patient ......................................................... 3",
                    "2. Données Vitales ............................................................. 3",
                    "3. Facteurs de Risque .......................................................... 3",
                    "4. Symptômes Déclarés ........................................................ 3",
                    "5. Activité Physique ........................................................... 3",
                    "6. Résultats de l'Évaluation .................................................. 4",
                    "7. Facteurs de Risque Identifiés ............................................ 4",
                    "8. Recommandations Personnalisées ........................................ 4",
                    "9. Avertissement Médical ..................................................... 5"
                ];
                
                tocItems.forEach(item => {
                    doc.text(item, 30, tocY);
                    tocY += 12;
                });
                
                // Note importante
                doc.setFillColor(255, 249, 196);
                doc.rect(20, tocY + 20, 170, 40, 'F');
                doc.setTextColor(184, 134, 11);
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text("NOTE IMPORTANTE", 30, tocY + 35);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text("Cette évaluation utilise l'intelligence artificielle pour analyser vos données", 30, tocY + 45);
                doc.text("et estimer votre risque cardiovasculaire de manière indicative.", 30, tocY + 52);
                
                // =================== PAGE 3: CONTENU PRINCIPAL ===================
                doc.addPage();
                
                // =================== EN-TÊTE PROFESSIONNEL ===================
                // Couleurs du thème
                const primaryColor = [41, 128, 185]; // Bleu médical
                const secondaryColor = [231, 76, 60]; // Rouge cardiaque
                const grayColor = [52, 73, 94];
                const lightGray = [236, 240, 241];
                
                // En-tête avec fond coloré
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, 210, 35, 'F');
                
                // Logo et titre principal
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(24);
                doc.setFont("helvetica", "bold");
                doc.text("CARDIACARE", 20, 22);
                
                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.text("Rapport d'Évaluation Cardiaque IA", 20, 30);
                
                // Date et numéro de rapport
                doc.setFontSize(10);
                doc.text(`Rapport N°: ${reportNumber}`, 150, 22);
                doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 150, 30);
                
                // =================== INFORMATIONS PATIENT ===================
                let yPosition = 50;
                doc.setTextColor(...grayColor);
                
                // Titre section avec fond
                doc.setFillColor(...lightGray);
                doc.rect(15, yPosition - 5, 180, 12, 'F');
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("📋 INFORMATIONS PATIENT", 20, yPosition + 3);
                
                yPosition += 20;
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                
                // Tableau d'informations patient
                const patientInfo = [
                    [`Âge:`, `${this.testData.age || 'Non renseigné'} ans`],
                    [`Sexe:`, `${this.testData.gender === 'M' ? 'Masculin' : this.testData.gender === 'F' ? 'Féminin' : 'Non renseigné'}`]
                ];
                
                patientInfo.forEach(([label, value]) => {
                    doc.setFont("helvetica", "bold");
                    doc.text(label, 25, yPosition);
                    doc.setFont("helvetica", "normal");
                    doc.text(value, 60, yPosition);
                    yPosition += 8;
                });
                
                yPosition += 10;                
                doc.text(`Age: ${this.testData.age || 'Non renseigne'} ans`, 25, yPosition);
                yPosition += 7;
                doc.text(`Sexe: ${this.testData.gender === 'M' ? 'Masculin' : this.testData.gender === 'F' ? 'Feminin' : 'Non renseigne'}`, 25, yPosition);
                yPosition += 10;
                
                // =================== DONNÉES VITALES ===================
                if (this.testData.bloodPressure || this.testData.cholesterol || this.testData.heartRate) {
                    // Titre section avec fond
                    doc.setFillColor(...lightGray);
                    doc.rect(15, yPosition - 5, 180, 12, 'F');
                    doc.setTextColor(...grayColor);
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text("💓 DONNÉES VITALES", 20, yPosition + 3);
                    
                    yPosition += 20;
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "normal");
                    
                    // Tableau structuré
                    const vitalSigns = [];
                    if (this.testData.bloodPressure) vitalSigns.push(['Tension artérielle:', `${this.testData.bloodPressure} mmHg`]);
                    if (this.testData.cholesterol) vitalSigns.push(['Cholestérol total:', `${this.testData.cholesterol} mg/dL`]);
                    if (this.testData.heartRate) vitalSigns.push(['Fréquence cardiaque:', `${this.testData.heartRate} bpm`]);
                    
                    vitalSigns.forEach(([label, value]) => {
                        doc.setFont("helvetica", "bold");
                        doc.text(label, 25, yPosition);
                        doc.setFont("helvetica", "normal");
                        doc.text(value, 80, yPosition);
                        yPosition += 8;
                    });
                    yPosition += 10;
                }
                
                // =================== FACTEURS DE RISQUE ===================
                doc.setFillColor(...lightGray);
                doc.rect(15, yPosition - 5, 180, 12, 'F');
                doc.setTextColor(...grayColor);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("⚠️ FACTEURS DE RISQUE", 20, yPosition + 3);
                
                yPosition += 20;
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                
                const riskFactors = [
                    ['Tabagisme:', this.testData.smoking ? '✓ Oui' : '✗ Non'],
                    ['Diabète:', this.testData.diabetes ? '✓ Oui' : '✗ Non'],
                    ['Antécédents familiaux:', this.testData.familyHistory ? '✓ Oui' : '✗ Non']
                ];
                
                riskFactors.forEach(([label, value]) => {
                    doc.setFont("helvetica", "bold");
                    doc.text(label, 25, yPosition);
                    doc.setFont("helvetica", "normal");
                    
                    // Couleur selon le risque
                    if (value.includes('✓')) {
                        doc.setTextColor(...secondaryColor);
                    } else {
                        doc.setTextColor(34, 139, 34); // Vert
                    }
                    doc.text(value, 80, yPosition);
                    doc.setTextColor(...grayColor);
                    yPosition += 8;
                });
                yPosition += 10;                
                // =================== SYMPTÔMES DÉCLARÉS ===================
                if (this.testData.symptoms && this.testData.symptoms.length > 0) {
                    doc.setFillColor(...lightGray);
                    doc.rect(15, yPosition - 5, 180, 12, 'F');
                    doc.setTextColor(...grayColor);
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text("🩺 SYMPTÔMES DÉCLARÉS", 20, yPosition + 3);
                    
                    yPosition += 20;
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "normal");
                    
                    const symptomLabels = {
                        'chest_pain': 'Douleurs thoraciques',
                        'shortness_breath': 'Essoufflement',
                        'fatigue': 'Fatigue inhabituelle',
                        'palpitations': 'Palpitations cardiaques'
                    };
                    
                    this.testData.symptoms.forEach(symptom => {
                        doc.setTextColor(...secondaryColor);
                        doc.text(`• ${symptomLabels[symptom] || symptom}`, 25, yPosition);
                        yPosition += 7;
                    });
                    doc.setTextColor(...grayColor);
                    yPosition += 10;
                } else {
                    doc.setFillColor(...lightGray);
                    doc.rect(15, yPosition - 5, 180, 12, 'F');
                    doc.setTextColor(...grayColor);
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text("🩺 SYMPTÔMES DÉCLARÉS", 20, yPosition + 3);
                    
                    yPosition += 20;
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(34, 139, 34);
                    doc.text("✓ Aucun symptôme déclaré", 25, yPosition);
                    doc.setTextColor(...grayColor);
                    yPosition += 15;
                }
                
                // =================== ACTIVITÉ PHYSIQUE ===================
                doc.setFillColor(...lightGray);
                doc.rect(15, yPosition - 5, 180, 12, 'F');
                doc.setTextColor(...grayColor);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("🏃 ACTIVITÉ PHYSIQUE", 20, yPosition + 3);
                
                yPosition += 20;
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                
                if (this.testData.activity) {
                    const activityLabels = {
                        'low': ['Sédentaire', 'Peu ou pas d\'exercice physique'],
                        'moderate': ['Modérée', '1-3 séances par semaine'],
                        'high': ['Active', '3+ séances par semaine']
                    };
                    
                    const [level, description] = activityLabels[this.testData.activity] || ['Non renseigné', ''];
                    
                    doc.setFont("helvetica", "bold");
                    doc.text('Niveau d\'activité:', 25, yPosition);
                    doc.setFont("helvetica", "normal");
                    
                    // Couleur selon le niveau
                    if (this.testData.activity === 'high') {
                        doc.setTextColor(34, 139, 34); // Vert
                    } else if (this.testData.activity === 'moderate') {
                        doc.setTextColor(255, 165, 0); // Orange
                    } else {
                        doc.setTextColor(...secondaryColor); // Rouge
                    }
                    
                    doc.text(level, 80, yPosition);
                    yPosition += 7;
                    doc.setTextColor(...grayColor);
                    doc.setFont("helvetica", "italic");
                    doc.text(description, 25, yPosition);
                    doc.setFont("helvetica", "normal");
                    yPosition += 15;
                }
                
                // =================== RÉSULTATS DE L'ÉVALUATION ===================
                doc.setFillColor(...primaryColor);
                doc.rect(15, yPosition - 5, 180, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("📊 RÉSULTATS DE L'ÉVALUATION", 20, yPosition + 7);
                
                yPosition += 25;
                doc.setTextColor(...grayColor);
                
                // Score de risque avec barre de progression
                const riskText = {
                    low: ['RISQUE FAIBLE', 'Votre profil présente un risque cardiovasculaire faible'],
                    moderate: ['RISQUE MODÉRÉ', 'Surveillance recommandée - Consultez votre médecin'],
                    high: ['RISQUE ÉLEVÉ', 'Consultation médicale urgente recommandée']
                };
                
                const [riskLabel, riskDescription] = riskText[this.testResults.riskLevel] || ['Non évalué', ''];
                  // Encadré pour le niveau de risque
                const riskColor = this.testResults.riskLevel === 'low' ? [34, 139, 34] : 
                                 this.testResults.riskLevel === 'moderate' ? [255, 165, 0] : 
                                 [231, 76, 60];
                
                doc.setFillColor(...riskColor);
                doc.rect(20, yPosition - 3, 170, 20, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(riskLabel, 25, yPosition + 5);
                doc.setFontSize(12);
                doc.text(`Score: ${this.testResults.percentage}%`, 25, yPosition + 13);
                
                // Barre de progression du score
                yPosition += 25;
                doc.setTextColor(...grayColor);
                doc.setFontSize(10);
                doc.text("Score de risque cardiovasculaire:", 25, yPosition);
                yPosition += 8;
                
                // Fond de la barre
                doc.setFillColor(220, 220, 220);
                doc.rect(25, yPosition, 160, 8, 'F');
                
                // Barre de progression colorée
                const progressWidth = (this.testResults.percentage / 100) * 160;
                doc.setFillColor(...riskColor);
                doc.rect(25, yPosition, progressWidth, 8, 'F');
                
                // Graduations
                doc.setTextColor(128, 128, 128);
                doc.setFontSize(8);
                doc.text("0%", 23, yPosition + 12);
                doc.text("50%", 100, yPosition + 12);
                doc.text("100%", 180, yPosition + 12);
                
                yPosition += 20;
                doc.setTextColor(...grayColor);
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                doc.text(riskDescription, 25, yPosition);
                yPosition += 15;
                // Section: Facteurs de risque identifiés
                if (this.testResults.factors && this.testResults.factors.length > 0) {
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text("🔍 FACTEURS DE RISQUE IDENTIFIÉS", 20, yPosition);
                    yPosition += 10;
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    
                    this.testResults.factors.forEach(factor => {
                        if (yPosition > 270) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        doc.setTextColor(...secondaryColor);
                        doc.text(`• ${factor}`, 25, yPosition);
                        doc.setTextColor(...grayColor);
                        yPosition += 6;
                    });
                    yPosition += 10;
                }
                
                // Section: Recommandations
                doc.setFillColor(...lightGray);
                doc.rect(15, yPosition - 5, 180, 12, 'F');
                doc.setTextColor(...grayColor);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("💡 RECOMMANDATIONS PERSONNALISÉES", 20, yPosition + 3);
                yPosition += 20;
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                
                this.testResults.recommendations.forEach((rec, index) => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                        // Répéter l'en-tête sur nouvelle page
                        doc.setFillColor(...primaryColor);
                        doc.rect(0, 0, 210, 20, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(12);
                        doc.setFont("helvetica", "bold");
                        doc.text("CARDIACARE - Rapport d'Évaluation (suite)", 20, 12);
                        yPosition = 35;
                        doc.setTextColor(...grayColor);
                        doc.setFontSize(10);
                        doc.setFont("helvetica", "normal");
                    }
                    // Nettoyer les emojis pour le PDF
                    const cleanRec = rec.replace(/[^\w\s\-\.,;:!?()àáâäçéèêëïîôöùúûüÿñ]/g, '');
                    doc.setTextColor(34, 139, 34);
                    doc.text(`✓ ${cleanRec}`, 25, yPosition);
                    doc.setTextColor(...grayColor);
                    yPosition += 6;
                });
                
                // Pied de page professionnel
                if (yPosition > 240) {
                    doc.addPage();
                    yPosition = 20;
                } else {
                    yPosition += 20;
                }
                
                // Ligne de séparation
                doc.setDrawColor(...lightGray);
                doc.line(20, yPosition, 190, yPosition);
                yPosition += 10;
                
                // Avertissement médical
                doc.setFillColor(255, 249, 196); // Jaune clair
                doc.rect(15, yPosition - 5, 180, 25, 'F');
                doc.setTextColor(184, 134, 11); // Jaune foncé
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("⚠️ AVERTISSEMENT MÉDICAL", 20, yPosition + 5);
                
                yPosition += 12;
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(102, 102, 102);
                doc.text("Ce rapport est généré automatiquement par l'intelligence artificielle CardiaCare.", 20, yPosition);
                yPosition += 5;
                doc.text("Il ne remplace en aucun cas un diagnostic médical professionnel.", 20, yPosition);
                yPosition += 5;
                doc.text("Consultez votre médecin pour un avis médical personnalisé et approprié.", 20, yPosition);
                
                yPosition += 15;
                
                // Footer avec informations
                doc.setTextColor(128, 128, 128);
                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                const footerText = `Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} | CardiaCare v1.0`;
                doc.text(footerText, 20, yPosition);
                
                // Logo ou signature (simulation)
                doc.setFontSize(6);
                doc.text("© 2024 CardiaCare - Intelligence Artificielle Médicale", 20, yPosition + 5);                
                // Télécharger le rapport PDF
                const fileName = `CardiaCare_Rapport_${new Date().toISOString().split('T')[0]}_${reportNumber}.pdf`;
                doc.save(fileName);
                
                this.showNotification('Rapport PDF professionnel téléchargé avec succès', 'success');
                console.log('PDF professionnel généré et téléchargé avec succès');
            } else {
                // Fallback: télécharger en JSON si jsPDF n'est pas disponible
                console.error('jsPDF non disponible, fallback vers JSON');
                this.downloadAsJSON(saveData);
                this.showNotification('jsPDF non disponible - Résultats téléchargés en JSON', 'warning');
            }
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            // En cas d'erreur avec le PDF, fallback vers JSON
            this.downloadAsJSON(saveData);
            this.showNotification(`Erreur PDF - Téléchargé en JSON: ${error.message}`, 'warning');
        }
    }

    // Nouvelle méthode pour télécharger en JSON
    downloadAsJSON(data) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport_cardiaque_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
    
    // Vérifier jsPDF
    setTimeout(() => {
        console.log('Vérification jsPDF:');
        console.log('- window.jsPDF:', typeof window.jsPDF);
        console.log('- jsPDF global:', typeof jsPDF);
        console.log('- window.jspdf:', typeof window.jspdf);
        if (window.jspdf) {
            console.log('- window.jspdf.jsPDF:', typeof window.jspdf.jsPDF);
        }
    }, 1000);
    
    try {
        // Créer l'instance du test
        window.cardiacTest = new CardiacTest();
        window.cardiacTest.startTime = Date.now();
        
        // Message de bienvenue
        setTimeout(() => {
            if (window.cardiacTest && window.cardiacTest.showNotification) {
                window.cardiacTest.showNotification('Test cardiaque initialisé', 'success', 2000);
            }
        }, 1000);
        
        console.log('✅ Test cardiaque initialisé avec succès');
        console.log('💡 Utilisez TestUtils.fillTestData("low/moderate/high") pour les démos');
        console.log('🚀 Ou TestUtils.simulateQuickTest() pour un test automatique');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du test:', error);
    }
});

// Fonction de test pour jsPDF
window.testPDF = function() {
    console.log('Test de génération PDF...');
    
    let jsPDFConstructor = null;
    
    if (typeof window.jsPDF !== 'undefined') {
        jsPDFConstructor = window.jsPDF;
        console.log('✅ jsPDF trouvé via window.jsPDF');
    } else if (typeof jsPDF !== 'undefined') {
        jsPDFConstructor = jsPDF;
        console.log('✅ jsPDF trouvé via jsPDF global');
    } else if (window.jspdf && window.jspdf.jsPDF) {
        jsPDFConstructor = window.jspdf.jsPDF;
        console.log('✅ jsPDF trouvé via window.jspdf.jsPDF');
    } else {
        console.error('❌ jsPDF non trouvé');
        return false;
    }
    
    try {
        const doc = new jsPDFConstructor();
        doc.text('Test PDF CardiaCare', 20, 20);
        doc.save('test-cardiacare.pdf');
        console.log('✅ PDF de test généré avec succès');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la génération du PDF de test:', error);
        return false;
    }
};

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