function ScreenDimension() {
    this.width = getScreenWidth();
    this.height = getScreenHeight();
    assureLandscape();

    function getScreenWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }

    function getScreenHeight() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }

    function assureLandscape() {
        if (this.width < this.height) {
            var newWidth = this.height;
            this.height = this.width;
            this.width = newWidth;
        }
    }
}