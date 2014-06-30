/*global CustomEvent */
'use strict';

function CoordinateModel(worldMin, worldMax) {
    this.worldMin = worldMin;
    this.worldMax = worldMax;
    this.worldRange = worldMax - worldMin;
    this.screenSize = 0;
    this.isDeviceCoordinatesInverted = false;
    this.isWorldCoordinatesInverted = false;
}

CoordinateModel.prototype.getScreenSize = function () {
    return this.screenSize;
};

CoordinateModel.prototype.setScreenSize = function (screenSize) {
    this.screenSize = screenSize;
    this.fireModelChanged();
};

CoordinateModel.prototype.isDeviceCoordinatesInverted = function () {
    return this.isDeviceCoordinatesInverted;
};

CoordinateModel.prototype.setDeviceCoordinatesInverted = function (isDeviceCoordinatesInverted) {
    this.isDeviceCoordinatesInverted = isDeviceCoordinatesInverted;
    this.fireModelChanged();
};

CoordinateModel.prototype.isWorldCoordinatesInverted = function () {
    return this.isWorldCoordinatesInverted;
};

CoordinateModel.prototype.setWorldCoordinatesInverted = function (worldCoordinatesInverted) {
    this.isWorldCoordinatesInverted = worldCoordinatesInverted;
    this.fireModelChanged();
};

CoordinateModel.prototype.getWorldMin = function () {
    return this.worldMin;
};

CoordinateModel.prototype.getWorldMax = function () {
    return this.worldMax;
};

CoordinateModel.prototype.setWorldRange = function (worldMin, worldMax) {
    this.worldMin = worldMin;
    this.worldMax = worldMax;
    this.worldRange = worldMax - worldMin;
    this.fireModelChanged();
};

CoordinateModel.prototype.screenToNormalized = function (screenValue) {
    return (screenValue /  (this.screenSize - 1));
};

CoordinateModel.prototype.screenToWorld = function (screenValue) {
    var converted = this.screenToNormalized(screenValue);
    converted = this.checkOrientation(converted);
    return ((converted * this.worldRange) + this.worldMin);
};

CoordinateModel.prototype.worldToNormalized = function (worldValue) {
    return ((worldValue - this.worldMin) / this.worldRange);
};

CoordinateModel.prototype.worldToScreen = function (worldValue) {
    var converted = this.worldToNormalized(worldValue);
    converted = this.checkOrientation(converted);
    return (converted * (this.screenSize - 1));
};

CoordinateModel.prototype.checkOrientation = function (normalizedValue) {
    if (this.isDeviceCoordinatesInverted) {
        normalizedValue = 1.0 - normalizedValue;
    }
    if (this.isWorldCoordinatesInverted) {
        normalizedValue = 1.0 - normalizedValue;
    }
    return normalizedValue;
};

CoordinateModel.prototype.fireModelChanged = function () {
    var customEvent = new CustomEvent("coordinateModelChanged");
    document.dispatchEvent(customEvent);
};