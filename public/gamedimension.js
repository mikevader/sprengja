function GameDimension() {
    var width = getScreenWidth();
    var height = getScreenHeight();
    assureLandscape();
    assureAspectRatio();

    this.getGameWidth = function() {
        return width;
    }

    this.getGameHeight = function() {
        return height;
    }

    function getScreenWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }

    function getScreenHeight() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }

    function assureLandscape() {
        if (width < height) {
            console.log("Screen is in portrait mode -> switch values!");
            var newWidth = height;
            height = width;
            width = newWidth;
        }
    }

    function assureAspectRatio() {
        var ratioHeight = width / 16 * 9;
        if (ratioHeight < height) {
            height = ratioHeight;
        } else {
            width = height / 9 * 16;
        }
    }
}