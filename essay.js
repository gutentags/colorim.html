"use strict";

var O = require("pop-observe");

module.exports = Essay;
function Essay() {
}

Essay.prototype.add = function (child, id, scope) {
    if (id === "this") {
        window.addEventListener("keypress", this);
        window.addEventListener("keydown", this);
        window.addEventListener("keyup", this);
        scope.components.colorField.focus();
        this.observer = O.observePropertyChange(scope.components.colorField, "value", this);
        this.handleValuePropertyChange(scope.components.colorField.value);
    }
};

Essay.prototype.destroy = function () {
    if (this.observer) {
        this.observer.cancel();
    }
};

Essay.prototype.handleEvent = function (event) {
    this.scope.components.colorField.handleEvent(event);
};

Essay.prototype.handleValuePropertyChange = function (swatch) {
    this.scope.components.colorStyle.value = swatch.toStyle();
};
