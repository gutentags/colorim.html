"use strict";

var O = require("pop-observe");
var Swatch = require("./swatch");
var Spectrum = require("./spectrum");

module.exports = HueSpectrum;
function HueSpectrum(body, scope) {
    this.resolution = 0;
    this.divisions = 3;
    this.index = 1;
    this.swatches = [];
    O.makeArrayObservable(this.swatches);
    this._active = false;
}

HueSpectrum.prototype = Object.create(Spectrum.prototype);
HueSpectrum.prototype.constructor = HueSpectrum;

HueSpectrum.prototype.resolutions = [
    3, // *2
    6, // *2
    12, // *2
    60, // *5
    120, // *2
    360 // *3
];

HueSpectrum.prototype.breadth = 360;

HueSpectrum.prototype.setResolution = function (resolution) {
    var divisions = this.resolutions[resolution];
    this.index = this.index * divisions / this.divisions;
    this.divisions = divisions;
    this.resolution = resolution;
    this.update();
};

HueSpectrum.prototype.handleLeftCommand = function handleLeftCommand() {
    this.index = (this.divisions + this.index - 1) % this.divisions;
    this.update();
};

HueSpectrum.prototype.handleRightCommand = function handleRightCommand() {
    this.index = (this.index + 1) % this.divisions;
    this.update();
};

HueSpectrum.prototype.update = function update() {
    this.swatches.clear();
    var offset = Math.floor(this.divisions / 2);
    var jndex = this.index - offset;
    for (var index = 0; index < this.divisions; index++, jndex++) {
        var value = (this.breadth / this.divisions * jndex) % this.breadth;
        this.swatches.push(this.createSwatch(value, index - offset));
    }
    this.value = this.swatches[offset];
    this.colorField.update(this.value);
};

HueSpectrum.prototype.draw = function draw() {
    this.swatches.clear();
    var offset = Math.floor(this.divisions / 2);
    var jndex = this.index - offset;
    for (var index = 0; index < this.divisions; index++, jndex++) {
        var value = (this.breadth / this.divisions * jndex) % this.breadth;
        this.swatches.push(this.createSwatch(value, index - offset));
    }
    // TODO assert this.swatches[offset] equals this.value
    this.scope.components.reticle.style.borderColor = this.colorField.cursorColor.toStyle();
};

