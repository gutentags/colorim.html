"use strict";

var O = require("pop-observe");
var Swatch = require("./swatch");

module.exports = Spectrum;
function Spectrum(body, scope) {
    this.resolution = 0;
    this.divisions = 5;
    this.index = 0;
    this.swatches = [];
    O.makeArrayObservable(this.swatches);
    this._active = false;
    this.animator = null;
}

Spectrum.prototype.resolutions = [
    5,
    25,
    100
];

Spectrum.prototype.breadth = 1;

Spectrum.prototype.set = function set(value, user) {
    for (var resolution = 0; resolution < this.resolutions.length - 1; resolution++) {
        if (value % this.resolution[resolution] === 0) {
            break;
        }
    }
    var divisions = this.resolutions[resolution];
    this.divisions = divisions;
    this.resolution = resolution;
    this.index = Math.floor(value / 100 * this.divisions);
    this.update(user);
};

Object.defineProperty(Spectrum.prototype, "active", {
    get: function () {
        return this._active;
    },
    set: function (active) {
        this._active = active;
        if (active) {
            this.scope.components.reticle.classList.add("active");
        } else {
            this.scope.components.reticle.classList.remove("active");
        }
    }
});

Spectrum.prototype.hookup = function add(id, component, scope) {
    var components = scope.components;
    if (id === "spectrum:iteration") {
        components.swatch.style.backgroundColor = component.value.toStyle();
        components.swatch.style.left = (component.value.index * 60) + 'px';
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

Spectrum.prototype.handleShiftLeftCommand = function handleShiftLeftCommand() {
    if (this.resolution <= 0) {
        return;
    }
    this.setResolution(this.resolution - 1);
};

Spectrum.prototype.handleShiftRightCommand = function handleShiftRightCommand() {
    if (this.resolution >= this.resolutions.length - 1) {
        return;
    }
    this.setResolution(this.resolution + 1);
};

Spectrum.prototype.setResolution = function setResolution(resolution) {
    var divisions = this.resolutions[resolution];
    this.index = Math.round(this.index * (divisions - 1) / (this.divisions - 1));
    this.divisions = divisions;
    this.resolution = resolution;
    this.update(false);
};

Spectrum.prototype.handleLeftCommand = function handleLeftCommand() {
    this.index = Math.max(0, this.index - 1);
    this.update(false);
};

Spectrum.prototype.handleRightCommand = function handleRightCommand() {
    this.index = Math.min(this.index + 1, this.divisions - 1);
    this.update(false);
};

Spectrum.prototype.update = function update(user) {
    var offset = Math.floor(this.index);
    var value = (this.breadth / (this.divisions - 1) * offset);
    this.value = this.createSwatch(value, offset);
    this.colorField.set(this.value, user);
};

Spectrum.prototype.draw = function draw() {
    this.swatches.clear();
    var offset = Math.floor(this.index);
    for (var index = 0; index < this.divisions; index++) {
        var value = (this.breadth / (this.divisions - 1) * index);
        this.swatches.push(this.createSwatch(value, index - offset));
    }
    // TODO assert this.swatches[offset] equals this.value
    this.scope.components.reticle.style.borderColor = this.colorField.contrastColor.toHSLString();
};

