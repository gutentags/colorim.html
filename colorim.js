"use strict";

var Irid = require("irid");
var O = require("pop-observe");
var Swatch = require("./swatch");

module.exports = ColorField;
function ColorField(body, scope) {
    this.spectra = null;
    this.animator = scope.animator.add(this);
    // control
    this._activeSpectrumIndex = null;
    this.activeSpectrum = null;
    this.cursorColor = null;
    this.delegate = null;
    // model
    this.hue = 0;
    this.saturation = 1;
    this.lightness = .5;
    this.value = new Swatch(this.hue, this.saturation, this.lightness);
}

ColorField.prototype.focus = function () {
    this.activeSpectrumIndex = 0;
    if (this.delegate) {
        this.update();
    }
};

ColorField.prototype.blur = function () {
    this.activeSpectrumIndex = null;
};

ColorField.prototype.destroy = function destroy() {
    this.animator.destroy();
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
        if (this.delegate) {
            this.update();
        }
    }
});

Object.defineProperty(ColorField.prototype, "hash", {
    get: function get() {
        return '#' +
            this._activeSpectrumIndex + ',' +
            this.spectra[0].resolution + ',' +
            this.spectra[0].divisions + ',' +
            this.spectra[0].index + ',' +
            this.spectra[1].resolution + ',' +
            this.spectra[1].divisions + ',' +
            this.spectra[1].index + ',' +
            this.spectra[2].resolution + ',' +
            this.spectra[2].divisions + ',' +
            this.spectra[2].index;
    },
    set: function set(hash) {
        if (!hash) {
            return;
        }
        var parts = hash.slice(1).split(',');
        if (parts.length !== 10) {
            return;
        }
        for (var i = 0; i < parts.length; i++) {
            parts[i] = +parts[i];
            if (parts[i] !== parts[i]) {
                return;
            }
        }
        var i = 0;
        this.activeSpectrumIndex = parts[i++];
        this.spectra[0].resolution = parts[i++];
        this.spectra[0].divisions = parts[i++];
        this.spectra[0].index = parts[i++];
        this.spectra[1].resolution = parts[i++];
        this.spectra[1].divisions = parts[i++];
        this.spectra[1].index = parts[i++];
        this.spectra[2].resolution = parts[i++];
        this.spectra[2].divisions = parts[i++];
        this.spectra[2].index = parts[i++];
        this.spectra[0].update();
        this.spectra[1].update();
        this.spectra[2].update();
    }
});

ColorField.prototype.hookup = function add(id, component, scope) {
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
        components.saturationSpectrum.createSwatch = function (value, index) {
            return new Swatch(self.hue, value, self.lightness, index);
        };
        components.lightnessSpectrum.createSwatch = function (value, index) {
            return new Swatch(self.hue, self.saturation, value, index);
        };

        components.hueSpectrum.colorField = this;
        components.saturationSpectrum.colorField = this;
        components.lightnessSpectrum.colorField = this;

        components.saturationSpectrum.index = 4;
        components.lightnessSpectrum.index = 2;

        components.hueSpectrum.update();

        this.animator.requestDraw();

    } else if (id === "spectrum:iteration") {
        // TODO get rid of this evidently dead code
        components.swatch.actualNode.style.backgroundColor = component.value.toStyle();
        components.swatch.actualNode.style.left = (component.value.index * 60) + 'px';
    }
};

ColorField.prototype.handleEvent = function handleEvent(event, key, keyCode) {
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

ColorField.prototype.set = function set(value, user) {
    this.hue = value.hue;
    this.value = value;
    this.saturation = value.saturation;
    this.lightness = value.lightness;
    this.update(user);
};

ColorField.prototype.update = function update(user) {
    this.color = new Irid({h: this.hue / 360, s: this.saturation, l: this.lightness});
    this.color._makeRGB(); // XXX workaround TODO fix irid
    this.contrastColor = this.color.contrast();
    if (this.delegate && this.delegate.handleColorChange) {
        this.delegate.handleColorChange(this.color, this.contrastColor, this.id, user);
    }
    if (this.delegate && this.delegate.handleHashChange) {
        this.delegate.handleHashChange(this.hash, this.color, this.contrastColor, this.id, user);
    }
    this.animator.requestDraw();
};

ColorField.prototype.draw = function draw() {
    this.spectra[0].draw();
    this.spectra[1].draw();
    this.spectra[2].draw();
};
