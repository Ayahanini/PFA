document.addEventListener('DOMContentLoaded', () => {
    // Récupération des données patient
    const patientData = JSON.parse(localStorage.getItem('patientData')) || loadDefaultData();
    
    // Remplissage des champs
    populatePatientData(patientData);
    
    // Gestion des événements
    setupEventListeners();
});

function populatePatientData(data) {
    // Informations de base
    document.getElementById('patient-name').textContent = data.fullName || "Patient";
    document.getElementById('patient-details').textContent = 
        `Âge: ${data.age || '--'} • Sexe: ${data.gender || '--'} • Groupe: ${data.bloodType || '--'}`;
    
    // Données médicales
    document.getElementById('blood-pressure').textContent = data.bloodPressure || "--/-- mmHg";
    document.getElementById('heart-rate').textContent = data.heartRate ? `${data.heartRate} bpm` : "-- bpm";
    document.getElementById('cholesterol').textContent = data.cholesterol ? `${data.cholesterol} g/L` : "-- g/L";
    document.getElementById('weight').textContent = data.weight ? `${data.weight} kg` : "-- kg";
    
    // Calcul du risque (simplifié)
    calculateRisk(data);
    
    // Rappels
    populateReminders(data.reminders || []);
}

function setupEventListeners() {
    // Gestion de l'édition
    document.getElementById('edit-btn').addEventListener('click', showEditForm);
    document.getElementById('cancel-edit').addEventListener('click', hideEditForm);
    document.getElementById('medical-form').addEventListener('submit', handleFormSubmit);
    
    // Déconnexion
    document.getElementById('logout-btn').addEventListener('click', () => {
        if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
            localStorage.removeItem('patientData');
            window.location.href = '/login';
        }
    });
}

// Fonctions utilitaires...