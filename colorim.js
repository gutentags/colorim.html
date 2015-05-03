"use strict";

var O = require("pop-observe");
var Swatch = require("./swatch");

module.exports = ColorField;
function ColorField(body, caller) {
    this._activeSpectrumIndex = null;
    this.activeSpectrum = null;
    this.spectra = null;
    this.hue = 0;
    this.saturation = 255;
    this.lightness = 255/2;
}

ColorField.prototype.focus = function () {
    this.activeSpectrumIndex = 0;
};

ColorField.prototype.blur = function () {
    this.activeSpectrumIndex = null;
};

Object.defineProperty(ColorField.prototype, "activeSpectrumIndex", {
    get: function () {
        return this._activeSpectrumIndex;
    },
    set: function (index) {
        if (index === this._activeSpectrumIndex) {
            return;
        }
        if (index != null && !this.spectra[index]) {
            return;
        }
        if (this.activeSpectrum) {
            this.activeSpectrum.active = false;
        }
        if (index == null) {
            this._activeSpectrumIndex = null;
            this.activeSpectrum = null;
            return;
        }
        this._activeSpectrumIndex = index;
        this.activeSpectrum = this.spectra[index];
        this.activeSpectrum.active = true;
    }
});

ColorField.prototype.add = function add(component, id, scope) {
    var self = this;
    var components = scope.components;
    if (id === "this") {
        this.spectra = [
            components.hueSpectrum,
            components.saturationSpectrum,
            components.lightnessSpectrum
        ];

        components.hueSpectrum.createSwatch = function (value, index) {
            return new Swatch(value, self.saturation, self.lightness, index);
        };
        components.hueSpectrum.assign = function (swatch) {
            self.value = swatch;
            self.hue = swatch.hue;
            self.update();
        };

        components.saturationSpectrum.index = 4;
        components.saturationSpectrum.createSwatch = function (value, index) {
            return new Swatch(self.hue, value, self.lightness, index);
        };
        components.saturationSpectrum.assign = function (swatch) {
            self.value = swatch;
            self.saturation = swatch.saturation;
            self.update();
        };

        components.lightnessSpectrum.index = 2;
        components.lightnessSpectrum.createSwatch = function (value, index) {
            return new Swatch(self.hue, self.saturation, value, index);
        };
        components.lightnessSpectrum.assign = function (swatch) {
            self.value = swatch;
            self.lightness = swatch.lightness;
            self.update();
        };

        this.update();

    } else if (id === "spectrum:iteration") {
        console.log(component.value.toStyle());
        components.swatch.actualNode.style.backgroundColor = component.value.toStyle();
        components.swatch.actualNode.style.left = (component.value.index * 60) + 'px';
    }
};

ColorField.prototype.handleEvent = function handleEvent(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    if (this._activeSpectrumIndex !== null) {
        this.activeSpectrum.handleEvent(event);
    }
    if (event.type === "keypress") {
        if (key === "h") {
        //    return this.handleLeftCommand();
        } else if (key === "j") {
            return this.handleDownCommand();
        } else if (key === "k") {
            return this.handleUpCommand();
        } else if (key === "l") {
        //    return this.handleRightCommand();
        } else if (key === "H") {
        //    return this.handleShiftLeftCommand();
        } else if (key === "J") {
        //    return this.handleShiftDownCommand();
        } else if (key === "K") {
        //    return this.handleShiftUpCommand();
        } else if (key === "L") {
        //    return this.handleShiftRightCommand();
        }
    } else if (event.type === "keydown") {
        if (keyCode === 27) {
        //    this.value = null;
        } else if (keyCode === 37 && event.shiftKey) {
        //    return this.handleShiftLeftCommand();
        } else if (keyCode === 37) {
        //    return this.handleLeftCommand();
        } else if (keyCode === 38) {
            return this.handleUpCommand();
        } else if (keyCode === 39 && event.shiftKey) {
        //    return this.handleShiftRightCommand();
        } else if (keyCode === 39) {
        //    return this.handleRightCommand();
        } else if (keyCode === 40) {
            return this.handleDownCommand();
        }
    }
};

ColorField.prototype.update = function update() {
    if (this.updating) {
        return;
    }
    if (this.value) {
    console.log(this.value.toStyle());
    }
    this.updating = true;
    var components = this.scope.components;
    components.hueSpectrum.update(this.value);
    components.saturationSpectrum.update(this.value);
    components.lightnessSpectrum.update(this.value);
    components.hueSpectrum.update(this.value);
    components.saturationSpectrum.update(this.value);
    components.lightnessSpectrum.update(this.value);
    components.container.actualNode.style.backgroundColor = this.value.toStyle();
    this.updating = false;
};

ColorField.prototype.handleUpCommand = function handleUpCommand() {
    var index = null;
    if (this._activeSpectrumIndex === null) {
        index = 0;
    } else if (this.spectra[this._activeSpectrumIndex - 1]) {
        index = this._activeSpectrumIndex - 1;
    } else {
        return;
    }
    this.activeSpectrumIndex = index;
};

ColorField.prototype.handleDownCommand = function handleDownCommand() {
    var index = null;
    if (this._activeSpectrumIndex === null) {
        index = 0;
    } else if (this.spectra[this._activeSpectrumIndex + 1]) {
        index = this._activeSpectrumIndex + 1;
    } else {
        return;
    }
    this.activeSpectrumIndex = index;
};

