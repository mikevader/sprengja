var Sprengja = Sprengja || {};
Sprengja.Message = {

    show : function (message) {
        document.getElementById('message-text').innerHTML = message;
        document.getElementById('message-container').classList.remove('hidden');
    },

    showWithOk : function (message) {
        this.showWithButton(message, 'OK', this.hide)
    },

    showWithButton : function (message, buttonText, callback) {
        var button = document.getElementById('button');
        button.onclick = callback;
        button.innerHTML = buttonText;
        button.classList.remove('hidden');
        this.show(message);
    },

    hide : function () {
        document.getElementById('message-container').classList.add('hidden');
        document.getElementById('input').classList.add('hidden');
        var button = document.getElementById('button');
        button.classList.add('hidden');
        button.onclick = null;
        button.innerHTML = null;
        document.getElementById('text-input').value = null;
    },

    query : function (message, buttonText, callback) {
        document.getElementById('input').classList.remove('hidden');
        this.showWithButton(message, buttonText, callback);
    },

    getInputText : function () {
        return document.getElementById('text-input').value;
    }
}