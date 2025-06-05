// Script principal pour l'index.html
document.addEventListener('DOMContentLoaded', function() {
    // Animation des statistiques
    animateCounters();
    
    // Navigation smooth scroll
    initSmoothScrolling();
    
    // Animation des éléments au scroll
    initScrollAnimations();
    
    // Navigation sticky
    initStickyNavigation();
    
    // Animations d'entrée
    initEntranceAnimations();
});

// Animation des compteurs de statistiques
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 secondes
        const step = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Formatage du nombre
            if (target > 1000) {
                counter.textContent = Math.floor(current).toLocaleString('fr-FR');
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    };
    
    // Observer pour déclencher l'animation quand visible
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

// Navigation smooth scroll
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Compensation navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animations au scroll
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .access-card, .stat-card');
    
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

// Navigation sticky avec effet
function initStickyNavigation() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Cache/montre la navbar selon le sens du scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// Animations d'entrée des éléments
function initEntranceAnimations() {
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
    
    // Animation des cartes flottantes
    const floatingCards = document.querySelectorAll('.card');
    floatingCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, index * 300 + 800);
    });
}

// Gestion des modales et interactions
class UIManager {
    constructor() {
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Boutons d'accès avec animations
        const accessCards = document.querySelectorAll('.access-card');
        accessCards.forEach(card => {
            card.addEventListener('mouseenter', this.handleCardHover);
            card.addEventListener('mouseleave', this.handleCardLeave);
        });
        
        // Gestion des clics avec feedback
        const buttons = document.querySelectorAll('.btn, .access-card');
        buttons.forEach(button => {
            button.addEventListener('click', this.handleButtonClick);
        });
    }
    
    handleCardHover(e) {
        const card = e.currentTarget;
        const arrow = card.querySelector('.access-arrow');
        
        card.style.transform = 'translateY(-8px) scale(1.02)';
        if (arrow) arrow.style.transform = 'translateX(10px)';
    }
    
    handleCardLeave(e) {
        const card = e.currentTarget;
        const arrow = card.querySelector('.access-arrow');
        
        card.style.transform = 'translateY(0) scale(1)';
        if (arrow) arrow.style.transform = 'translateX(0)';
    }
    
    handleButtonClick(e) {
        const button = e.currentTarget;
        
        // Effet de clic
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
        
        // Ripple effect
        this.createRippleEffect(e, button);
    }
    
    createRippleEffect(e, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// Système de notifications
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            min-width: 300px;
            position: relative;
            overflow: hidden;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas ${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        this.container.appendChild(notification);
        
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
        
        return notification;
    }
    
    getBackgroundColor(type) {
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }
    
    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Gestionnaire de performance et monitoring
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.metrics = {
            loadTime: 0,
            interactionCount: 0,
            errorCount: 0
        };
        this.init();
    }
    
    init() {
        // Mesure du temps de chargement
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - this.startTime;
            console.log(`✅ Page chargée en ${Math.round(this.metrics.loadTime)}ms`);
        });
        
        // Compteur d'interactions
        document.addEventListener('click', () => {
            this.metrics.interactionCount++;
        });
        
        // Gestion des erreurs
        window.addEventListener('error', (e) => {
            this.metrics.errorCount++;
            console.error('Erreur détectée:', e.error);
        });
        
        // Log des métriques périodiquement
        setInterval(() => {
            this.logMetrics();
        }, 30000); // Toutes les 30 secondes
    }
    
    logMetrics() {
        console.log('📊 Métriques de performance:', this.metrics);
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
}

// Gestionnaire de thème (mode sombre/clair)
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'light';
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
    }
    
    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.innerHTML = '<i class="fas fa-moon"></i>';
        toggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: var(--primary-color);
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        
        toggle.addEventListener('click', () => this.toggleTheme());
        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'scale(1.1)';
        });
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(toggle);
        this.themeToggle = toggle;
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.storeTheme(this.currentTheme);
    }
    
    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--white', '#1f2937');
            document.documentElement.style.setProperty('--gray-100', '#374151');
            document.documentElement.style.setProperty('--gray-800', '#f3f4f6');
            this.themeToggle && (this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>');
        } else {
            document.documentElement.style.setProperty('--white', '#ffffff');
            document.documentElement.style.setProperty('--gray-100', '#f3f4f6');
            document.documentElement.style.setProperty('--gray-800', '#1f2937');
            this.themeToggle && (this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>');
        }
    }
    
    getStoredTheme() {
        return localStorage.getItem('cardiacare-theme');
    }
    
    storeTheme(theme) {
        localStorage.setItem('cardiacare-theme', theme);
    }
}

// Initialisation des gestionnaires
let uiManager, notificationSystem, performanceMonitor, themeManager;

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des systèmes
    uiManager = new UIManager();
    notificationSystem = new NotificationSystem();
    performanceMonitor = new PerformanceMonitor();
    themeManager = new ThemeManager();
    
    // Message de bienvenue
    setTimeout(() => {
        notificationSystem.show('👋 Bienvenue sur CardiaCare ! Votre santé cardiaque, notre priorité.', 'info', 5000);
    }, 2000);
    
    // Easter egg - Konami Code
    let konamiCode = [];
    const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konami.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konami.join(',')) {
            notificationSystem.show('🎉 Easter egg trouvé ! Vous êtes un vrai geek !', 'success');
            document.querySelector('.hero').style.animation = 'heartbeat 0.5s infinite';
            setTimeout(() => {
                document.querySelector('.hero').style.animation = '';
            }, 2000);
        }
    });
});

// Fonctions utilitaires globales
window.CardiaCare = {
    showNotification: (message, type) => notificationSystem.show(message, type),
    getMetrics: () => performanceMonitor.getMetrics(),
    toggleTheme: () => themeManager.toggleTheme(),
    version: '1.0.0'
};

// CSS pour les animations ajoutées dynamiquement
const additionalStyles = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .fade-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Injection des styles additionnels
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);