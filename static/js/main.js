// Variables globales
let currentTheme = 'light';

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initAnimations();
    initSmoothScrolling();
    initScrollAnimations();
    animateCounters();
});

// Gestion du thème
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);

    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    showNotification('Thème ' + (currentTheme === 'dark' ? 'sombre' : 'clair') + ' activé', 'info');
}

// Système de notifications
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show';

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Gestion des modales
function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `<h2>${title}</h2>${content}`;
    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// Modales spécifiques
function showLoginModal() {
    const content = `
        <form>
            <div class="form-group">
                <label for="loginEmail">Email</label>
                <input type="email" id="loginEmail" required>
            </div>
            <div class="form-group">
                <label for="loginPassword">Mot de passe</label>
                <input type="password" id="loginPassword" required>
            </div>
            <button type="button" class="btn btn-primary" onclick="handleLogin()" style="width: 100%;">
                <i class="fas fa-sign-in-alt"></i>
                Se connecter
            </button>
        </form>
    `;
    showModal('Connexion', content);
}

function showRegisterModal() {
    const content = `
        <form>
            <div class="form-group">
                <label for="registerName">Nom complet</label>
                <input type="text" id="registerName" required>
            </div>
            <div class="form-group">
                <label for="registerEmail">Email</label>
                <input type="email" id="registerEmail" required>
            </div>
            <div class="form-group">
                <label for="registerPassword">Mot de passe</label>
                <input type="password" id="registerPassword" required>
            </div>
            <div class="form-group">
                <label for="registerConfirm">Confirmer le mot de passe</label>
                <input type="password" id="registerConfirm" required>
            </div>
            <button type="button" class="btn btn-primary" onclick="handleRegister()" style="width: 100%;">
                <i class="fas fa-user-plus"></i>
                S'inscrire
            </button>
        </form>
    `;
    showModal('Inscription', content);
}

function showFeatureModal(feature) {
    const features = {
        'ai': {
            title: 'Intelligence Artificielle Médicale',
            content: 'Notre système IA analyse vos données de santé en temps réel et utilise des algorithmes avancés de machine learning pour détecter les anomalies et prédire les risques potentiels.'
        },
        'chat': {
            title: 'Chatbot Médical 24/7',
            content: 'Notre assistant virtuel est formé sur une vaste base de données médicales et peut répondre à vos questions de santé à tout moment, vous orienter vers les bonnes ressources ou vous alerter en cas de symptômes préoccupants.'
        },
        'reminders': {
            title: 'Rappels Personnalisés',
            content: 'Configurez des rappels pour vos médicaments, rendez-vous médicaux, examens de routine et habitudes de santé. Recevez des notifications intelligentes adaptées à votre emploi du temps.'
        },
        'security': {
            title: 'Sécurité des Données',
            content: 'Vos données sont protégées par un chiffrement AES-256, conformes aux normes HIPAA et GDPR. Nous ne partageons jamais vos informations sans votre consentement explicite.'
        },
        'tracking': {
            title: 'Suivi Personnalisé',
            content: 'Visualisez vos tendances de santé avec des graphiques interactifs, des rapports détaillés et des analyses personnalisées pour mieux comprendre votre état de santé.'
        },
        'mobile': {
            title: 'Application Mobile',
            content: 'Accédez à tous vos outils de santé depuis votre smartphone ou tablette. Interface optimisée pour tous les appareils avec synchronisation en temps réel.'
        },
        'medication': {
            title: 'Gestion des Médicaments',
            content: 'Suivez vos prises de médicaments, gérez vos prescriptions et recevez des alertes pour les renouvellements. Interface simple et intuitive pour une gestion optimale.'
        },
        'monitoring': {
            title: 'Surveillance Cardiaque',
            content: 'Monitoring continu de vos paramètres cardiaques avec alertes automatiques en cas d\'anomalies. Données synchronisées avec vos appareils de santé connectés.'
        }
    };

    const feature_info = features[feature];
    if (feature_info) {
        showModal(feature_info.title, `<p>${feature_info.content}</p>`);
    }
}

function showPrivacyModal() {
    const content = `
        <h3>Politique de Confidentialité</h3>
        <p>Chez CardiaCare, nous prenons la protection de vos données très au sérieux :</p>
        <ul style="text-align: left; margin: 1rem 0;">
            <li>Chiffrement de niveau hospitalier</li>
            <li>Conformité RGPD et HIPAA</li>
            <li>Aucun partage de données sans consentement</li>
            <li>Stockage sécurisé sur serveurs certifiés</li>
            <li>Accès contrôlé et audits réguliers</li>
        </ul>
        <p>Vous gardez le contrôle total sur vos données médicales.</p>
    `;
    showModal('Confidentialité', content);
}

// Actions utilisateur
function handleLogin() {
    showNotification('Connexion réussie ! Redirection en cours...', 'success');
    setTimeout(() => {
        closeModal();
    }, 1500);
}

function handleRegister() {
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;

    if (password !== confirm) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    showNotification('Inscription réussie ! Un email de confirmation a été envoyé.', 'success');
    setTimeout(() => {
        closeModal();
    }, 1500);
}

// Chatbot demo
function showChatDemo() {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
    showNotification('Démo du chatbot activée', 'info');
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Ajouter le message utilisateur
    addChatMessage(message, 'user');
    input.value = '';

    // Simuler une réponse du bot
    setTimeout(() => {
        const responses = [
            "Merci pour votre question. Basé sur vos symptômes, je recommande de consulter un médecin.",
            "Cette douleur pourrait être liée au stress. Essayez des exercices de relaxation.",
            "Vos paramètres semblent normaux. Continuez votre traitement actuel.",
            "Je vous recommande de surveiller votre tension et de prendre rendez-vous avec votre cardiologue.",
            "Ces symptômes peuvent être bénins, mais il est important de les surveiller. Tenez-moi au courant."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

// Calculateur de risque
function calculateRisk() {
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const cholesterol = parseInt(document.getElementById('cholesterol').value);
    const systolic = parseInt(document.getElementById('systolic').value);
    const smoking = document.getElementById('smoking').value === 'yes';
    const diabetes = document.getElementById('diabetes').value === 'yes';

    if (!age || !gender || !cholesterol || !systolic) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }

    // Calcul simple du risque (pour démonstration)
    let riskScore = 0;

    // Facteurs d'âge
    if (age > 65) riskScore += 3;
    else if (age > 55) riskScore += 2;
    else if (age > 45) riskScore += 1;

    // Facteur de genre
    if (gender === 'male') riskScore += 1;

    // Cholestérol
    if (cholesterol > 240) riskScore += 3;
    else if (cholesterol > 200) riskScore += 2;
    else if (cholesterol > 180) riskScore += 1;

    // Tension
    if (systolic > 140) riskScore += 3;
    else if (systolic > 130) riskScore += 2;
    else if (systolic > 120) riskScore += 1;

    // Facteurs de risque supplémentaires
    if (smoking) riskScore += 3;
    if (diabetes) riskScore += 2;

    // Déterminer le niveau de risque
    let riskLevel, riskDescription, riskClass;

    if (riskScore <= 3) {
        riskLevel = 'Faible';
        riskClass = 'low';
        riskDescription = 'Votre risque de maladie cardiaque est faible. Continuez à maintenir un mode de vie sain.';
    } else if (riskScore <= 7) {
        riskLevel = 'Modéré';
        riskClass = 'medium';
        riskDescription = 'Votre risque est modéré. Il est recommandé de consulter votre médecin pour un suivi.';
    } else {
        riskLevel = 'Élevé';
        riskClass = 'high';
        riskDescription = 'Votre risque est élevé. Consultez rapidement un cardiologue.';
    }

    // Afficher les résultats
    const resultDiv = document.getElementById('riskResult');
    const levelDiv = document.getElementById('riskLevel');
    const descDiv = document.getElementById('riskDescription');

    levelDiv.textContent = riskLevel;
    levelDiv.className = `risk-level ${riskClass}`;
    descDiv.textContent = riskDescription;

    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth' });

    showNotification('Calcul de risque terminé', 'success');
}

// Contact
function sendContactMessage() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;

    if (!name || !email || !subject || !message) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }

    showNotification('Message envoyé avec succès ! Nous vous répondrons sous 24h.', 'success');

    // Réinitialiser le formulaire
    document.getElementById('contactForm').reset();
}

// FAQ
function toggleFaq(button) {
    const faqItem = button.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Fermer tous les autres éléments FAQ
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Ouvrir l'élément cliqué si il n'était pas actif
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Utilitaires
function scrollToCalculator() {
    document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
}

function showDashboardInfo() {
    const content = `
        <h3>Tableau de Bord Patient</h3>
        <p>Votre tableau de bord personnel comprend :</p>
        <ul style="text-align: left; margin: 1rem 0;">
            <li>📊 Graphiques de vos données vitales</li>
            <li>📅 Calendrier de vos rendez-vous</li>
            <li>💊 Suivi de vos médicaments</li>
            <li>📈 Évolution de votre état de santé</li>
            <li>🔔 Centre de notifications</li>
            <li>📋 Rapports médicaux personnalisés</li>
        </ul>
        <p>Connectez-vous pour accéder à votre espace personnalisé.</p>
    `;
    showModal('Tableau de Bord', content);
}

function showSocialInfo(platform) {
    showNotification(`Suivez-nous sur ${platform.charAt(0).toUpperCase() + platform.slice(1)} pour les dernières actualités !`, 'info');
}

// Animations
function initAnimations() {
    // Animation du hero
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-buttons');
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';

        setTimeout(() => {
            element.style.transition = 'all 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200 + 300);
    });
}

function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .testimonial-card, .stat-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            if (target > 1000) {
                counter.textContent = Math.floor(current).toLocaleString('fr-FR');
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => observer.observe(counter));
}

// Fermer la modale en cliquant à l'extérieur
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});