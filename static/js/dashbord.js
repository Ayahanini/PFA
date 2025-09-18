$(document).ready(function() {
    // Afficher le formulaire quand on clique sur le bouton
    $("#chatbot-btn").click(function() {
        $("#chatbot-form").removeClass("hidden");
        $(this).hide(); // Cache le bouton "Chat avec HeartBot"
    });

    // Soumission du formulaire
    $("#medical-form").submit(function(e) {
        e.preventDefault();
        
        // Simulation d'analyse (remplacez par votre modèle ML plus tard)
        const age = $("#age").val();
        const bp = $("#blood-pressure").val();
        
        // Afficher les résultats
        $("#chatbot-form").addClass("hidden");
        $("#results").removeClass("hidden");
        
        // Animation simple
        $("#risk-level").hide().fadeIn(1000);
    });

    // Bouton "Envoyer au médecin"
    $("#send-to-doctor").click(function() {
        alert("Rapport envoyé à votre médecin !");
        // Réinitialiser le formulaire
        $("#medical-form")[0].reset();
        $("#results").addClass("hidden");
        $("#chatbot-btn").show();
    });
});