/*global game, console */
var Sprengja = Sprengja || {};
Sprengja.Menu = {

    newGameMenu: (function () {

        var newClientButton,
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

        function initButton(resource, callBackFunction, y) {
            var image = game.add.sprite(game.world.centerX, y, resource);
            image.anchor.set(0.5);
            image.inputEnabled = true;
            image.events.onInputDown.add(callBackFunction, this);
            return image;
        }

        return {

            show: function () {
                newClientButton = initButton(Sprengja.Resources.NEW_GAME, startNewLocalGame, game.world.centerY);
                buttons = [newClientButton];
            }
        }
    })(),

    text: (function () {

        var centeredText,
            statusText;

        return {
            setStatusText: function (text) {
                if (statusText === undefined) {
                    statusText = game.add.text(20, 20, '', {
                        font: '16px Arial',
                        fill: '#ffffff'
                    });
                }
                statusText.setText(text);
                statusText.visible = true;
            },

            hideStatusText: function () {
                statusText.visible = false;
            },

            setCenteredText: function (text) {
                if (centeredText === undefined) {
                    centeredText = game.add.text(game.world.centerX, game.world.centerY, '', {
                        font: '32px Arial',
                        fill: '#ffffff'
                    });
                }
                centeredText.setText(text);
                centeredText.visible = true;
            },

            hideCenteredText: function () {
                centeredText.visible = false;
            }
        }
    })() // immediate execution


};