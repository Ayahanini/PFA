document.addEventListener('DOMContentLoaded', function() {
    // Gestion des onglets Patient/Médecin
    const patientTab = document.getElementById('patient-tab');
    const doctorTab = document.getElementById('doctor-tab');
    
    patientTab.addEventListener('click', function() {
        patientTab.classList.add('active');
        doctorTab.classList.remove('active');
    });
    
    doctorTab.addEventListener('click', function() {
        doctorTab.classList.add('active');
        patientTab.classList.remove('active');
    });

    // Gestion du formulaire
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = patientTab.classList.contains('active') ? 'patient' : 'medecin';
        
        // Ici vous ajouterez la logique de connexion réelle
        console.log('Tentative de connexion :', { email, password, role });
        
        // Simulation de redirection
        alert(`Connexion réussie en tant que ${role} !`);
        // window.location.href = role === 'patient' ? '/profile.html' : '/admin.html';
    });
});