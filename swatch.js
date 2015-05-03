"use strict";

module.exports = Swatch;
function Swatch(hue, saturation, lightness, index) {
    this.hue = hue; // 0..359 where 360==0
    this.saturation = saturation; // 0..1
    this.lightness = lightness; // 0..1
    this.index = index;
}

Swatch.prototype.clone = function () {
    return new this.constructor().assign(this);
};

Swatch.prototype.assign = function (swatch) {
    this.hue = swatch.hue;
    this.saturation = swatch.saturation;
    this.lightness = swatch.lightness;
    this.index = swatch.index;
    return this;
};

Swatch.prototype.toStyle = function () {
    return (
        'hsla(' +
        this.hue.toFixed() + ', ' +
        Math.round(this.saturation * 100).toFixed(2) + '%, ' +
        Math.round(this.lightness * 100).toFixed(2) + '%, ' +
        '1)'
    );
};
