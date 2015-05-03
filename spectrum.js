"use strict";

var O = require("pop-observe");
var Swatch = require("./swatch");

module.exports = Spectrum;
function Spectrum(body, caller) {
    this.resolution = 0;
    this.divisions = 5;
    this.index = 0;
    this.swatches = [];
    this.reticleColor = new Swatch(0, 1, 0);
    O.makeArrayObservable(this.swatches);
    this._active = false;
}

Spectrum.prototype.resolutions = [
    5,
    25,
    100
];

Spectrum.prototype.breadth = 1;

Object.defineProperty(Spectrum.prototype, "active", {
    get: function () {
        return this._active;
    },
    set: function (active) {
        this._active = active;
        if (active) {
            this.scope.components.reticle.actualNode.classList.add("active");
        } else {
            this.scope.components.reticle.actualNode.classList.remove("active");
        }
    }
});

Spectrum.prototype.add = function add(component, id, scope) {
    var components = scope.components;
    if (id === "spectrum:iteration") {
        components.swatch.actualNode.style.backgroundColor = component.value.toStyle();
        components.swatch.actualNode.style.left = (component.value.index * 60) + 'px';
    } else if (id === "this") {
        components.spectrum.value = this.swatches;
    }
};

Spectrum.prototype.handleEvent = function handleEvent(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    if (event.type === "keypress") {
        if (key === "h") {
            return this.handleLeftCommand();
        } else if (key === "l") {
            return this.handleRightCommand();
        } else if (key === "H") {
            return this.handleShiftLeftCommand();
        } else if (key === "L") {
            return this.handleShiftRightCommand();
        }
    } else if (event.type === "keydown") {
        if (keyCode === 27) {
        } else if (keyCode === 37 && event.shiftKey) {
            return this.handleShiftLeftCommand();
        } else if (keyCode === 37) {
            return this.handleLeftCommand();
        } else if (keyCode === 39 && event.shiftKey) {
            return this.handleShiftRightCommand();
        } else if (keyCode === 39) {
            return this.handleRightCommand();
        }
    }
};

Spectrum.prototype.handleShiftLeftCommand = function () {
    if (this.resolution <= 0) {
        return
    }
    this.setResolution(this.resolution - 1);
};

Spectrum.prototype.handleShiftRightCommand = function () {
    if (this.resolution >= this.resolutions.length - 1) {
        return;
    }
    this.setResolution(this.resolution + 1);
};

Spectrum.prototype.setResolution = function (resolution) {
    var divisions = this.resolutions[resolution];
    this.index = Math.round(this.index * (divisions - 1) / (this.divisions - 1));
    this.divisions = divisions;
    this.resolution = resolution;
    this.update();
};

Spectrum.prototype.handleLeftCommand = function handleLeftCommand() {
    this.index = Math.max(0, this.index - 1);
    this.update();
};

Spectrum.prototype.handleRightCommand = function handleRightCommand() {
    this.index = Math.min(this.index + 1, this.divisions - 1);
    this.update();
};

Spectrum.prototype.update = function update(swatchValue) {
    this.value = this.breadth / (this.divisions - 1) * this.index;
    this.swatches.clear();
    var offset = Math.floor(this.index);
    for (var index = 0; index < this.divisions; index++) {
        var value = (this.breadth / (this.divisions - 1) * index);
        this.swatches.push(this.createSwatch(value, index - offset));
    }
    this.value = this.swatches[offset];
    if (this.value == undefined) {
        throw new Error('This should not be ' + offset);
    }
    this.assign(this.value);
    this.updateReticle(swatchValue);
};

Spectrum.prototype.updateReticle = function updateReticle(swatchValue) {
    if (swatchValue) {
        this.reticleColor.lightness = (1 - Math.round(swatchValue.lightness));
        this.scope.components.reticle.actualNode.style.borderColor = this.reticleColor.toStyle();
    }
};

