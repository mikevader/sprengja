var Sprengja = Sprengja || {};
Sprengja.Message = {

    show : function (message) {
        document.getElementById('message-text').innerHTML = message;
        document.getElementById('message-container').classList.remove('hidden');
    },

    hide : function () {
        document.getElementById('message-container').classList.add('hidden');
        document.getElementById('input').classList.add('hidden');
        document.getElementById('text-input-ok').onclick = null;
        document.getElementById('text-input').value = null;
    },

    query : function (message, buttonText, callback) {
        var okButton = document.getElementById('text-input-ok');

        okButton.onclick = callback;
        okButton.innerHTML = buttonText;

        document.getElementById('input').classList.remove('hidden');
        this.show(message);
    },

    getInputText : function () {
        return document.getElementById('text-input').value;
    }
}