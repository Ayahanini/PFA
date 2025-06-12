// CardiaCare - Test Cardiaque IA - Version Propre
// Système de génération PDF professionnel

class CardiacTest {    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5; // Correspondant aux 5 étapes dans le HTML
        this.testData = {};
        this.testResults = null;
        this.startTime = Date.now();
        this.init();
    }    init() {
        console.log('🔄 Initialisation du test cardiaque...');
        console.log(`📊 Total d'étapes: ${this.totalSteps}`);
        
        // Vérifier que les étapes existent dans le DOM
        for (let i = 1; i <= this.totalSteps; i++) {
            const step = document.getElementById(`step${i}`);
            if (step) {
                console.log(`✅ Étape ${i} trouvée`);
            } else {
                console.error(`❌ Étape ${i} manquante`);
            }
        }
        
        this.updateProgress();
        this.setupEventListeners();
        this.showStep(1);
        
        console.log('✅ Initialisation terminée');
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
                const nextBtn = activeStep?.querySelector('.btn-next, .btn-analyze');
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
                    message = 'L\'âge doit être entre 18 et 120 ans';
                }
                break;
            case 'bloodPressure':
                if (value < 80 || value > 250) {
                    isValid = false;
                    message = 'La tension doit être entre 80 et 250 mmHg';
                }
                break;
            case 'cholesterol':
                if (value < 100 || value > 500) {
                    isValid = false;
                    message = 'Le cholestérol doit être entre 100 et 500 mg/dL';
                }
                break;
            case 'heartRate':
                if (value < 50 || value > 200) {
                    isValid = false;
                    message = 'Le rythme cardiaque doit être entre 50 et 200 bpm';
                }
                break;
        }

        this.displayFieldValidation(field, isValid, message);
        return isValid;
    }

    displayFieldValidation(field, isValid, message) {
        let feedback = field.parentElement.querySelector('.field-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'field-feedback';
            field.parentElement.appendChild(feedback);
        }

        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            feedback.textContent = '';
            feedback.className = 'field-feedback';
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            feedback.textContent = message;
            feedback.className = 'field-feedback error';
        }
    }    showStep(stepNumber) {
        // Masquer toutes les étapes
        document.querySelectorAll('.test-step').forEach(step => {
            step.classList.remove('active');
        });

        // Afficher l'étape demandée (les IDs dans HTML sont step1, step2, etc.)
        const targetStep = document.getElementById(`step${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
            this.currentStep = stepNumber;
            this.updateProgress();
            console.log(`✅ Étape ${stepNumber} affichée`);
        } else {
            console.error(`❌ Impossible de trouver l'étape: step${stepNumber}`);
        }
    }    updateProgress() {
        const progressBar = document.querySelector('.progress-fill, #progressFill');
        const progressText = document.querySelector('.progress-text span, #progressText');
        
        if (progressBar) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressBar.style.width = `${percentage}%`;
            console.log(`📊 Progression: ${percentage}%`);
        }
        
        if (progressText) {
            progressText.textContent = `Étape ${this.currentStep} sur ${this.totalSteps}`;
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.totalSteps) {
                this.showStep(this.currentStep + 1);
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector('.test-step.active');
        const requiredFields = currentStepElement.querySelectorAll('input[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value || (field.type === 'radio' && !currentStepElement.querySelector(`input[name="${field.name}"]:checked`))) {
                isValid = false;
                field.classList.add('invalid');
            } else {
                field.classList.remove('invalid');
                if (field.type === 'number') {
                    isValid = this.validateField(field) && isValid;
                }
            }
        });

        if (!isValid) {
            this.showNotification('Veuillez remplir tous les champs requis', 'warning');
        }

        return isValid;
    }

    saveCurrentStepData() {
        const currentStepElement = document.querySelector('.test-step.active');
        const inputs = currentStepElement.querySelectorAll('input, select');

        inputs.forEach(input => {
            if (input.type === 'radio' && input.checked) {
                this.testData[input.name] = input.value;
            } else if (input.type === 'checkbox') {
                if (!this.testData[input.name]) {
                    this.testData[input.name] = [];
                }
                if (input.checked && !this.testData[input.name].includes(input.value)) {
                    this.testData[input.name].push(input.value);
                } else if (!input.checked) {
                    this.testData[input.name] = this.testData[input.name].filter(val => val !== input.value);
                }
            } else if (input.type !== 'radio') {
                this.testData[input.id] = input.value;
            }
        });

        console.log('Données sauvegardées:', this.testData);
    }

    analyzeRisk() {
        if (!this.validateAllData()) {
            this.showNotification('Données incomplètes pour l\'analyse', 'error');
            return;
        }

        // Simulation de l'analyse IA
        this.showNotification('Analyse en cours...', 'info', 2000);
        
        setTimeout(() => {
            this.testResults = this.calculateRisk();
            this.displayResults();
        }, 2000);
    }

    calculateRisk() {
        let riskScore = 0;
        const factors = [];

        // Facteurs d'âge
        const age = parseInt(this.testData.age);
        if (age > 65) {
            riskScore += 30;
            factors.push('Âge > 65 ans');
        } else if (age > 50) {
            riskScore += 15;
            factors.push('Âge > 50 ans');
        }

        // Facteurs de genre
        if (this.testData.gender === 'M' && age > 45) {
            riskScore += 10;
            factors.push('Homme > 45 ans');
        } else if (this.testData.gender === 'F' && age > 55) {
            riskScore += 10;
            factors.push('Femme > 55 ans');
        }

        // Tension artérielle
        const bp = parseInt(this.testData.bloodPressure);
        if (bp > 180) {
            riskScore += 25;
            factors.push('Hypertension sévère');
        } else if (bp > 140) {
            riskScore += 15;
            factors.push('Hypertension modérée');
        }

        // Cholestérol
        const chol = parseInt(this.testData.cholesterol);
        if (chol > 240) {
            riskScore += 20;
            factors.push('Cholestérol élevé');
        } else if (chol > 200) {
            riskScore += 10;
            factors.push('Cholestérol limite');
        }

        // Facteurs de risque
        if (this.testData.smoking === 'true') {
            riskScore += 20;
            factors.push('Tabagisme');
        }
        if (this.testData.diabetes === 'true') {
            riskScore += 15;
            factors.push('Diabète');
        }
        if (this.testData.familyHistory === 'true') {
            riskScore += 10;
            factors.push('Antécédents familiaux');
        }

        // Symptômes
        if (this.testData.symptoms && this.testData.symptoms.length > 0) {
            riskScore += this.testData.symptoms.length * 8;
            factors.push(`${this.testData.symptoms.length} symptôme(s) présent(s)`);
        }

        // Activité physique (facteur protecteur)
        if (this.testData.activity === 'high') {
            riskScore -= 10;
            factors.push('Activité physique élevée (facteur protecteur)');
        } else if (this.testData.activity === 'low') {
            riskScore += 10;
            factors.push('Activité physique faible');
        }

        // Limiter le score entre 0 et 100
        riskScore = Math.max(0, Math.min(100, riskScore));

        // Déterminer le niveau de risque
        let riskLevel;
        if (riskScore < 30) {
            riskLevel = 'low';
        } else if (riskScore < 70) {
            riskLevel = 'moderate';
        } else {
            riskLevel = 'high';
        }

        // Générer des recommandations
        const recommendations = this.generateRecommendations(riskLevel, factors);

        return {
            percentage: riskScore,
            riskLevel: riskLevel,
            factors: factors,
            recommendations: recommendations,
            analysisDate: new Date().toISOString()
        };
    }

    generateRecommendations(riskLevel, factors) {
        const recommendations = [];

        switch (riskLevel) {
            case 'low':
                recommendations.push('Continuez vos bonnes habitudes de vie');
                recommendations.push('Contrôle médical annuel recommandé');
                if (!factors.includes('Activité physique élevée (facteur protecteur)')) {
                    recommendations.push('Augmentez votre activité physique');
                }
                break;

            case 'moderate':
                recommendations.push('Consultez votre médecin dans les 3 mois');
                recommendations.push('Surveillez régulièrement votre tension et cholestérol');
                recommendations.push('Adoptez une alimentation équilibrée');
                recommendations.push('Pratiquez une activité physique régulière');
                if (factors.includes('Tabagisme')) {
                    recommendations.push('Arrêt du tabac fortement recommandé');
                }
                break;

            case 'high':
                recommendations.push('Consultation médicale URGENTE recommandée');
                recommendations.push('Surveillance médicale rapprochée nécessaire');
                recommendations.push('Modification immédiate du style de vie');
                recommendations.push('Traitement médicamenteux possible');
                if (factors.includes('Tabagisme')) {
                    recommendations.push('Arrêt du tabac IMMÉDIAT');
                }
                break;
        }

        return recommendations;
    }    displayResults() {
        // Masquer toutes les étapes
        document.querySelectorAll('.test-step').forEach(step => {
            step.classList.remove('active');
        });

        // Afficher les résultats (étape 5)
        const resultsStep = document.getElementById('step5');
        if (resultsStep) {
            resultsStep.classList.add('active');
            this.currentStep = 5;
            this.updateProgress();
            this.renderResults();
            console.log('✅ Résultats affichés');
        } else {
            console.error('❌ Section des résultats non trouvée');
        }
    }    renderResults() {
        const riskResultElement = document.getElementById('riskResult');
        const recommendationsElement = document.getElementById('recommendations');

        if (riskResultElement) {
            const riskTexts = {
                low: 'Risque Faible',
                moderate: 'Risque Modéré',
                high: 'Risque Élevé'
            };
            
            const riskColors = {
                low: 'success',
                moderate: 'warning',
                high: 'danger'
            };
            
            riskResultElement.innerHTML = `
                <div class="risk-level ${riskColors[this.testResults.riskLevel]}">
                    <div class="risk-percentage">${this.testResults.percentage}%</div>
                    <div class="risk-label">${riskTexts[this.testResults.riskLevel]}</div>
                </div>
                <div class="risk-progress">
                    <div class="progress-bar ${riskColors[this.testResults.riskLevel]}" 
                         style="width: ${this.testResults.percentage}%"></div>
                </div>
                <div class="risk-factors">
                    <h4><i class="fas fa-exclamation-triangle"></i> Facteurs identifiés:</h4>
                    <ul>
                        ${this.testResults.factors.map(factor => `<li>${factor}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (recommendationsElement) {
            recommendationsElement.innerHTML = `
                <h4><i class="fas fa-lightbulb"></i> Recommandations personnalisées:</h4>
                <ul class="recommendations-list">
                    ${this.testResults.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            `;
        }
        
        console.log('✅ Résultats rendus dans le DOM');
    }

    validateAllData() {
        const requiredFields = ['age', 'gender', 'bloodPressure', 'cholesterol', 'heartRate'];
        return requiredFields.every(field => this.testData[field]);
    }

    restartTest() {
        this.currentStep = 1;
        this.testData = {};
        this.testResults = null;
        
        // Réinitialiser tous les champs
        document.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
            input.classList.remove('valid', 'invalid');
        });

        // Supprimer tous les messages de validation
        document.querySelectorAll('.field-feedback').forEach(feedback => {
            feedback.remove();
        });

        // Retourner à la première étape
        this.showStep(1);
        
        this.showNotification('Test réinitialisé', 'info');
    }

    // =================== SYSTÈME PDF PROFESSIONNEL ===================
    
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
            console.log('✅ jsPDF trouvé via window.jsPDF');
        } else if (typeof jsPDF !== 'undefined') {
            jsPDFConstructor = jsPDF;
            console.log('✅ jsPDF trouvé via jsPDF global');
        } else if (window.jspdf && window.jspdf.jsPDF) {
            jsPDFConstructor = window.jspdf.jsPDF;
            console.log('✅ jsPDF trouvé via window.jspdf.jsPDF');
        }
        
        if (jsPDFConstructor) {
            try {
                console.log('🔄 Génération du PDF professionnel en cours...');
                this.createProfessionalPDF(jsPDFConstructor, saveData);
                this.showNotification('✅ PDF généré avec succès!', 'success');
            } catch (error) {
                console.error('❌ Erreur lors de la génération PDF:', error);
                this.fallbackToJSON(saveData);
            }
        } else {
            console.warn('⚠️ jsPDF non disponible, téléchargement JSON...');
            this.fallbackToJSON(saveData);
        }
    }

    createProfessionalPDF(jsPDFConstructor, saveData) {
        const doc = new jsPDFConstructor();
        
        // Métadonnées du document
        const reportDate = new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const reportNumber = `RAP-${Date.now().toString().slice(-6)}`;
        
        // =================== PAGE DE COUVERTURE ===================
        this.createCoverPage(doc, reportDate, reportNumber);
        
        // =================== PAGE 2: TABLE DES MATIÈRES ===================
        doc.addPage();
        this.createTableOfContents(doc);
        
        // =================== PAGE 3: CONTENU PRINCIPAL ===================
        doc.addPage();
        this.createMainContent(doc, reportDate, reportNumber);
        
        // =================== PAGE 4: RECOMMANDATIONS ET AVERTISSEMENTS ===================
        doc.addPage();
        this.createRecommendationsPage(doc);
        
        // Sauvegarder le PDF
        const fileName = `rapport-cardiacare-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        console.log(`✅ PDF sauvegardé: ${fileName}`);
    }

    createCoverPage(doc, reportDate, reportNumber) {
        // Arrière-plan dégradé (simulé)
        doc.setFillColor(240, 248, 255);
        doc.rect(0, 0, 210, 297, 'F');
        
        // En-tête principal avec fond bleu
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 210, 60, 'F');
        
        // Logo et titre principal
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
        
        // Encadré informations patient
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
        doc.text(`Patient: ${this.testData.gender === 'M' ? 'Homme' : 'Femme'}, ${this.testData.age || 'âge non renseigné'} ans`, 
                 105, 150, { align: 'center' });
        doc.text(`Date d'évaluation: ${reportDate}`, 105, 160, { align: 'center' });
        doc.text(`Numéro de rapport: ${reportNumber}`, 105, 170, { align: 'center' });
        
        // Résultat principal avec couleur
        const riskColors = {
            low: [34, 139, 34],
            moderate: [255, 165, 0],
            high: [231, 76, 60]
        };
        
        const riskTexts = {
            low: 'RISQUE FAIBLE',
            moderate: 'RISQUE MODÉRÉ',
            high: 'RISQUE ÉLEVÉ'
        };
        
        const riskColor = riskColors[this.testResults.riskLevel];
        doc.setFillColor(...riskColor);
        doc.rect(50, 200, 110, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(riskTexts[this.testResults.riskLevel], 105, 215, { align: 'center' });
        doc.setFontSize(14);
        doc.text(`Score: ${this.testResults.percentage}%`, 105, 225, { align: 'center' });
        
        // Footer confidentiel
        doc.setTextColor(128, 128, 128);
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("Ce rapport est confidentiel et destiné uniquement au patient concerné", 105, 260, { align: 'center' });
        doc.text("Consultation médicale recommandée pour toute décision thérapeutique", 105, 270, { align: 'center' });
    }

    createTableOfContents(doc) {
        // En-tête de la table des matières
        doc.setFillColor(52, 73, 94);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("TABLE DES MATIÈRES", 105, 15, { align: 'center' });
        
        // Contenu de la table
        let yPos = 50;
        doc.setTextColor(52, 73, 94);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        const tocItems = [
            "1. Informations Patient ......................................................... 3",
            "2. Données Vitales ............................................................. 3",
            "3. Facteurs de Risque .......................................................... 3",
            "4. Symptômes Déclarés ........................................................ 3",
            "5. Activité Physique ........................................................... 3",
            "6. Résultats de l'Évaluation .................................................. 3",
            "7. Recommandations Personnalisées ........................................ 4",
            "8. Avertissement Médical ..................................................... 4"
        ];
        
        tocItems.forEach(item => {
            doc.text(item, 30, yPos);
            yPos += 12;
        });
        
        // Note importante
        doc.setFillColor(255, 249, 196);
        doc.rect(20, yPos + 20, 170, 40, 'F');
        doc.setTextColor(184, 134, 11);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("NOTE IMPORTANTE", 30, yPos + 35);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Cette évaluation utilise l'intelligence artificielle pour analyser vos données", 30, yPos + 45);
        doc.text("et estimer votre risque cardiovasculaire de manière indicative.", 30, yPos + 52);
    }

    createMainContent(doc, reportDate, reportNumber) {
        // En-tête de page
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 210, 35, 'F');
        
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
        
        // Couleurs du thème
        const primaryColor = [41, 128, 185];
        const grayColor = [52, 73, 94];
        const lightGray = [236, 240, 241];
        
        let yPosition = 50;
        
        // =================== INFORMATIONS PATIENT ===================
        this.addSection(doc, "📋 INFORMATIONS PATIENT", yPosition, lightGray, grayColor);
        yPosition += 20;
        
        const patientInfo = [
            [`Âge:`, `${this.testData.age || 'Non renseigné'} ans`],
            [`Sexe:`, `${this.testData.gender === 'M' ? 'Masculin' : this.testData.gender === 'F' ? 'Féminin' : 'Non renseigné'}`]
        ];
        
        yPosition = this.addInfoTable(doc, patientInfo, yPosition, grayColor);
        
        // =================== DONNÉES VITALES ===================
        if (this.testData.bloodPressure || this.testData.cholesterol || this.testData.heartRate) {
            this.addSection(doc, "💓 DONNÉES VITALES", yPosition, lightGray, grayColor);
            yPosition += 20;
            
            const vitalSigns = [];
            if (this.testData.bloodPressure) vitalSigns.push(['Tension artérielle:', `${this.testData.bloodPressure} mmHg`]);
            if (this.testData.cholesterol) vitalSigns.push(['Cholestérol total:', `${this.testData.cholesterol} mg/dL`]);
            if (this.testData.heartRate) vitalSigns.push(['Fréquence cardiaque:', `${this.testData.heartRate} bpm`]);
            
            yPosition = this.addInfoTable(doc, vitalSigns, yPosition, grayColor);
        }
        
        // =================== FACTEURS DE RISQUE ===================
        this.addSection(doc, "⚠️ FACTEURS DE RISQUE", yPosition, lightGray, grayColor);
        yPosition += 20;
        
        const riskFactors = [
            ['Tabagisme:', this.testData.smoking === 'true' ? '✓ Oui' : '✗ Non'],
            ['Diabète:', this.testData.diabetes === 'true' ? '✓ Oui' : '✗ Non'],
            ['Antécédents familiaux:', this.testData.familyHistory === 'true' ? '✓ Oui' : '✗ Non']
        ];
        
        yPosition = this.addRiskTable(doc, riskFactors, yPosition, grayColor);
        
        // =================== RÉSULTATS DE L'ÉVALUATION ===================
        doc.setFillColor(...primaryColor);
        doc.rect(15, yPosition - 5, 180, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("📊 RÉSULTATS DE L'ÉVALUATION", 20, yPosition + 7);
        
        yPosition += 25;
        yPosition = this.addResultsSection(doc, yPosition, grayColor);
    }

    createRecommendationsPage(doc) {
        // En-tête
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("RECOMMANDATIONS & AVERTISSEMENTS", 105, 22, { align: 'center' });
        
        let yPosition = 60;
        
        // =================== RECOMMANDATIONS ===================
        doc.setFillColor(34, 139, 34);
        doc.rect(15, yPosition - 5, 180, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("💡 RECOMMANDATIONS PERSONNALISÉES", 20, yPosition + 7);
        
        yPosition += 25;
        doc.setTextColor(52, 73, 94);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        
        this.testResults.recommendations.forEach(recommendation => {
            doc.text(`• ${recommendation}`, 25, yPosition);
            yPosition += 8;
        });
        
        yPosition += 20;
        
        // =================== AVERTISSEMENT MÉDICAL ===================
        doc.setFillColor(231, 76, 60);
        doc.rect(15, yPosition - 5, 180, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("⚠️ AVERTISSEMENT MÉDICAL", 20, yPosition + 7);
        
        yPosition += 25;
        doc.setTextColor(52, 73, 94);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        const disclaimers = [
            "• Cette évaluation est uniquement indicative et ne remplace pas un diagnostic médical",
            "• Les résultats sont basés sur un algorithme d'intelligence artificielle",
            "• Une consultation médicale est toujours recommandée pour une évaluation complète",
            "• En cas de symptômes aigus, consultez immédiatement un professionnel de santé",
            "• Ce rapport ne constitue pas une prescription médicale"
        ];
        
        disclaimers.forEach(disclaimer => {
            doc.text(disclaimer, 25, yPosition);
            yPosition += 8;
        });
        
        // Footer professionnel
        yPosition = 260;
        doc.setTextColor(128, 128, 128);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text("CardiaCare - Intelligence Artificielle Médicale", 105, yPosition, { align: 'center' });
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 
                 105, yPosition + 8, { align: 'center' });
        doc.text("Ce document est confidentiel et protégé par le secret médical", 105, yPosition + 16, { align: 'center' });
    }

    // Méthodes utilitaires pour le PDF
    addSection(doc, title, yPosition, lightGray, grayColor) {
        doc.setFillColor(...lightGray);
        doc.rect(15, yPosition - 5, 180, 12, 'F');
        doc.setTextColor(...grayColor);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, 20, yPosition + 3);
    }

    addInfoTable(doc, data, yPosition, grayColor) {
        doc.setTextColor(...grayColor);
        doc.setFontSize(11);
        
        data.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.text(label, 25, yPosition);
            doc.setFont("helvetica", "normal");
            doc.text(value, 80, yPosition);
            yPosition += 8;
        });
        
        return yPosition + 10;
    }

    addRiskTable(doc, data, yPosition, grayColor) {
        doc.setFontSize(11);
        
        data.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...grayColor);
            doc.text(label, 25, yPosition);
            doc.setFont("helvetica", "normal");
            
            // Couleur selon le risque
            if (value.includes('✓')) {
                doc.setTextColor(231, 76, 60); // Rouge
            } else {
                doc.setTextColor(34, 139, 34); // Vert
            }
            doc.text(value, 80, yPosition);
            yPosition += 8;
        });
        
        return yPosition + 10;
    }

    addResultsSection(doc, yPosition, grayColor) {
        // Niveau de risque avec couleur
        const riskColors = {
            low: [34, 139, 34],
            moderate: [255, 165, 0],
            high: [231, 76, 60]
        };
        
        const riskTexts = {
            low: ['RISQUE FAIBLE', 'Votre profil présente un risque cardiovasculaire faible'],
            moderate: ['RISQUE MODÉRÉ', 'Surveillance recommandée - Consultez votre médecin'],
            high: ['RISQUE ÉLEVÉ', 'Consultation médicale urgente recommandée']
        };
        
        const [riskLabel, riskDescription] = riskTexts[this.testResults.riskLevel];
        const riskColor = riskColors[this.testResults.riskLevel];
        
        // Encadré coloré pour le niveau de risque
        doc.setFillColor(...riskColor);
        doc.rect(20, yPosition - 3, 170, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(riskLabel, 25, yPosition + 5);
        doc.setFontSize(12);
        doc.text(`Score: ${this.testResults.percentage}%`, 25, yPosition + 13);
        
        // Barre de progression
        yPosition += 30;
        doc.setTextColor(...grayColor);
        doc.setFontSize(10);
        doc.text("Score de risque cardiovasculaire:", 25, yPosition);
        yPosition += 8;
        
        // Fond de la barre
        doc.setFillColor(220, 220, 220);
        doc.rect(25, yPosition, 160, 8, 'F');
        
        // Barre colorée
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
        
        return yPosition + 15;
    }

    // Méthode de fallback vers JSON
    fallbackToJSON(saveData) {
        try {
            const dataStr = JSON.stringify(saveData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `cardiacare-test-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('⚠️ PDF non disponible - Données sauvegardées en JSON', 'warning', 5000);
            
        } catch (error) {
            console.error('Erreur lors du fallback JSON:', error);
            this.showNotification('❌ Erreur lors de la sauvegarde', 'error');
        }
    }

    // =================== AUTRES MÉTHODES ===================

    goToChat() {
        if (this.testResults) {
            // Préparer les données pour le chat
            const chatData = {
                testCompleted: true,
                riskLevel: this.testResults.riskLevel,
                riskScore: this.testResults.percentage,
                factors: this.testResults.factors,
                recommendations: this.testResults.recommendations
            };
            
            // Sauvegarder dans sessionStorage pour le chat
            sessionStorage.setItem('chat-context', JSON.stringify(chatData));
            
            // Rediriger vers le chat
            window.location.href = '/chat';
        } else {
            this.showNotification('Veuillez d\'abord terminer le test', 'warning');
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Créer l'élément de notification s'il n'existe pas
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 300px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(notification);
        }

        // Définir les couleurs selon le type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        // Afficher la notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Masquer après la durée spécifiée
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, duration);
    }

    // Méthodes pour récupérer les données
    getTestSummary() {
        return {
            testData: this.testData,
            results: this.testResults,
            completed: !!this.testResults,
            duration: this.testResults ? Date.now() - this.startTime : null
        };
    }

    exportTestData() {
        const summary = this.getTestSummary();
        console.log('Résumé du test:', summary);
        return summary;
    }
}

// Fonctions globales pour compatibilité
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

// Utilitaires pour les tests et démos
window.TestUtils = {
    fillTestData: (level = 'moderate') => {
        if (!window.cardiacTest) return;
        
        const testData = {
            low: {
                age: 35, gender: 'F', bloodPressure: 115, cholesterol: 180, heartRate: 65,
                smoking: 'false', diabetes: 'false', familyHistory: 'false', activity: 'high', symptoms: []
            },
            moderate: {
                age: 55, gender: 'M', bloodPressure: 135, cholesterol: 220, heartRate: 75,
                smoking: 'false', diabetes: 'false', familyHistory: 'true', activity: 'moderate', symptoms: ['fatigue']
            },
            high: {
                age: 65, gender: 'M', bloodPressure: 155, cholesterol: 260, heartRate: 85,
                smoking: 'true', diabetes: 'true', familyHistory: 'true', activity: 'low', symptoms: ['chest_pain', 'shortness_breath']
            }
        };
        
        const data = testData[level];
        if (!data) return;
        
        // Remplir les champs automatiquement
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`input[name="${key}"]`);
            if (element) {
                if (element.type === 'radio') {
                    const radio = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
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
        
        window.cardiacTest.showNotification(`✅ Test pré-rempli avec profil "${level}"`, 'success');
    },
    
    simulateQuickTest: async () => {
        if (!window.cardiacTest) return;
        
        window.TestUtils.fillTestData('moderate');
        
        // Passer rapidement les étapes
        for (let i = 1; i <= 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            window.cardiacTest.nextStep();
        }
        
        // Lancer l'analyse
        setTimeout(() => {
            window.cardiacTest.analyzeRisk();
        }, 1000);
    },
    
    testSteps: () => {
        console.log('🔍 Test de navigation des étapes:');
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
                console.log(`➡️ Passage à l'étape ${i}`);
                window.cardiacTest.showStep(i);
            }, i * 1000);
        }
    },
    
    testPDF: () => {
        if (!window.cardiacTest) {
            console.error('CardiacTest non initialisé');
            return false;
        }
        
        // Simuler des résultats de test
        window.cardiacTest.testResults = {
            percentage: 45,
            riskLevel: 'moderate',
            factors: ['Âge > 50 ans', 'Antécédents familiaux'],
            recommendations: ['Consultez votre médecin', 'Surveillez votre tension'],
            analysisDate: new Date().toISOString()
        };
        
        // Données de test
        window.cardiacTest.testData = {
            age: 55,
            gender: 'M',
            bloodPressure: 135,
            cholesterol: 220,
            heartRate: 75,
            smoking: 'false',
            diabetes: 'false',
            familyHistory: 'true',
            activity: 'moderate'
        };
        
        // Générer le PDF
        window.cardiacTest.saveResults();
        return true;
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🫀 Initialisation du Test Cardiaque IA CardiaCare...');
    
    // Vérifier jsPDF
    setTimeout(() => {
        console.log('🔍 Vérification jsPDF:');
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
        
        // Message de bienvenue
        setTimeout(() => {
            if (window.cardiacTest?.showNotification) {
                window.cardiacTest.showNotification('✅ Test cardiaque initialisé avec succès', 'success');
            }
        }, 1500);
        
        console.log('✅ CardiaCare Test initialisé avec succès');
        console.log('💡 Commandes disponibles:');
        console.log('   - TestUtils.fillTestData("low/moderate/high")');
        console.log('   - TestUtils.simulateQuickTest()');
        console.log('   - TestUtils.testPDF()');
        console.log('   - cardiacTest.showStep(1-5) pour naviguer');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
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

console.log('🫀 CardiaCare Test Cardiaque IA - Version Professionnelle Chargée');
console.log('📊 Système PDF Professionnel Intégré');
console.log('🎯 Compatible avec le système ML de CardiaCare');
