var Sprengja = Sprengja || {};
Sprengja.Menu = {

    show : function() {

        function initButton(resource, callBackFunction) {
            var image = game.add.sprite(game.world.centerX, game.world.centerY, resource);
            image.anchor.set(0.5);
            image.inputEnabled = true;
            image.events.onInputDown.add(callBackFunction, this);
        }
        
        initButton(Sprengja.Resources.NEW_CLIENT_GAME, Sprengja.Menu.startNewLocalGame);
        initButton(Sprengja.Resources.NEW_SERVER_GAME, Sprengja.Menu.startNewServerGame);
    },
    
    hide : function() {
    
    },
    
    startNewLocalGame : function() {
        console.log('NEUES GAME');
    },
    
    startNewServerGame : function() {
    
    }
}
