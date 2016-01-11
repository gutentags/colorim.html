"use strict";

var O = require("pop-observe");
var Swatch = require("./swatch");

module.exports = Essay;
function Essay() {
    this.fore = new Swatch();
}

Essay.prototype.hookup = function (id, child, scope) {
    if (id === "this") {
        window.addEventListener("keypress", this);
        window.addEventListener("keydown", this);
        window.addEventListener("keyup", this);
        scope.components.colorField.focus();
        this.observer = O.observePropertyChange(scope.components.colorField, "value", this);
        this.handleValuePropertyChange(scope.components.colorField.value);
        this.sheet = scope.components.style.sheet;
        this.sheeted = false;
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
    this.fore.assign(swatch);
    this.fore.lightness = (1 - Math.round(swatch.lightness));

    var chosenColorStyle = swatch.toStyle();
    var foreColorStyle = this.fore.toStyle();
    this.scope.components.colorStyle.value = chosenColorStyle;


    if (this.sheet) {
        if (this.sheeted) {
            this.sheet.deleteRule(1);
            this.sheet.deleteRule(0);
        }
        this.sheeted = true;
        this.sheet.insertRule(
            "body {" +
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
