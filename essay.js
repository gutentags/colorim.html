"use strict";

var O = require("pop-observe");
var Swatch = require("./swatch");
var Irid = require("irid");

module.exports = Essay;
function Essay() {
    this.fore = null;
    this.back = null;
    this.eventState = new EventState(this);
}

Essay.prototype.hookup = function (id, child, scope) {
    if (id === "this") {
        this.sheet = scope.components.style.sheet;
        this.colorText = scope.components.color;
        this.colorField = scope.components.colorField;

        var colorHandler = new ColorHandler(this);
        this.colorText.addEventListener('keypress', colorHandler);
        this.colorText.addEventListener('keydown', colorHandler);
        this.colorText.addEventListener('keyup', colorHandler);

        window.addEventListener("keypress", this);
        window.addEventListener("keydown", this);
        window.addEventListener("keyup", this);
        this.colorField.focus();
        this.colorField.delegate = this;
        this.sheeted = false;

        this.colorField.hash = window.location.hash || '#0,2,12,7,0,5,2,0,5,2';

        this.colorField.update(false);
    }
};

Essay.prototype.destroy = function () {
};

Essay.prototype.handleEvent = function (event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    this.eventState = this.eventState.handleEvent(event, key, keyCode);
};

Essay.prototype.handleHashChange = function handleHashChange(hash, color, contrastColor, id, user) {
    window.history.replaceState(
        color,
        color.toHSLString(),
        hash
    );
};

Essay.prototype.handleColorChange = function (color, contrastColor, id, user) {
    var colorStyle = color.toHSLString();
    var constrastColorStyle = contrastColor.toHSLString();

    if (!user) {
        this.colorText.value = colorStyle;
    }

    if (this.sheet) {
        if (this.sheeted) {
            this.sheet.deleteRule(1);
            this.sheet.deleteRule(0);
        }
        this.sheeted = true;
        this.sheet.insertRule(
            "body, input {" +
                "background-color: " + colorStyle + "; " +
                "color: " + constrastColorStyle + "; " +
            "}",
            0
        );
        this.sheet.insertRule(
            "a {" +
                "color: " + constrastColorStyle + "; " +
            "}",
            1
        );
    }
};

Essay.prototype.paste = function paste(color) {
    var user = true;
    if (!Irid.canInterpret(color)) {
        return;
    }
    var irid = new Irid(color);
    this.colorField.spectra[0].set(irid.hue() * 360, user);
    this.colorField.spectra[1].set(irid.saturation() * 100, user);
    this.colorField.spectra[2].set(irid.lightness() * 100, user);
};

function ColorHandler(essay) {
    this.essay = essay;
}

ColorHandler.prototype.handleEvent = function handleEvent(event) {
    var key = event.key || String.fromCharCode(event.charCode);
    var keyCode = event.keyCode || event.charCode;
    if (event.type === 'keyup') {
        if (keyCode == 27) { // escape
            this.essay.colorText.blur();
        }
    }
    this.essay.paste(event.target.value);
    event.stopPropagation();
};

function EventState(parent) {
    this.parent = parent;
}

EventState.prototype.handleEvent = function handleEvent(event, key, keyCode) {
    if (event.type === 'keydown') {
        if (key === 'Meta' || key === 'Control') {
            return new MetaKeyState(this, key, this.parent);
        }
    } else if (event.type === 'keypress') {
        if (key === '/') {
            this.parent.colorText.select();
            event.preventDefault();
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
