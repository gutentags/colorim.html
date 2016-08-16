"use strict";

var O = require("pop-observe");
var Swatch = require("./swatch");

module.exports = Essay;
function Essay() {
    this.fore = new Swatch();
    this.eventState = new EventState(this);
}

Essay.prototype.hookup = function (id, child, scope) {
    if (id === "this") {
        this.sheet = scope.components.style.sheet;
        this.colorText = scope.components.color;
        this.colorField = scope.components.colorField;
        window.addEventListener("keypress", this);
        window.addEventListener("keydown", this);
        window.addEventListener("keyup", this);
        this.colorField.focus();
        this.colorField.delegate = this;
        this.sheeted = false;

        this.colorField.hash = window.location.hash;

        this.handleColorChange(this.colorField.value);
    }
};

Essay.prototype.destroy = function () {
};

Essay.prototype.handleEvent = function (event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    this.eventState = this.eventState.handleEvent(event, key, keyCode);
};

Essay.prototype.handleHashChange = function handleHashChange(hash, swatch) {
    window.history.replaceState(
        swatch,
        swatch.toStyle(),
        this.colorField.hash
    );
};

Essay.prototype.paste = function paste(color) {
    var match = /(\d+),\s*(\d+\.\d+)%,\s*(\d+\.\d+)%/.exec(color);
    if (!match) {
        return;
    }
    var hue = +match[1];
    var saturation = +match[2];
    var lightness = +match[3];
    this.colorField.spectra[0].set(hue);
    this.colorField.spectra[1].set(saturation);
    this.colorField.spectra[2].set(lightness);
};

Essay.prototype.handleColorChange = function (swatch) {
    this.fore.assign(swatch);
    this.fore.lightness = (1 - Math.round(swatch.lightness));

    var chosenColorStyle = swatch.toStyle();
    var foreColorStyle = this.fore.toStyle();

    this.colorText.value = swatch.toStyle();

    if (this.sheet) {
        if (this.sheeted) {
            this.sheet.deleteRule(1);
            this.sheet.deleteRule(0);
        }
        this.sheeted = true;
        this.sheet.insertRule(
            "body, input {" +
                "background-color: " + chosenColorStyle + "; " +
                "color: " + foreColorStyle + "; " +
            "}",
            0
        );
        this.sheet.insertRule(
            "a {" +
                "color: " + foreColorStyle + "; " +
            "}",
            1
        );
    }
};

function EventState(parent) {
    this.parent = parent;
}

EventState.prototype.handleEvent = function handleEvent(event, key, keyCode) {
    if (event.type === "keydown") {
        if (key === 'Meta' || key === 'Control') {
            return new MetaKeyState(this, key, this.parent);
        }
    }
    this.parent.colorField.handleEvent(event, key, keyCode);
    return this;
};

function MetaKeyState(parent, key, essay) {
    this.parent = parent;
    this.key = key;
    this.essay = essay;
    this.colorText = essay.colorText;
    this.pasted = false;
    this.colorText.addEventListener('keyup', this);
    this.colorText.addEventListener('keydown', this);
    this.colorText.addEventListener('keypress', this);
}

MetaKeyState.prototype.blur = function blur() {
    this.colorText.removeEventListener('keyup', this);
    this.colorText.removeEventListener('keydown', this);
    this.colorText.removeEventListener('keypress', this);
    this.colorText.blur();
};

MetaKeyState.prototype.handleEvent = function handleKey(event, key, keyCode) {
    if (event.type === 'keydown') {
        if (key === 'c') {
            this.colorText.select();
        } else if (key === 'v') {
            this.pasted = true;
            this.colorText.select();
        }
    } else {
        if (this.pasted) {
            var color = this.colorText.value;
            this.essay.paste(color);
        }
        this.blur();
        return this.parent.handleEvent(event, key, keyCode);
    }
    return this;
};
