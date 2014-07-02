var Sprengja = Sprengja || {};
Sprengja.Message = {

    show : function (message) {
        document.getElementById('message').innerHTML = message;
        document.getElementById('message-container').classList.remove('hidden');
    },

    hide : function () {
        var msgContainer = document.getElementById('message-container');
        msgContainer.classList.add('hidden');
    }
}