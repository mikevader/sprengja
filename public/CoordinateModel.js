function CoordinateModel(var worldMin,var worldMax){
    this.worldMin = worldMin;
    this.worldMax = worldMax;
    this.worldRange = worldMax - worldMin;
    this.screenSize = 0;
    this.isDeviceCoordinatesInverted = false;
    this.isWorldCoordinatesInverted = false;
};

CoordinateModel.prototype.getScreenSize(){
    return this.screenSize;
};

CoordinateModel.prototype.setScreenSize(var screenSize){
    this.screenSize = screenSize;
    this.fireModelChanged();
}:

CoordinateModel.prototype.isDeviceCoordinatesInverted(){
    return this.isDeviceCoordinatesInverted;
};

CoordinateModel.prototype.setDeviceCoordinatesInverted(var isDeviceCoordinatesInverted){
    this.isDeviceCoordinatesInverted = isDeviceCoordinatesInverted;
    this.fireModelChanged();
};

CoordinateModel.prototype.isWorldCoordinatesInverted(){
    return this.isWorldCoordinatesInverted;
};

CoordinateModel.prototype.setWorldCoordinatesInverted(var worldCoordinatesInverted){
    this.isWorldCoordinatesInverted = worldCoordinatesInverted;
    this.fireModelChanged();
};

CoordinateModel.prototype.getWorldMin(){
    return this.worldMin;
};

CoordinateModel.prototype.getWorldMax(){
    return this.worldMax;
};

CoordinateModel.prototype.setWorldRange(var worldMin,var worldMax){
    this.worldMin = worldMin;
    this.worldMax = worldMax;
    this.worldRange = worldMax - worldMin;
    this.fireModelChanged();
};

CoordinateModel.prototype.screenToNormalized(var screeValue){
    return (screenValue /  (this.screenSize - 1));
}

CoordinateModel.prototype.screenToWorld(var screenValue){
    var converted = this.screenToNormalized(screenValue);
    converted = this.checkOrientation(converted);
    return ((converted * this.worldRange) + this.worldMin);
};

CoordinateModel.prototype.worldToNormalized(var worldValue){
    return ((worldValue - this.worldMin) / this.worldRange);
};

CoordinateModel.prototype.worldToScreen(var worldValue){
    var converted = this.worldToNormalized(worldValue);
    converted = this.checkOrientation(converted);
    return (converted * (this.screenSize - 1));
};

CoordinateModel.prototype.checkOrientation(var normalizedValue){
    if (this.isDeviceCoordinatesInverted) {
            normalizedValue = 1.0 - normalizedValue;
    }
    if (isWorldCoordinatesInverted) {
            normalizedValue = 1.0 - normalizedValue;
    }
    return normalizedValue;
};

CoordinateModel.prototype.fireModelChanged(){
    CustomEvent event = new CustomEvent("coordinateModelChanged");
    document.dispatchEvent(event);
}