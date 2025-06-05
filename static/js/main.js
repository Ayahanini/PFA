// Gestion des onglets Patient/Médecin
const patientBtn = document.getElementById('patient-btn');
const medecinBtn = document.getElementById('medecin-btn');

if (patientBtn && medecinBtn) {
  patientBtn.addEventListener('click', () => {
    patientBtn.classList.add('active');
    medecinBtn.classList.remove('active');
  });
  
  medecinBtn.addEventListener('click', () => {
    medecinBtn.classList.add('active');
    patientBtn.classList.remove('active');
  });
}

// Gestion du formulaire de connexion
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = patientBtn?.classList.contains('active') ? 'patient' : 'medecin';

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });

    const data = await response.json();

    if (data.success) {
      // Stockage des données utilisateur (solution temporaire)
      localStorage.setItem('userData', JSON.stringify(data.user));
      window.location.href = data.redirect;
    } else {
      showAlert(data.message || "Erreur de connexion", 'error');
    }
  } catch (error) {
    console.error("Erreur:", error);
    showAlert("Erreur de connexion au serveur", 'error');
  }
});

// Fonction d'affichage des alertes
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  document.body.prepend(alertDiv);
  
  setTimeout(() => alertDiv.remove(), 5000);
}