(function() {
    // Obtenez l'URL actuelle pour construire le chemin de l'API
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Construire l'URL du point de terminaison Direct Line
    // Dans un environnement de production, vous devez utiliser un service Direct Line approprié
    // Ici nous utilisons une URL locale pour le développement
    const botUrl = `${protocol}//${hostname}:${port}/api/messages`;
    
    // Créer un token temporaire (pour les tests seulement)
    // Dans un environnement de production, utilisez une authentification appropriée
    const tempToken = "test_token";
    
    // Initialiser le Web Chat avec un utilisateur aléatoire
    const userId = 'user-' + Math.random().toString(36).substring(2, 15);
    const username = 'Utilisateur';
    
    // Configuration style WebChat
    const styleOptions = {
        bubbleBackground: '#F5F5F5',
        bubbleBorderColor: '#E5E5E5',
        bubbleBorderRadius: 10,
        bubbleFromUserBackground: '#3498db',
        bubbleFromUserBorderColor: '#2980b9',
        bubbleFromUserBorderRadius: 10,
        bubbleFromUserTextColor: 'white',
        suggestedActionBackgroundColor: '#3498db',
        suggestedActionBorderColor: '#2980b9',
        suggestedActionTextColor: 'white',
        sendBoxButtonColor: '#3498db',
        sendBoxHeight: 50,
        backgroundColor: 'white',
        rootHeight: '100%',
        rootWidth: '100%'
    };
    
    // Créer une connexion directe
    const directLine = window.WebChat.createDirectLine({
        token: tempToken,
        domain: botUrl
    });
    
    // Rendre le composant WebChat
    window.WebChat.renderWebChat({
        directLine: directLine,
        userID: userId,
        username: username,
        locale: 'fr-FR',
        styleOptions: styleOptions
    }, document.getElementById('webchat'));
    
    // Fonction pour envoyer un message au chargement de la page
    setTimeout(() => {
        // Envoyer un message "bonjour" pour lancer la conversation
        directLine.postActivity({
            from: { id: userId, name: username },
            type: 'message',
            text: 'bienvenue'
        }).subscribe();
    }, 1000);
    
    // Focus sur la zone de texte
    document.querySelector('.webchat__send-box-text-box__input').focus();
})();