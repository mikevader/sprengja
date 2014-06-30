/*global game, console */
var Sprengja = Sprengja || {};
Sprengja.Menu = {

    show : function () {
    
        var newClientButton,
            newServerButton,
            buttons;
        
        function hide(event) {
            var i = 0;
        
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].visible = false;
            }
            event.stop();
        }
        
        function startNewLocalGame(source, event) {
            console.log('Start local game');
            game.state.getCurrentState().initialized = false;
            game.state.getCurrentState().session = null;
            game.state.getCurrentState().initGame();
            hide(event);
        }
    
        function startNewServerGame(source, event) {
            game.state.getCurrentState().initialized = false;
            game.state.getCurrentState().session = null;
            game.state.getCurrentState().initRemoteGame();
            hide(event);
        }
        
        function initButton(resource, callBackFunction, y) {
            var image = game.add.sprite(game.world.centerX, y, resource);
            image.anchor.set(0.5);
            image.inputEnabled = true;
            image.events.onInputDown.add(callBackFunction, this);
            return image;
        }
        
        newClientButton = initButton(Sprengja.Resources.NEW_CLIENT_GAME, startNewLocalGame, game.world.centerY * 0.3);
        newServerButton = initButton(Sprengja.Resources.NEW_SERVER_GAME, startNewServerGame, game.world.centerY);
        buttons = [newClientButton, newServerButton];
    }
};