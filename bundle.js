global = this;
(function (modules) {

    // Bundle allows the run-time to extract already-loaded modules from the
    // boot bundle.
    var bundle = {};
    var main;

    // Unpack module tuples into module objects.
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        module = modules[i] = new Module(
            module[0],
            module[1],
            module[2],
            module[3],
            module[4]
        );
        bundle[module.filename] = module;
    }

    function Module(id, dirname, basename, dependencies, factory) {
        this.id = id;
        this.dirname = dirname;
        this.filename = dirname + "/" + basename;
        // Dependency map and factory are used to instantiate bundled modules.
        this.dependencies = dependencies;
        this.factory = factory;
    }

    Module.prototype._require = function () {
        var module = this;
        if (module.exports === void 0) {
            module.exports = {};
            var require = function (id) {
                var index = module.dependencies[id];
                var dependency = modules[index];
                if (!dependency)
                    throw new Error("Bundle is missing a dependency: " + id);
                return dependency._require();
            };
            require.main = main;
            module.exports = module.factory(
                require,
                module.exports,
                module,
                module.filename,
                module.dirname
            ) || module.exports;
        }
        return module.exports;
    };

    // Communicate the bundle to all bundled modules
    Module.prototype.modules = bundle;

    return function require(filename) {
        main = bundle[filename];
        main._require();
    }
})([["animator.js","blick","animator.js",{"raf":27},function (require, exports, module, __filename, __dirname){

// blick/animator.js
// -----------------

"use strict";

var defaultRequestAnimation = require("raf");

module.exports = Animator;

function Animator(requestAnimation) {
    var self = this;
    self._requestAnimation = requestAnimation || defaultRequestAnimation;
    self.controllers = [];
    // This thunk is doomed to deoptimization for multiple reasons, but passes
    // off as quickly as possible to the unrolled animation loop.
    self._animate = function () {
        try {
            self.animate(Date.now());
        } catch (error) {
            self.requestAnimation();
            throw error;
        }
    };
}

Animator.prototype.requestAnimation = function () {
    if (!this.requested) {
        this._requestAnimation(this._animate);
    }
    this.requested = true;
};

Animator.prototype.animate = function (now) {
    var node, temp;

    this.requested = false;

    // Measure
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.measure) {
            controller.component.measure(now);
            controller.measure = false;
        }
    }

    // Transition
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        // Unlke others, skipped if draw or redraw are scheduled and left on
        // the schedule for the next animation frame.
        if (controller.transition) {
            if (!controller.draw && !controller.redraw) {
                controller.component.transition(now);
                controller.transition = false;
            } else {
                this.requestAnimation();
            }
        }
    }

    // Animate
    // If any components have animation set, continue animation.
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.animate) {
            controller.component.animate(now);
            this.requestAnimation();
            // Unlike others, not reset implicitly.
        }
    }

    // Draw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.draw) {
            controller.component.draw(now);
            controller.draw = false;
        }
    }

    // Redraw
    for (var index = 0; index < this.controllers.length; index++) {
        var controller = this.controllers[index];
        if (controller.redraw) {
            controller.component.redraw(now);
            controller.redraw = false;
        }
    }
};

Animator.prototype.add = function (component) {
    var controller = new AnimationController(component, this);
    this.controllers.push(controller);
    return controller;
};

function AnimationController(component, controller) {
    this.component = component;
    this.controller = controller;

    this.measure = false;
    this.transition = false;
    this.animate = false;
    this.draw = false;
    this.redraw = false;
}

AnimationController.prototype.destroy = function () {
};

AnimationController.prototype.requestMeasure = function () {
    if (!this.component.measure) {
        throw new Error("Can't requestMeasure because component does not implement measure");
    }
    this.measure = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelMeasure = function () {
    this.measure = false;
};

AnimationController.prototype.requestTransition = function () {
    if (!this.component.transition) {
        throw new Error("Can't requestTransition because component does not implement transition");
    }
    this.transition = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelTransition = function () {
    this.transition = false;
};

AnimationController.prototype.requestAnimation = function () {
    if (!this.component.animate) {
        throw new Error("Can't requestAnimation because component does not implement animate");
    }
    this.animate = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelAnimation = function () {
    this.animate = false;
};

AnimationController.prototype.requestDraw = function () {
    if (!this.component.draw) {
        throw new Error("Can't requestDraw because component does not implement draw");
    }
    this.draw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelDraw = function () {
    this.draw = false;
};

AnimationController.prototype.requestRedraw = function () {
    if (!this.component.redraw) {
        throw new Error("Can't requestRedraw because component does not implement redraw");
    }
    this.redraw = true;
    this.controller.requestAnimation();
};

AnimationController.prototype.cancelRedraw = function () {
    this.redraw = false;
};

}],["colorim.html","colorim.html","colorim.html",{"./colorim":2,"gutentag/repeat.html":12,"./spectrum.html":8,"./hue-spectrum.html":5},function (require, exports, module, __filename, __dirname){

// colorim.html/colorim.html
// -------------------------

"use strict";
var $SUPER = require("./colorim");
var $REPEAT = require("gutentag/repeat.html");
var $SPECTRUM = require("./spectrum.html");
var $HUE_SPECTRUM = require("./hue-spectrum.html");
var $THIS = function ColorimhtmlColorim(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("container", component);
    if (component.setAttribute) {
    component.setAttribute("class", "colorim");
    }
    if (component.setAttribute) {
        component.setAttribute("id", "container_jb4n1n");
    }
    if (scope.componentsFor["container"]) {
       scope.componentsFor["container"].setAttribute("for", "container_jb4n1n")
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        scope.hookup("center", component);
        if (component.setAttribute) {
        component.setAttribute("class", "center");
        }
        if (component.setAttribute) {
            component.setAttribute("id", "center_auhun5");
        }
        if (scope.componentsFor["center"]) {
           scope.componentsFor["center"].setAttribute("for", "center_auhun5")
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
            component.setAttribute("class", "hueCenter");
            }
            parents[parents.length] = parent; parent = node;
            // DIV
                node = document.createBody();
                parent.appendChild(node);
                parents[parents.length] = parent; parent = node;
                // HUE-SPECTRUM
                    node = {tagName: "hue-spectrum"};
                    node.component = $THIS$0;
                    callee = scope.nest();
                    callee.argument = node;
                    callee.id = "hueSpectrum";
                    component = new $HUE_SPECTRUM(parent, callee);
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                scope.hookup("hueSpectrum", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "hueSpectrum_ks58rw");
                }
                if (scope.componentsFor["hueSpectrum"]) {
                   scope.componentsFor["hueSpectrum"].setAttribute("for", "hueSpectrum_ks58rw")
                }
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
            component.setAttribute("class", "saturationCenter");
            }
            parents[parents.length] = parent; parent = node;
            // DIV
                node = document.createBody();
                parent.appendChild(node);
                parents[parents.length] = parent; parent = node;
                // SPECTRUM
                    node = {tagName: "spectrum"};
                    node.component = $THIS$1;
                    callee = scope.nest();
                    callee.argument = node;
                    callee.id = "saturationSpectrum";
                    component = new $SPECTRUM(parent, callee);
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                scope.hookup("saturationSpectrum", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "saturationSpectrum_31onta");
                }
                if (scope.componentsFor["saturationSpectrum"]) {
                   scope.componentsFor["saturationSpectrum"].setAttribute("for", "saturationSpectrum_31onta")
                }
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
            component.setAttribute("class", "lightnessCenter");
            }
            parents[parents.length] = parent; parent = node;
            // DIV
                node = document.createBody();
                parent.appendChild(node);
                parents[parents.length] = parent; parent = node;
                // SPECTRUM
                    node = {tagName: "spectrum"};
                    node.component = $THIS$2;
                    callee = scope.nest();
                    callee.argument = node;
                    callee.id = "lightnessSpectrum";
                    component = new $SPECTRUM(parent, callee);
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                scope.hookup("lightnessSpectrum", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "lightnessSpectrum_7x0c06");
                }
                if (scope.componentsFor["lightnessSpectrum"]) {
                   scope.componentsFor["lightnessSpectrum"].setAttribute("for", "lightnessSpectrum_7x0c06")
                }
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
module.exports = $THIS;
var $THIS$0 = function ColorimhtmlColorim$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$1 = function ColorimhtmlColorim$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$2 = function ColorimhtmlColorim$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["colorim.js","colorim.html","colorim.js",{"irid":17,"pop-observe":20,"./swatch":10},function (require, exports, module, __filename, __dirname){

// colorim.html/colorim.js
// -----------------------

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

}],["essay.html","colorim.html","essay.html",{"./essay":4,"gutentag/text.html":15,"./colorim.html":1},function (require, exports, module, __filename, __dirname){

// colorim.html/essay.html
// -----------------------

"use strict";
var $SUPER = require("./essay");
var $TEXT = require("gutentag/text.html");
var $COLORIM = require("./colorim.html");
var $THIS = function ColorimhtmlEssay(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("STYLE");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("style", component);
    if (component.setAttribute) {
        component.setAttribute("id", "style_gp7w7");
    }
    if (scope.componentsFor["style"]) {
       scope.componentsFor["style"].setAttribute("for", "style_gp7w7")
    }
    parents[parents.length] = parent; parent = node;
    // STYLE
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
    component.setAttribute("class", "appbox hbox");
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "displaybox linebox");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // DIV
                node = document.createElement("INPUT");
                parent.appendChild(node);
                component = node.actualNode;
                scope.hookup("color", component);
                if (component.setAttribute) {
                component.setAttribute("type", "text");
                }
                if (component.setAttribute) {
                    component.setAttribute("id", "color_dqliz1");
                }
                if (scope.componentsFor["color"]) {
                   scope.componentsFor["color"].setAttribute("for", "color_dqliz1")
                }
                if (component.setAttribute) {
                component.setAttribute("class", "colorimField");
                }
                parents[parents.length] = parent; parent = node;
                // INPUT
                node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "colorbox");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // COLORIM
                node = {tagName: "colorim"};
                node.component = $THIS$0;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "colorField";
                component = new $COLORIM(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("colorField", component);
            if (component.setAttribute) {
                component.setAttribute("id", "colorField_f517jf");
            }
            if (scope.componentsFor["colorField"]) {
               scope.componentsFor["colorField"].setAttribute("for", "colorField_f517jf")
            }
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
        component.setAttribute("class", "helpbox linebox");
        }
        parents[parents.length] = parent; parent = node;
        // DIV
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("I");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // I
                    parent.appendChild(document.createTextNode("arrows"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" move"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("U");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // U
                    parent.appendChild(document.createTextNode("h"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" left"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("U");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // U
                    parent.appendChild(document.createTextNode("l"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" right"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("U");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // U
                    parent.appendChild(document.createTextNode("j"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" down"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("U");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // U
                    parent.appendChild(document.createTextNode("k"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" up"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("U");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // U
                    parent.appendChild(document.createTextNode("H"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" fewer colors"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("U");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // U
                    parent.appendChild(document.createTextNode("L"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" more colors"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("I");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // I
                    parent.appendChild(document.createTextNode("meta"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode("+"));
                node = document.createElement("U");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // U
                    parent.appendChild(document.createTextNode("c"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" copy"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("I");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // I
                    parent.appendChild(document.createTextNode("meta"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode("+"));
                node = document.createElement("U");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // U
                    parent.appendChild(document.createTextNode("v"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" paste"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("I");
                parent.appendChild(node);
                component = node.actualNode;
                parents[parents.length] = parent; parent = node;
                // I
                    parent.appendChild(document.createTextNode("/"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                parent.appendChild(document.createTextNode(" find"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
            component.setAttribute("class", "about");
            }
            parents[parents.length] = parent; parent = node;
            // SPAN
                node = document.createElement("A");
                parent.appendChild(node);
                component = node.actualNode;
                if (component.setAttribute) {
                component.setAttribute("href", "https://github.com/gutentags/colorim.html/");
                }
                parents[parents.length] = parent; parent = node;
                // A
                    parent.appendChild(document.createTextNode("Fork me on Github"));
                node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
module.exports = $THIS;
var $THIS$0 = function ColorimhtmlEssay$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["essay.js","colorim.html","essay.js",{"pop-observe":20,"./swatch":10,"irid":17},function (require, exports, module, __filename, __dirname){

// colorim.html/essay.js
// ---------------------

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

}],["hue-spectrum.html","colorim.html","hue-spectrum.html",{"./hue-spectrum":6,"gutentag/repeat.html":12},function (require, exports, module, __filename, __dirname){

// colorim.html/hue-spectrum.html
// ------------------------------

"use strict";
var $SUPER = require("./hue-spectrum");
var $REPEAT = require("gutentag/repeat.html");
var $THIS = function ColorimhtmlHuespectrum(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
    component.setAttribute("class", "spectrum");
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "spectrum";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("spectrum", component);
        if (component.setAttribute) {
            component.setAttribute("id", "spectrum_5a0oo");
        }
        if (scope.componentsFor["spectrum"]) {
           scope.componentsFor["spectrum"].setAttribute("for", "spectrum_5a0oo")
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("reticle", component);
    if (component.setAttribute) {
    component.setAttribute("class", "reticle");
    }
    if (component.setAttribute) {
        component.setAttribute("id", "reticle_pxs605");
    }
    if (scope.componentsFor["reticle"]) {
       scope.componentsFor["reticle"].setAttribute("for", "reticle_pxs605")
    }
    parents[parents.length] = parent; parent = node;
    // DIV
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
module.exports = $THIS;
var $THIS$0 = function ColorimhtmlHuespectrum$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("swatch", component);
    if (component.setAttribute) {
    component.setAttribute("class", "swatch");
    }
    if (component.setAttribute) {
        component.setAttribute("id", "swatch_iglnti");
    }
    if (scope.componentsFor["swatch"]) {
       scope.componentsFor["swatch"].setAttribute("for", "swatch_iglnti")
    }
    parents[parents.length] = parent; parent = node;
    // DIV
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};

}],["hue-spectrum.js","colorim.html","hue-spectrum.js",{"pop-observe":20,"./swatch":10,"./spectrum":9},function (require, exports, module, __filename, __dirname){

// colorim.html/hue-spectrum.js
// ----------------------------

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

HueSpectrum.prototype.set = function set(value, user) {
    this.index = value * this.divisions / 360;
    this.update(user);
};

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

HueSpectrum.prototype.update = function update(user) {
    this.swatches.clear();
    var offset = Math.floor(this.divisions / 2);
    var jndex = this.index - offset;
    for (var index = 0; index < this.divisions; index++, jndex++) {
        var value = (this.breadth / this.divisions * jndex) % this.breadth;
        this.swatches.push(this.createSwatch(value, index - offset));
    }
    this.value = this.swatches[offset];
    this.colorField.set(this.value, user);
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
    this.scope.components.reticle.style.borderColor = this.colorField.contrastColor.toHSLString();
};


}],["index.js","colorim.html","index.js",{"gutentag/document":11,"gutentag/scope":14,"./essay.html":3,"blick":0},function (require, exports, module, __filename, __dirname){

// colorim.html/index.js
// ---------------------

"use strict";

var Document = require("gutentag/document");
var Scope = require("gutentag/scope");
var Essay = require("./essay.html");
var Animator = require("blick");

var scope = new Scope();
scope.animator = new Animator();
var document = new Document(window.document.body);
var essay = new Essay(document.documentElement, scope);

}],["spectrum.html","colorim.html","spectrum.html",{"./spectrum":9,"gutentag/repeat.html":12},function (require, exports, module, __filename, __dirname){

// colorim.html/spectrum.html
// --------------------------

"use strict";
var $SUPER = require("./spectrum");
var $REPEAT = require("gutentag/repeat.html");
var $THIS = function ColorimhtmlSpectrum(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
    component.setAttribute("class", "spectrum");
    }
    parents[parents.length] = parent; parent = node;
    // DIV
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "spectrum";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("spectrum", component);
        if (component.setAttribute) {
            component.setAttribute("id", "spectrum_mlga9d");
        }
        if (scope.componentsFor["spectrum"]) {
           scope.componentsFor["spectrum"].setAttribute("for", "spectrum_mlga9d")
        }
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("reticle", component);
    if (component.setAttribute) {
    component.setAttribute("class", "reticle");
    }
    if (component.setAttribute) {
        component.setAttribute("id", "reticle_9yvcep");
    }
    if (scope.componentsFor["reticle"]) {
       scope.componentsFor["reticle"].setAttribute("for", "reticle_9yvcep")
    }
    parents[parents.length] = parent; parent = node;
    // DIV
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
};
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
module.exports = $THIS;
var $THIS$0 = function ColorimhtmlSpectrum$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("swatch", component);
    if (component.setAttribute) {
    component.setAttribute("class", "swatch");
    }
    if (component.setAttribute) {
        component.setAttribute("id", "swatch_aa8yqm");
    }
    if (scope.componentsFor["swatch"]) {
       scope.componentsFor["swatch"].setAttribute("for", "swatch_aa8yqm")
    }
    parents[parents.length] = parent; parent = node;
    // DIV
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};

}],["spectrum.js","colorim.html","spectrum.js",{"pop-observe":20,"./swatch":10},function (require, exports, module, __filename, __dirname){

// colorim.html/spectrum.js
// ------------------------

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


}],["swatch.js","colorim.html","swatch.js",{},function (require, exports, module, __filename, __dirname){

// colorim.html/swatch.js
// ----------------------

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

}],["document.js","gutentag","document.js",{"koerper":18},function (require, exports, module, __filename, __dirname){

// gutentag/document.js
// --------------------

"use strict";
module.exports = require("koerper");

}],["repeat.html","gutentag","repeat.html",{"./repeat":13},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.html
// --------------------

"use strict";
module.exports = (require)("./repeat");

}],["repeat.js","gutentag","repeat.js",{"pop-observe":20,"pop-swap":25},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.js
// ------------------


var O = require("pop-observe");
var swap = require("pop-swap");

var empty = [];

module.exports = Repetition;
function Repetition(body, scope) {
    this.body = body;
    this.scope = scope;
    this.iterations = [];
    this.Iteration = scope.argument.component;
    this.id = scope.id;
    this.observer = null;
    this._value = null;
    this.value = [];
}

Object.defineProperty(Repetition.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        if (!Array.isArray(value)) {
            throw new Error('Value of repetition must be an array');
        }
        if (this.observer) {
            this.observer.cancel();
            this.handleValueRangeChange(empty, this._value, 0);
        }
        this._value = value;
        this.handleValueRangeChange(this._value, empty, 0);
        this.observer = O.observeRangeChange(this._value, this, "value");
    }
});

Repetition.prototype.handleValueRangeChange = function (plus, minus, index) {
    var body = this.body;
    var document = this.body.ownerDocument;

    for (var offset = index; offset < index + minus.length; offset++) {
        var iteration = this.iterations[offset];
        body.removeChild(iteration.body);
        iteration.value = null;
        iteration.index = null;
        iteration.body = null;
        if (iteration.destroy) {
            iteration.destroy();
        }
    }

    var nextIteration = this.iterations[index + 1];
    var nextSibling = nextIteration && nextIteration.body;

    var add = [];
    for (var offset = 0; offset < plus.length; offset++) {
        var value = plus[offset];
        var iterationNode = document.createBody();
        var iterationScope = this.scope.nestComponents();

        var iteration = new this.Iteration(iterationNode, iterationScope);

        iteration.value = value;
        iteration.index = index + offset;
        iteration.body = iterationNode;

        iterationScope.hookup(this.scope.id + ":iteration", iteration);

        body.insertBefore(iterationNode, nextSibling);
        add.push(iteration);
    }

    swap(this.iterations, index, minus.length, add);

    // Update indexes
    for (var offset = index; offset < this.iterations.length; offset++) {
        this.iterations[offset].index = offset;
    }
};

Repetition.prototype.redraw = function (region) {
    for (var index = 0; index < this.iterations.length; index++) {
        var iteration = this.iterations[index];
        iteration.redraw(region);
    }
};

Repetition.prototype.destroy = function () {
    this.observer.cancel();
    this.handleValuesRangeChange([], this._value, 0);
};


}],["scope.js","gutentag","scope.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/scope.js
// -----------------

"use strict";

module.exports = Scope;
function Scope() {
    this.root = this;
    this.components = Object.create(null);
    this.componentsFor = Object.create(null);
}

Scope.prototype.nest = function () {
    var child = Object.create(this);
    child.parent = this;
    child.caller = this.caller && this.caller.nest();
    return child;
};

Scope.prototype.nestComponents = function () {
    var child = this.nest();
    child.components = Object.create(this.components);
    child.componentsFor = Object.create(this.componentsFor);
    return child;
};

// TODO deprecated
Scope.prototype.set = function (id, component) {
    console.log(new Error().stack);
    this.hookup(id, component);
};

Scope.prototype.hookup = function (id, component) {
    var scope = this;
    scope.components[id] = component;

    if (scope.this.hookup) {
        scope.this.hookup(id, component, scope);
    } else if (scope.this.add) {
        // TODO deprecated
        scope.this.add(component, id, scope);
    }

    var exportId = scope.this.exports && scope.this.exports[id];
    if (exportId) {
        var callerId = scope.caller.id;
        scope.caller.hookup(callerId + ":" + exportId, component);
    }
};

}],["text.html","gutentag","text.html",{"./text":16},function (require, exports, module, __filename, __dirname){

// gutentag/text.html
// ------------------

"use strict";
module.exports = (require)("./text");

}],["text.js","gutentag","text.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/text.js
// ----------------

"use strict";

module.exports = Text;
function Text(body, scope) {
    var node = body.ownerDocument.createTextNode("");
    body.appendChild(node);
    this.node = node;
    this.defaultText = scope.argument.innerText;
    this._value = null;
}

Object.defineProperty(Text.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        this._value = value;
        if (value == null) {
            this.node.data = this.defaultText;
        } else {
            this.node.data = "" + value;
        }
    }
});

}],["irid.js","irid","irid.js",{},function (require, exports, module, __filename, __dirname){

// irid/irid.js
// ------------

/*global module*/
"use strict";

var invalidError = "Invalid colour specification",
    // Silly micro-optimizations (vars get minified):
    undef = "undefined",
    round = Math.round,
    max = Math.max,
    min = Math.min,
    floor = Math.floor;

var Irid = function (initial) {
    if ( ! (this instanceof Irid)) { return new Irid(initial); }
    if ( ! initial ) {
        throw invalidError;
    }
    if (initial instanceof Irid) {
        this.hsl = initial.hsl;
        this.rgb = initial.rgb;
    }
    else if (initial.h !== undefined &&
            initial.s !== undefined && initial.l !== undefined) {
        this.hsl = initial;
    }
    else if (typeof initial == "string") {
        this.rgb = hexToRGB(initial) || cssRGBToRGB(initial) ||
                hexToRGB(Irid.swatches[initial.toLowerCase()]);
        if (!this.rgb) {
            this.hsl = cssHSLToHSL(initial);
            if ( ! this.hsl ) { throw invalidError; }
        }
    }
    else if (initial.r !== undefined
            && initial.g !== undefined
            && initial.b !== undefined) {
        this.rgb = initial;
    }
};

Irid.prototype = {
    _makeRGB: function () {
        if (typeof(this.rgb) == undef) { this.rgb = hslToRGB(this.hsl); }
    },
    _makeHSL: function () {
        if (typeof(this.hsl) == undef) { this.hsl = rgbToHSL(this.rgb); }
    },
    // See http://en.wikipedia.org/wiki/HSL_and_HSV#Lightness
    luma: function () {
        this._makeRGB();
        var rgb = this.rgb;
        return  (0.3*rgb.r + 0.59*rgb.g + 0.11*rgb.b) / 255;
    },
    // see http://www.w3.org/TR/WCAG/#relativeluminancedef
    relativeLuminance: function () {
        this._makeRGB();
        function calc (x) {
            var srgb = x / 255;
            return (srgb <= 0.03928) ? (srgb/12.92) :
                Math.pow(((srgb + 0.055)/1.055),  2.4);
        }
      return (0.2126 * calc(this.rgb.r)) + (0.7152 * calc(this.rgb.g)) + (0.0722 * calc(this.rgb.b));
    },
    // see http://www.w3.org/TR/WCAG20/#visual-audio-contrast
    // http://www.w3.org/TR/WCAG20/#contrast-ratiodefs
    contrastRatio: function (other) {
        other = Irid(other);
        var lighter, darker;
        if (other.relativeLuminance() > this.relativeLuminance()) {
            lighter = other;
            darker = this;
        }
        else {
            lighter = this;
            darker = other;
        }
        return (lighter.relativeLuminance() + 0.05) / (darker.relativeLuminance() + 0.05);
    },
    red: function (r) {
        this._makeRGB();
        return (typeof(r) == undef) ? this.rgb.r :
            new Irid({r: parseInt(r, 10), g: this.rgb.g, b: this.rgb.b, a: this.rgb.a});
    },
    green: function (g) {
        this._makeRGB();
        return (typeof(g) == undef) ? this.rgb.g :
            new Irid({r: this.rgb.r, g: parseInt(g, 10), b: this.rgb.b, a: this.rgb.a});
    },
    blue: function (b) {
        this._makeRGB();
        return (typeof(b) == undef) ? this.rgb.b :
            new Irid({r: this.rgb.r, g: this.rgb.g, b: parseInt(b, 10), a: this.rgb.a});
    },
    hue: function (h) {
        this._makeHSL();
        return (typeof(h) == undef) ? this.hsl.h :
            new Irid({h: parseFloat(h), s: this.hsl.s, l: this.hsl.l, a: this.hsl.a});
    },
    saturation: function (s) {
        this._makeHSL();
        return (typeof(s) == undef) ? this.hsl.s :
            new Irid({h: this.hsl.h, s: parseFloat(s), l: this.hsl.l, a: this.hsl.a});
    },
    lightness: function (l) {
        this._makeHSL();
        return (typeof(l) == undef) ? this.hsl.l :
            new Irid({h: this.hsl.h, s: this.hsl.s, l: parseFloat(l), a: this.hsl.a});
    },
    alpha: function (a) {
        if (arguments.length === 0) {
            return (this.hsl || this.rgb).a;
        }
        else {
            a = (a === null || a === undefined) ? undefined : parseFloat(a);
            if (this.hsl) {
                return new Irid({h: this.hsl.h, s: this.hsl.s, l: this.hsl.l, a: a});
            }
            else {
                return new Irid({r: this.rgb.r, g: this.rgb.g, b: this.rgb.b, a: a});
            }
        }
    },
    lighten: function (amount) {
        this._makeHSL();
        return new Irid({
            h: this.hsl.h,
            s: this.hsl.s,
            l: this.hsl.l + (1 - this.hsl.l) * amount,
            a: this.hsl.a
        });
    },
    darken: function (amount) {
        this._makeHSL();
        return new Irid({
            h: this.hsl.h,
            s: this.hsl.s,
            l: this.hsl.l * (1 - amount),
            a: this.hsl.a
        });
    },
    invert: function () {
        this._makeRGB();
        return new Irid({
            r: 255 - this.rgb.r,
            g: 255 - this.rgb.g,
            b: 255 - this.rgb.b,
            a: this.rgb.a
        });
    },
    complement: function () {
        this._makeHSL();
        return new Irid({
            h: (this.hsl.h + 0.5) % 1.0,
            s: this.hsl.s,
            l: this.hsl.l,
            a: this.hsl.a
        });
    },
    desaturate: function () {
        this._makeHSL();
        return new Irid({
            h: this.hsl.h,
            s: 0,
            l: this.hsl.l,
            a: this.hsl.a
        });
    },
    contrast: function (forDark, forLight) {
        // return new Irid((this.l > 0.5) ? "#111": "#eee"); // naive
        return new Irid((this.luma() > 0.6)?
                 forLight || "#111" :
                 forDark || "#eee");
    },
    analagous: function () {
        return [
            this,
            this.hue(this.hue() - 1/12),
            this.hue(this.hue() + 1/12)
        ];
    },
    tetrad: function () {
        var hue = this.hue();
        return [
            this,
            this.hue(hue + 1/4),
            this.hue(hue + 2/4),
            this.hue(hue + 3/4)
        ];
    },
    rectTetrad: function () {
        return [
            this,
            this.hue(this.hue() + 1/6),
            this.hue(this.hue() + 3/6),
            this.hue(this.hue() + 4/6)
        ];
    },
    triad: function () {
        return [
            this,
            this.hue(this.hue() - 1/3),
            this.hue(this.hue() + 1/3)
        ];
    },
    splitComplementary: function () {
        return [
            this,
            this.hue(this.hue() - 5/12),
            this.hue(this.hue() + 5/12)
        ];
    },
    blend: function (other, opacity) {
        if (typeof opacity == "undefined") opacity = 0.5;
        var thisOpacity = 1 - opacity;
        other = new Irid(other);
        return new Irid({
            r: Math.floor((this.red() * thisOpacity + other.red() * opacity)),
            g: Math.floor((this.green() * thisOpacity + other.green() * opacity)),
            b: Math.floor((this.blue() * thisOpacity + other.blue() * opacity))
        });
    },
    toString: function () { // TODO: make this smarter, return rgba when needed
        return this.toHexString();
    },
    toHexString: function () {
        this._makeRGB();
        return rgbToHex(this.rgb);
    },
    toRGBString: function () {
        this._makeRGB();
        return rgbToCSSRGB(this.rgb);
    },
    toHSLString: function () {
        this._makeHSL();
        return hslToCSSHSL(this.hsl);
    }
};

var parseHexValue = function (str) {
    if (str.length == 1) { str += str; }
    return max(0, min(255, parseInt(str, 16)));
};

var parseRGBValue = function (str) {
    var percent = str.charAt(str.length - 1) == "%";
    if (percent) { str = str.slice(0, str.length - 1); }
    return max(0, min(255, round(
            parseInt(str, 10) * (percent ? 2.55 : 1)
    )));
};

var parseAlphaValue = function (str) {
    return str ? max(0, min(1, parseFloat(str))) : undefined;
};

var parseHueValue = function (str) {
    var val = parseInt(str, 10) % 360;
    if (val < 0) { val += 360; }
    return val / 360;
};

var parseSLValue = function (str) {
    return max(0, min(100, parseInt(str, 10))) / 100;
};

Irid.canInterpret = function (candidate) {
  return candidate && (
    (candidate instanceof Irid) ||
    (candidate.h !== undefined && candidate.s !== undefined && candidate.l !== undefined) ||
    ((typeof candidate == "string") && (hexToRGB(candidate) || cssRGBToRGB(candidate) || cssHSLToHSL(candidate) || hexToRGB(Irid.swatches[candidate.toLowerCase()]))) ||
    (candidate.r !== undefined && candidate.g !== undefined && candidate.b !== undefined)
  );
};


var hexToRGB = Irid.hexToRGB = function (hex) {
    var parts = /^#([\da-f])([\da-f])([\da-f])([\da-f])?$/i.exec(hex) ||
            /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})?$/i.exec(hex);
    return parts? {
        r: parseHexValue(parts[1]),
        g: parseHexValue(parts[2]),
        b: parseHexValue(parts[3]),
        a: (typeof parts[4] == undef || parts[4] == "")?
                undefined :
                parseHexValue(parts[4])/255
    }:undefined;
};


var cssRGBToRGB = Irid.cssRGBToRGB = function (css) {
    var parts = /^rgba?\(\s*(-?\d+%?)\s*,\s*(-?\d+%?)\s*,\s*(-?\d+%?)\s*(?:,\s*(-?\d*(?:\.\d+)?)?)?\s*\)$/.exec(css);
    return parts? {
        r: parseRGBValue(parts[1]),
        g: parseRGBValue(parts[2]),
        b: parseRGBValue(parts[3]),
        a: parseAlphaValue(parts[4])
    }:undefined;
};


var rgbToCSSRGB = Irid.rgbToCSSRGB = function (rgb) {
    return "rgb" + (rgb.a?"a":"") + "(" +
        round(rgb.r) + ", " +
        round(rgb.g) + ", " +
        round(rgb.b) +
        ( rgb.a? (", " + rgb.a.toFixed(2)) : ""  ) + ")";
};


var hslToCSSHSL = Irid.hslToCSSHSL = function (hsl) {
    return "hsl" + (hsl.a?"a":"") + "(" +
        round(hsl.h * 360) + ", " +
        round(hsl.s * 100) + "%, " +
        round(hsl.l * 100) + "%" +
        ( hsl.a? (", " + hsl.a.toFixed(2)) : ""  ) + ")";
};


var cssHSLToHSL = Irid.cssHSLToHSL = function (css) {
    var parts = /^hsla?\(\s*(-?\d+)\s*,\s*(-?\d+%)\s*,\s*(-?\d+%)\s*(?:,\s*(-?\d*(?:\.\d+)?)?)?\s*\)$/.exec(css);
    return parts? {
        h: parseHueValue(parts[1]),
        s: parseSLValue(parts[2]),
        l: parseSLValue(parts[3]),
        a: parseAlphaValue(parts[4])
    }:undefined;
};


var rgbToHex = Irid.rgbToHex = function (rgb) {
    var alpha,
        str = "#" +
        ((rgb.r < 16)? "0":"") + rgb.r.toString(16) +
        ((rgb.g < 16)? "0":"") + rgb.g.toString(16) +
        ((rgb.b < 16)? "0":"") + rgb.b.toString(16);
    if (rgb.a !== undefined) {
        alpha = floor(rgb.a*255);
        str += ((alpha < 16 )? "0":"") + alpha.toString(16);
    }
    return str;
};


var rgbToHSL = Irid.rgbToHSL = function (rgb) {
    var v, m, vm, r2, g2, b2,
        r = rgb.r/255,
        g = rgb.g/255,
        b = rgb.b/255,
        h = 0,
        s = 0,
        l = 0;
    v = max(r,g,b);
    m = min(r,g,b);
    l = (m + v) / 2;
    if (l > 0) {
        vm = v - m;
        s = vm;
        if (s > 0) {
            s = s / ((l <= 0.5) ? (v + m) : (2 - v - m)) ;
            r2 = (v - r) / vm;
            g2 = (v - g) / vm;
            b2 = (v - b) / vm;
            if (r == v) { h = (g == m ? 5.0 + b2 : 1.0 - g2); }
            else if (g == v) { h = (b == m ? 1.0 + r2 : 3.0 - b2); }
            else { h = (r == m ? 3.0 + g2 : 5.0 - r2); }
            h = h / 6;
        }
    }
    return {h: h%1, s: s, l: l, a: rgb.a};
};


var hslToRGB = Irid.hslToRGB = function (hsl) {
    var v, r, g, b, m, sv, sextant, fract, vsf, mid1, mid2,
        h = hsl.h % 1,
        sl = hsl.s,
        l = hsl.l;
    if (h < 0) { h += 1; }
    r = g = b = l;
    v = (l <= 0.5) ? (l * (1.0 + sl)) : (l + sl - l * sl);
    if (v > 0) {
        m = l + l - v;
        sv = (v - m ) / v;
        h *= 6.0;
        sextant = floor(h);
        fract = h - sextant;
        vsf = v * sv * fract;
        mid1 = m + vsf;
        mid2 = v - vsf;
        switch (sextant) {
            case 0:  r = v;     g = mid1;  b = m;     break;
            case 1:  r = mid2;  g = v;     b = m;     break;
            case 2:  r = m;     g = v;     b = mid1;  break;
            case 3:  r = m;     g = mid2;  b = v;     break;
            case 4:  r = mid1;  g = m;     b = v;     break;
            case 5:  r = v;     g = m;     b = mid2;  break;
        }
    }
    return {
        r: floor(r * 255),
        g: floor(g * 255),
        b: floor(b * 255),
        a: hsl.a
    };
};

// see http://www.w3.org/TR/css3-color/#svg-color
Irid.swatches = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkgrey: "#a9a9a9",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkslategrey: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    grey: "#808080",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    //http://codepen.io/trezy/blog/honoring-a-great-man
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    transparent: "rgb(0,0,0,0)",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
};

module.exports = Irid;

}],["koerper.js","koerper","koerper.js",{"wizdom":28},function (require, exports, module, __filename, __dirname){

// koerper/koerper.js
// ------------------

"use strict";

var BaseDocument = require("wizdom");
var BaseNode = BaseDocument.prototype.Node;
var BaseElement = BaseDocument.prototype.Element;
var BaseTextNode = BaseDocument.prototype.TextNode;

module.exports = Document;
function Document(actualNode) {
    Node.call(this, this);
    this.actualNode = actualNode;
    this.actualDocument = actualNode.ownerDocument;

    this.documentElement = this.createBody();
    this.documentElement.parentNode = this;
    actualNode.appendChild(this.documentElement.actualNode);

    this.firstChild = this.documentElement;
    this.lastChild = this.documentElement;
}

Document.prototype = Object.create(BaseDocument.prototype);
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Body = Body;
Document.prototype.OpaqueHtml = OpaqueHtml;

Document.prototype.createBody = function (label) {
    return new this.Body(this, label);
};

Document.prototype.getActualParent = function () {
    return this.actualNode;
};

function Node(document) {
    BaseNode.call(this, document);
    this.actualNode = null;
}

Node.prototype = Object.create(BaseNode.prototype);
Node.prototype.constructor = Node;

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (nextSibling && nextSibling.parentNode !== this) {
        throw new Error("Can't insert before node that is not a child of parent");
    }
    BaseNode.prototype.insertBefore.call(this, childNode, nextSibling);
    var actualParentNode = this.getActualParent();
    var actualNextSibling;
    if (nextSibling) {
        actualNextSibling = nextSibling.getActualFirstChild();
    }
    if (!actualNextSibling) {
        actualNextSibling = this.getActualNextSibling();
    }
    if (actualNextSibling && actualNextSibling.parentNode !== actualParentNode) {
        actualNextSibling = null;
    }
    actualParentNode.insertBefore(childNode.actualNode, actualNextSibling || null);
    childNode.inject();
    return childNode;
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove child " + childNode);
    }
    childNode.extract();
    this.getActualParent().removeChild(childNode.actualNode);
    BaseNode.prototype.removeChild.call(this, childNode);
};

Node.prototype.setAttribute = function setAttribute(key, value) {
    this.actualNode.setAttribute(key, value);
};

Node.prototype.getAttribute = function getAttribute(key) {
    this.actualNode.getAttribute(key);
};

Node.prototype.hasAttribute = function hasAttribute(key) {
    this.actualNode.hasAttribute(key);
};

Node.prototype.removeAttribute = function removeAttribute(key) {
    this.actualNode.removeAttribute(key);
};

Node.prototype.addEventListener = function addEventListener(name, handler, capture) {
    this.actualNode.addEventListener(name, handler, capture);
};

Node.prototype.removeEventListener = function removeEventListener(name, handler, capture) {
    this.actualNode.removeEventListener(name, handler, capture);
};

Node.prototype.inject = function injectNode() { };

Node.prototype.extract = function extractNode() { };

Node.prototype.getActualParent = function () {
    return this.actualNode;
};

Node.prototype.getActualFirstChild = function () {
    return this.actualNode;
};

Node.prototype.getActualNextSibling = function () {
    return null;
};

Object.defineProperty(Node.prototype, "innerHTML", {
    get: function () {
        return this.actualNode.innerHTML;
    }//,
    //set: function (html) {
    //    // TODO invalidate any subcontained child nodes
    //    this.actualNode.innerHTML = html;
    //}
});

function Element(document, type, namespace) {
    BaseNode.call(this, document, namespace);
    if (namespace) {
        this.actualNode = document.actualDocument.createElementNS(namespace, type);
    } else {
        this.actualNode = document.actualDocument.createElement(type);
    }
    this.attributes = this.actualNode.attributes;
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

function TextNode(document, text) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode(text);
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

Object.defineProperty(TextNode.prototype, "data", {
    set: function (data) {
        this.actualNode.data = data;
    },
    get: function () {
        return this.actualNode.data;
    }
});

// if parentNode is null, the body is extracted
// if parentNode is non-null, the body is inserted
function Body(document, label) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode("");
    //this.actualNode = document.actualDocument.createComment(label || "");
    this.actualFirstChild = null;
    this.actualBody = document.actualDocument.createElement("BODY");
}

Body.prototype = Object.create(Node.prototype);
Body.prototype.constructor = Body;
Body.prototype.nodeType = 13;

Body.prototype.extract = function extract() {
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = this.getActualFirstChild();
    var next;
    while (at && at !== lastChild) {
        next = at.nextSibling;
        if (body) {
            body.appendChild(at);
        } else {
            parentNode.removeChild(at);
        }
        at = next;
    }
};

Body.prototype.inject = function inject() {
    if (!this.parentNode) {
        throw new Error("Can't inject without a parent node");
    }
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = body.firstChild;
    var next;
    while (at) {
        next = at.nextSibling;
        parentNode.insertBefore(at, lastChild);
        at = next;
    }
};

Body.prototype.getActualParent = function () {
    if (this.parentNode) {
        return this.parentNode.getActualParent();
    } else {
        return this.actualBody;
    }
};

Body.prototype.getActualFirstChild = function () {
    if (this.firstChild) {
        return this.firstChild.getActualFirstChild();
    } else {
        return this.actualNode;
    }
};

Body.prototype.getActualNextSibling = function () {
    return this.actualNode;
};

Object.defineProperty(Body.prototype, "innerHTML", {
    get: function () {
        if (this.parentNode) {
            this.extract();
            var html = this.actualBody.innerHTML;
            this.inject();
            return html;
        } else {
            return this.actualBody.innerHTML;
        }
    },
    set: function (html) {
        if (this.parentNode) {
            this.extract();
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
            this.inject();
        } else {
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
        }
        return html;
    }
});

function OpaqueHtml(ownerDocument, body) {
    Node.call(this, ownerDocument);
    this.actualFirstChild = body.firstChild;
}

OpaqueHtml.prototype = Object.create(Node.prototype);
OpaqueHtml.prototype.constructor = OpaqueHtml;

OpaqueHtml.prototype.getActualFirstChild = function getActualFirstChild() {
    return this.actualFirstChild;
};

}],["lib/performance-now.js","performance-now/lib","performance-now.js",{},function (require, exports, module, __filename, __dirname){

// performance-now/lib/performance-now.js
// --------------------------------------

// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}],["index.js","pop-observe","index.js",{"./observable-array":21,"./observable-object":23,"./observable-range":24,"./observable-map":22},function (require, exports, module, __filename, __dirname){

// pop-observe/index.js
// --------------------

"use strict";

require("./observable-array");
var Oa = require("./observable-array");
var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

exports.makeArrayObservable = Oa.makeArrayObservable;

for (var name in Oo) {
    exports[name] = Oo[name];
}
for (var name in Or) {
    exports[name] = Or[name];
}
for (var name in Om) {
    exports[name] = Om[name];
}


}],["observable-array.js","pop-observe","observable-array.js",{"./observable-object":23,"./observable-range":24,"./observable-map":22,"pop-swap/swap":26},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-array.js
// -------------------------------

/*
 * Based in part on observable arrays from Motorola Mobility’s Montage
 * Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
 *
 * 3-Clause BSD License
 * https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
 */

/**
 * This module is responsible for observing changes to owned properties of
 * objects and changes to the content of arrays caused by method calls. The
 * interface for observing array content changes establishes the methods
 * necessary for any collection with observable content.
 */

var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

var array_swap = require("pop-swap/swap");
var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;
var array_empty = [];

var observableArrayProperties = {

    swap: {
        value: function swap(start, minusLength, plus) {
            if (plus) {
                if (!Array.isArray(plus)) {
                    plus = array_slice.call(plus);
                }
            } else {
                plus = array_empty;
            }

            if (start < 0) {
                start = this.length + start;
            } else if (start > this.length) {
                var holes = start - this.length;
                var newPlus = Array(holes + plus.length);
                for (var i = 0, j = holes; i < plus.length; i++, j++) {
                    if (i in plus) {
                        newPlus[j] = plus[i];
                    }
                }
                plus = newPlus;
                start = this.length;
            }

            if (start + minusLength > this.length) {
                // Truncate minus length if it extends beyond the length
                minusLength = this.length - start;
            } else if (minusLength < 0) {
                // It is the JavaScript way.
                minusLength = 0;
            }

            var minus;
            if (minusLength === 0) {
                // minus will be empty
                if (plus.length === 0) {
                    // at this point if plus is empty there is nothing to do.
                    return []; // [], but spare us an instantiation
                }
                minus = array_empty;
            } else {
                minus = array_slice.call(this, start, start + minusLength);
            }

            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = Math.max(this.length + diff, start + plus.length);
            var longest = Math.max(oldLength, newLength);
            var observedLength = Math.min(longest, this.observedLength);

            // dispatch before change events
            if (diff) {
                Oo.dispatchPropertyWillChange(this, "length", newLength, oldLength);
            }
            Or.dispatchRangeWillChange(this, plus, minus, start);
            if (diff === 0) {
                // Substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyWillChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapWillChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < plus.length) {
                            if (plus[j] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, plus[j], this[i]);
                            }
                        } else {
                            if (this[i - diff] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, this[i - diff], this[i]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < plus.length) {
                            if (plus[j] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, plus[j]);
                        } else {
                            if (this[i - diff] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, this[i - diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (this[i] !== void 0) {
                            Oo.dispatchPropertyWillChange(this, i, void 0, this[i]);
                        }
                        Om.dispatchMapWillChange(this, "delete", i, void 0, this[i]);
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            // actual work
            array_swap(this, start, minusLength, plus);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                                Om.dispatchMapChange(this, "update", i, this[i], minus[j]);
                            }
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                                Om.dispatchMapChange(this, "update", i, this[i], this[i + diff]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], minus[j]);
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], this[i + diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (j < minus.length) {
                            if (minus[j] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, minus[j]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, minus[j]);
                        } else {
                            if (this[i + diff] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, this[i + diff]);
                        }
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            Or.dispatchRangeChange(this, plus, minus, start);
            if (diff) {
                Oo.dispatchPropertyChange(this, "length", newLength, oldLength);
            }
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, minusLength) {
            if (start > this.length) {
                start = this.length;
            }
            var result = this.slice(start, start + minusLength);
            this.swap.call(this, start, minusLength, array_slice.call(arguments, 2));
            return result;
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

    reverse: {
        value: function reverse() {
            var reversed = this.slice();
            reversed.reverse();
            this.swap(0, this.length, reversed);
            return this;
        },
        writable: true,
        configurable: true
    },

    sort: {
        value: function sort() {
            var sorted = this.slice();
            array_sort.apply(sorted, arguments);
            this.swap(0, this.length, sorted);
            return this;
        },
        writable: true,
        configurable: true
    },

    set: {
        value: function set(index, value) {
            this.swap(index, index >= this.length ? 0 : 1, [value]);
            return true;
        },
        writable: true,
        configurable: true
    },

    shift: {
        value: function shift() {
            if (this.length) {
                var result = this[0];
                this.swap(0, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    pop: {
        value: function pop() {
            if (this.length) {
                var result = this[this.length - 1];
                this.swap(this.length - 1, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    push: {
        value: function push(value) {
            this.swap(this.length, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    unshift: {
        value: function unshift(value) {
            this.swap(0, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    clear: {
        value: function clear() {
            this.swap(0, this.length);
        },
        writable: true,
        configurable: true
    }

};

var hiddenProperty = {
    value: null,
    enumerable: false,
    writable: true,
    configurable: true
};

var observableArrayOwnProperties = {
    observed: hiddenProperty,
    observedLength: hiddenProperty,

    propertyObservers: hiddenProperty,
    wrappedPropertyDescriptors: hiddenProperty,

    rangeChangeObservers: hiddenProperty,
    rangeWillChangeObservers: hiddenProperty,
    dispatchesRangeChanges: hiddenProperty,

    mapChangeObservers: hiddenProperty,
    mapWillChangeObservers: hiddenProperty,
    dispatchesMapChanges: hiddenProperty
};

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var bestowObservableArrayProperties;
if (protoIsSupported) {
    var observableArrayPrototype = Object.create(Array.prototype, observableArrayProperties);
    bestowObservableArrayProperties = function (array) {
        array.__proto__ = observableArrayPrototype;
    };
} else {
    bestowObservableArrayProperties = function (array) {
        Object.defineProperties(array, observableArrayProperties);
    };
}

exports.makeArrayObservable = makeArrayObservable;
function makeArrayObservable(array) {
    if (array.observed) {
        return;
    }
    bestowObservableArrayProperties(array);
    Object.defineProperties(array, observableArrayOwnProperties);
    array.observedLength = 0;
    array.observed = true;
}

// For ObservableObject
exports.makePropertyObservable = makePropertyObservable;
function makePropertyObservable(array, index) {
    makeArrayObservable(array);
    if (~~index === index && index >= 0) { // Note: NaN !== NaN, ~~"foo" !== "foo"
        makeIndexObservable(array, index);
    }
}

// For ObservableRange
exports.makeRangeChangesObservable = makeRangeChangesObservable;
function makeRangeChangesObservable(array) {
    makeArrayObservable(array);
}

// For ObservableMap
exports.makeMapChangesObservable = makeMapChangesObservable;
function makeMapChangesObservable(array) {
    makeArrayObservable(array);
    makeIndexObservable(array, Infinity);
}

function makeIndexObservable(array, index) {
    if (index >= array.observedLength) {
        array.observedLength = index + 1;
    }
}


}],["observable-map.js","pop-observe","observable-map.js",{"./observable-array":21},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-map.js
// -----------------------------

"use strict";

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableMap;
function ObservableMap() {
    throw new Error("Can't construct. ObservableMap is a mixin.");
}

ObservableMap.prototype.observeMapChange = function (handler, name, note, capture) {
    return observeMapChange(this, handler, name, note, capture);
};

ObservableMap.prototype.observeMapWillChange = function (handler, name, note) {
    return observeMapChange(this, handler, name, note, true);
};

ObservableMap.prototype.dispatchMapChange = function (type, key, plus, minus, capture) {
    return dispatchMapChange(this, type, key, plus, minus, capture);
};

ObservableMap.prototype.dispatchMapWillChange = function (type, key, plus, minus) {
    return dispatchMapWillChange(this, type, key, plus, minus, true);
};

ObservableMap.prototype.getMapChangeObservers = function (capture) {
    return getMapChangeObservers(this, capture);
};

ObservableMap.prototype.getMapWillChangeObservers = function () {
    return getMapChangeObservers(this, true);
};

ObservableMap.observeMapChange = observeMapChange;
function observeMapChange(object, handler, name, note, capture) {
    makeMapChangesObservable(object);
    var observers = getMapChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new MapChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "MapChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapChange) {
            observer.handlerMethodName = "handleMapChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    } else {
        var methodName = "handle" + propertyName + "MapWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapWillChange) {
            observer.handlerMethodName = "handleMapWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableMap.observeMapWillChange = observeMapWillChange;
function observeMapWillChange(object, handler, name, note) {
    return observeMapChange(object, handler, name, note, true);
}

ObservableMap.dispatchMapChange = dispatchMapChange;
function dispatchMapChange(object, type, key, plus, minus, capture) {
    if (plus === minus) {
        return;
    }
    if (!dispatching) { // TODO && !debug?
        return startMapChangeDispatchContext(object, type, key, plus, minus, capture);
    }
    var observers = getMapChangeObservers(object, capture);
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(type, key, plus, minus);
    }
}

ObservableMap.dispatchMapWillChange = dispatchMapWillChange;
function dispatchMapWillChange(object, type, key, plus, minus) {
    return dispatchMapChange(object, type, key, plus, minus, true);
}

function startMapChangeDispatchContext(object, type, key, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchMapChange(object, type, key, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Map change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Map change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.clear();
        }
    }
}

function getMapChangeObservers(object, capture) {
    if (capture) {
        if (!object.mapWillChangeObservers) {
            object.mapWillChangeObservers = [];
        }
        return object.mapWillChangeObservers;
    } else {
        if (!object.mapChangeObservers) {
            object.mapChangeObservers = [];
        }
        return object.mapChangeObservers;
    }
}

function getMapWillChangeObservers(object) {
    return getMapChangeObservers(object, true);
}

function makeMapChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeMapChangesObservable(object);
    }
    if (object.makeMapChangesObservable) {
        object.makeMapChangesObservable();
    }
    object.dispatchesMapChanges = true;
}

function MapChangeObserver() {
    this.init();
}

MapChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

MapChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " map changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

MapChangeObserver.prototype.dispatch = function (type, key, plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, key, type, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, key, type, this.object);
    } else {
        throw new Error(
            "Can't dispatch map change for " + JSON.stringify(this.name) + " to " + handler +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

var Oa = require("./observable-array");

}],["observable-object.js","pop-observe","observable-object.js",{"./observable-array":21},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-object.js
// --------------------------------

/*jshint node: true*/
"use strict";

// XXX Note: exceptions thrown from handlers and handler cancelers may
// interfere with dispatching to subsequent handlers of any change in progress.
// It is unlikely that plans are recoverable once an exception interferes with
// change dispatch. The internal records should not be corrupt, but observers
// might miss an intermediate property change.

var owns = Object.prototype.hasOwnProperty;

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

// Reusable property descriptor
var hiddenValueProperty = {
    value: null,
    writable: true,
    enumerable: false,
    configurable: true
};

module.exports = ObservableObject;
function ObservableObject() {
    throw new Error("Can't construct. ObservableObject is a mixin.");
}

ObservableObject.prototype.observePropertyChange = function (name, handler, note, capture) {
    return observePropertyChange(this, name, handler, note, capture);
};

ObservableObject.prototype.observePropertyWillChange = function (name, handler, note) {
    return observePropertyWillChange(this, name, handler, note);
};

ObservableObject.prototype.dispatchPropertyChange = function (name, plus, minus, capture) {
    return dispatchPropertyChange(this, name, plus, minus, capture);
};

ObservableObject.prototype.dispatchPropertyWillChange = function (name, plus, minus) {
    return dispatchPropertyWillChange(this, name, plus, minus);
};

ObservableObject.prototype.getPropertyChangeObservers = function (name, capture) {
    return getPropertyChangeObservers(this, name, capture);
};

ObservableObject.prototype.getPropertyWillChangeObservers = function (name) {
    return getPropertyWillChangeObservers(this, name);
};

ObservableObject.prototype.makePropertyObservable = function (name) {
    return makePropertyObservable(this, name);
};

ObservableObject.prototype.preventPropertyObserver = function (name) {
    return preventPropertyObserver(this, name);
};

ObservableObject.prototype.PropertyChangeObserver = PropertyChangeObserver;

// Constructor interface with polymorphic delegation if available

ObservableObject.observePropertyChange = function (object, name, handler, note, capture) {
    if (object.observePropertyChange) {
        return object.observePropertyChange(name, handler, note, capture);
    } else {
        return observePropertyChange(object, name, handler, note, capture);
    }
};

ObservableObject.observePropertyWillChange = function (object, name, handler, note) {
    if (object.observePropertyWillChange) {
        return object.observePropertyWillChange(name, handler, note);
    } else {
        return observePropertyWillChange(object, name, handler, note);
    }
};

ObservableObject.dispatchPropertyChange = function (object, name, plus, minus, capture) {
    if (object.dispatchPropertyChange) {
        return object.dispatchPropertyChange(name, plus, minus, capture);
    } else {
        return dispatchPropertyChange(object, name, plus, minus, capture);
    }
};

ObservableObject.dispatchPropertyWillChange = function (object, name, plus, minus) {
    if (object.dispatchPropertyWillChange) {
        return object.dispatchPropertyWillChange(name, plus, minus);
    } else {
        return dispatchPropertyWillChange(object, name, plus, minus);
    }
};

ObservableObject.makePropertyObservable = function (object, name) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(name);
    } else {
        return makePropertyObservable(object, name);
    }
};

ObservableObject.preventPropertyObserver = function (object, name) {
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
};

// Implementation

function observePropertyChange(object, name, handler, note, capture) {
    ObservableObject.makePropertyObservable(object, name);
    var observers = getPropertyChangeObservers(object, name, capture);

    var observer;
    if (observerFreeList.length) { // TODO && !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new PropertyChangeObserver();
    }

    observer.object = object;
    observer.propertyName = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;
    observer.value = object[name];

    // Precompute dispatch method names.

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var specificChangeMethodName = "handle" + propertyName + "PropertyChange";
        var genericChangeMethodName = "handlePropertyChange";
        if (handler[specificChangeMethodName]) {
            observer.handlerMethodName = specificChangeMethodName;
        } else if (handler[genericChangeMethodName]) {
            observer.handlerMethodName = genericChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    } else {
        var specificWillChangeMethodName = "handle" + propertyName + "PropertyWillChange";
        var genericWillChangeMethodName = "handlePropertyWillChange";
        if (handler[specificWillChangeMethodName]) {
            observer.handlerMethodName = specificWillChangeMethodName;
        } else if (handler[genericWillChangeMethodName]) {
            observer.handlerMethodName = genericWillChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    }

    observers.push(observer);

    // TODO issue warnings if the number of handler records exceeds some
    // concerning quantity as a harbinger of a memory leak.
    // TODO Note that if this is garbage collected without ever being called,
    // it probably indicates a programming error.
    return observer;
}

function observePropertyWillChange(object, name, handler, note) {
    return observePropertyChange(object, name, handler, note, true);
}

function dispatchPropertyChange(object, name, plus, minus, capture) {
    if (!dispatching) { // TODO && !debug?
        return startPropertyChangeDispatchContext(object, name, plus, minus, capture);
    }
    var observers = getPropertyChangeObservers(object, name, capture).slice();
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(plus, minus);
    }
}

function dispatchPropertyWillChange(object, name, plus, minus) {
    dispatchPropertyChange(object, name, plus, minus, true);
}

function startPropertyChangeDispatchContext(object, name, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchPropertyChange(object, name, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Property change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Property change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.length = 0;
        }
    }
}

function getPropertyChangeObservers(object, name, capture) {
    if (!object.propertyObservers) {
        hiddenValueProperty.value = Object.create(null);
        Object.defineProperty(object, "propertyObservers", hiddenValueProperty);
    }
    var observersByKey = object.propertyObservers;
    var phase = capture ? "WillChange" : "Change";
    var key = name + phase;
    if (!Object.prototype.hasOwnProperty.call(observersByKey, key)) {
        observersByKey[key] = [];
    }
    return observersByKey[key];
}

function getPropertyWillChangeObservers(object, name) {
    return getPropertyChangeObservers(object, name, true);
}

function PropertyChangeObserver() {
    this.init();
    // Object.seal(this); // Maybe one day, this won't deoptimize.
}

PropertyChangeObserver.prototype.init = function () {
    this.object = null;
    this.propertyName = null;
    // Peer observers, from which to pluck itself upon cancelation.
    this.observers = null;
    // On which to dispatch property change notifications.
    this.handler = null;
    // Precomputed handler method name for change dispatch
    this.handlerMethodName = null;
    // Returned by the last property change notification, which must be
    // canceled before the next change notification, or when this observer is
    // finally canceled.
    this.childObserver = null;
    // For the discretionary use of the user, perhaps to track why this
    // observer has been created, or whether this observer should be
    // serialized.
    this.note = null;
    // Whether this observer dispatches before a change occurs, or after
    this.capture = null;
    // The last known value
    this.value = null;
};

PropertyChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.propertyName) + " on " + this.object +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

PropertyChangeObserver.prototype.dispatch = function (plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    if (minus === void 0) {
        minus = this.value;
    }
    this.value = plus;

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }
    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, this.propertyName, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, this.propertyName, this.object);
    } else {
        throw new Error(
            "Can't dispatch " + JSON.stringify(handlerMethodName) + " property change on " + object +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

function makePropertyObservable(object, name) {
    if (Array.isArray(object)) {
        return Oa.makePropertyObservable(object, name);
    }

    var wrappedDescriptor = wrapPropertyDescriptor(object, name);

    if (!wrappedDescriptor) {
        return;
    }

    var thunk;
    // in both of these new descriptor variants, we reuse the wrapped
    // descriptor to either store the current value or apply getters
    // and setters. this is handy since we can reuse the wrapped
    // descriptor if we uninstall the observer. We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ("value" in wrappedDescriptor) {
        thunk = makeValuePropertyThunk(name, wrappedDescriptor);
    } else { // "get" or "set", but not necessarily both
        thunk = makeGetSetPropertyThunk(name, wrappedDescriptor);
    }

    Object.defineProperty(object, name, thunk);
}

/**
 * Prevents a thunk from being installed on a property, assuming that the
 * underlying type will dispatch the change manually, or intends the property
 * to stick on all instances.
 */
function preventPropertyObserver(object, name) {
    var wrappedDescriptor = wrapPropertyDescriptor(object, name);
    Object.defineProperty(object, name, wrappedDescriptor);
}

function wrapPropertyDescriptor(object, name) {
    // Arrays are special. We do not support direct setting of properties
    // on an array. instead, call .set(index, value). This is observable.
    // "length" property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (Array.isArray(object)) {
        return;
    }

    if (!Object.isExtensible(object, name)) {
        return;
    }

    var wrappedDescriptor = getPropertyDescriptor(object, name);
    var wrappedPrototype = wrappedDescriptor.prototype;

    var existingWrappedDescriptors = wrappedPrototype.wrappedPropertyDescriptors;
    if (existingWrappedDescriptors && owns.call(existingWrappedDescriptors, name)) {
        return;
    }

    var wrappedPropertyDescriptors = object.wrappedPropertyDescriptors;
    if (!wrappedPropertyDescriptors) {
        wrappedPropertyDescriptors = {};
        hiddenValueProperty.value = wrappedPropertyDescriptors;
        Object.defineProperty(object, "wrappedPropertyDescriptors", hiddenValueProperty);
    }

    if (owns.call(wrappedPropertyDescriptors, name)) {
        // If we have already recorded a wrapped property descriptor,
        // we have already installed the observer, so short-here.
        return;
    }

    if (!wrappedDescriptor.configurable) {
        return;
    }

    // Memoize the descriptor so we know not to install another layer. We
    // could use it to uninstall the observer, but we do not to avoid GC
    // thrashing.
    wrappedPropertyDescriptors[name] = wrappedDescriptor;

    // Give up *after* storing the wrapped property descriptor so it
    // can be restored by uninstall. Unwritable properties are
    // silently not overriden. Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!wrappedDescriptor.writable && !wrappedDescriptor.set) {
        return;
    }

    // If there is no setter, it is not mutable, and observing is moot.
    // Manual dispatch may still apply.
    if (wrappedDescriptor.get && !wrappedDescriptor.set) {
        return;
    }

    return wrappedDescriptor;
}

function getPropertyDescriptor(object, name) {
    // walk up the prototype chain to find a property descriptor for the
    // property name.
    var descriptor;
    var prototype = object;
    do {
        descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor) {
            break;
        }
        prototype = Object.getPrototypeOf(prototype);
    } while (prototype);
    if (descriptor) {
        descriptor.prototype = prototype;
        return descriptor;
    } else {
        // or default to an undefined value
        return {
            prototype: object,
            value: undefined,
            enumerable: false,
            writable: true,
            configurable: true
        };
    }
}

function makeValuePropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            return state[name];
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            if (plus === state[name]) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            wrappedDescriptor.value = plus;
            state[name] = plus;

            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function makeGetSetPropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            if (wrappedDescriptor.get) {
                return wrappedDescriptor.get.apply(this, arguments);
            }
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (state[name] === plus) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            // call through to actual setter
            if (wrappedDescriptor.set) {
                wrappedDescriptor.set.apply(this, arguments);
                state[name] = plus;
            }

            // use getter, if possible, to adjust the plus value if the setter
            // adjusted it, for example a setter for an array property that
            // retains the original array and replaces its content, or a setter
            // that coerces the value to an expected type.
            if (wrappedDescriptor.get) {
                plus = wrappedDescriptor.get.apply(this, arguments);
            }

            // dispatch the new value: the given value if there is
            // no getter, or the actual value if there is one
            // TODO spec
            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function initState(object) {
    Object.defineProperty(object, "__state__", {
        value: {
            __this__: object
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}

var Oa = require("./observable-array");

}],["observable-range.js","pop-observe","observable-range.js",{"./observable-array":21},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-range.js
// -------------------------------

/*global -WeakMap*/
"use strict";

// TODO review all error messages for consistency and helpfulness across observables

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableRange;
function ObservableRange() {
    throw new Error("Can't construct. ObservableRange is a mixin.");
}

ObservableRange.prototype.observeRangeChange = function (handler, name, note, capture) {
    return observeRangeChange(this, handler, name, note, capture);
};

ObservableRange.prototype.observeRangeWillChange = function (handler, name, note) {
    return observeRangeChange(this, handler, name, note, true);
};

ObservableRange.prototype.dispatchRangeChange = function (plus, minus, index, capture) {
    return dispatchRangeChange(this, plus, minus, index, capture);
};

ObservableRange.prototype.dispatchRangeWillChange = function (plus, minus, index) {
    return dispatchRangeChange(this, plus, minus, index, true);
};

ObservableRange.prototype.getRangeChangeObservers = function (capture) {
};

ObservableRange.prototype.getRangeWillChangeObservers = function () {
    return getRangeChangeObservers(this, true);
};

ObservableRange.observeRangeChange = observeRangeChange;
function observeRangeChange(object, handler, name, note, capture) {
    makeRangeChangesObservable(object);
    var observers = getRangeChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new RangeChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "RangeChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeChange) {
            observer.handlerMethodName = "handleRangeChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    } else {
        var methodName = "handle" + propertyName + "RangeWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeWillChange) {
            observer.handlerMethodName = "handleRangeWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableRange.observeRangeWillChange = observeRangeWillChange;
function observeRangeWillChange(object, handler, name, note) {
    return observeRangeChange(object, handler, name, note, true);
}

ObservableRange.dispatchRangeChange = dispatchRangeChange;
function dispatchRangeChange(object, plus, minus, index, capture) {
    if (!dispatching) { // TODO && !debug?
        return startRangeChangeDispatchContext(object, plus, minus, index, capture);
    }
    var observers = getRangeChangeObservers(object, capture);
    for (var observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        var observer = observers[observerIndex];
        // The slicing ensures that handlers cannot interfere with another by
        // altering these arguments.
        observer.dispatch(plus.slice(), minus.slice(), index);
    }
}

ObservableRange.dispatchRangeWillChange = dispatchRangeWillChange;
function dispatchRangeWillChange(object, plus, minus, index) {
    return dispatchRangeChange(object, plus, minus, index, true);
}

function startRangeChangeDispatchContext(object, plus, minus, index, capture) {
    dispatching = true;
    try {
        dispatchRangeChange(object, plus, minus, index, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Range change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Range change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            if (observerToFreeList.clear) {
                observerToFreeList.clear();
            } else {
                observerToFreeList.length = 0;
            }
        }
    }
}

function makeRangeChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeRangeChangesObservable(object);
    }
    if (object.makeRangeChangesObservable) {
        object.makeRangeChangesObservable();
    }
    object.dispatchesRangeChanges = true;
}

function getRangeChangeObservers(object, capture) {
    if (capture) {
        if (!object.rangeWillChangeObservers) {
            object.rangeWillChangeObservers = [];
        }
        return object.rangeWillChangeObservers;
    } else {
        if (!object.rangeChangeObservers) {
            object.rangeChangeObservers = [];
        }
        return object.rangeChangeObservers;
    }
}

/*
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
*/

function RangeChangeObserver() {
    this.init();
}

RangeChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

RangeChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " range changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

RangeChangeObserver.prototype.dispatch = function (plus, minus, index) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, index, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, index, this.object);
    } else {
        throw new Error(
            "Can't dispatch range change to " + handler
        );
    }

    this.childObserver = childObserver;

    return this;
};

var Oa = require("./observable-array");

}],["pop-swap.js","pop-swap","pop-swap.js",{"./swap":26},function (require, exports, module, __filename, __dirname){

// pop-swap/pop-swap.js
// --------------------

"use strict";

var swap = require("./swap");

module.exports = polymorphicSwap;
function polymorphicSwap(array, start, minusLength, plus) {
    if (typeof array.swap === "function") {
        array.swap(start, minusLength, plus);
    } else {
        swap(array, start, minusLength, plus);
    }
}


}],["swap.js","pop-swap","swap.js",{},function (require, exports, module, __filename, __dirname){

// pop-swap/swap.js
// ----------------

"use strict";

// Copyright (C) 2014 Montage Studio
// https://github.com/montagejs/collections/blob/7c674d49c04955f01bbd2839f90936e15aceea2f/operators/swap.js

var array_slice = Array.prototype.slice;

module.exports = swap;
function swap(array, start, minusLength, plus) {
    // Unrolled implementation into JavaScript for a couple reasons.
    // Calling splice can cause large stack sizes for large swaps. Also,
    // splice cannot handle array holes.
    if (plus) {
        if (!Array.isArray(plus)) {
            plus = array_slice.call(plus);
        }
    } else {
        plus = Array.empty;
    }

    if (start < 0) {
        start = array.length + start;
    } else if (start > array.length) {
        array.length = start;
    }

    if (start + minusLength > array.length) {
        // Truncate minus length if it extends beyond the length
        minusLength = array.length - start;
    } else if (minusLength < 0) {
        // It is the JavaScript way.
        minusLength = 0;
    }

    var diff = plus.length - minusLength;
    var oldLength = array.length;
    var newLength = array.length + diff;

    if (diff > 0) {
        // Head Tail Plus Minus
        // H H H H M M T T T T
        // H H H H P P P P T T T T
        //         ^ start
        //         ^-^ minus.length
        //           ^ --> diff
        //         ^-----^ plus.length
        //             ^------^ tail before
        //                 ^------^ tail after
        //                   ^ start iteration
        //                       ^ start iteration offset
        //             ^ end iteration
        //                 ^ end iteration offset
        //             ^ start + minus.length
        //                     ^ length
        //                   ^ length - 1
        for (var index = oldLength - 1; index >= start + minusLength; index--) {
            var offset = index + diff;
            if (index in array) {
                array[offset] = array[index];
            } else {
                // Oddly, PhantomJS complains about deleting array
                // properties, unless you assign undefined first.
                array[offset] = void 0;
                delete array[offset];
            }
        }
    }
    for (var index = 0; index < plus.length; index++) {
        if (index in plus) {
            array[start + index] = plus[index];
        } else {
            array[start + index] = void 0;
            delete array[start + index];
        }
    }
    if (diff < 0) {
        // Head Tail Plus Minus
        // H H H H M M M M T T T T
        // H H H H P P T T T T
        //         ^ start
        //         ^-----^ length
        //         ^-^ plus.length
        //             ^ start iteration
        //                 ^ offset start iteration
        //                     ^ end
        //                         ^ offset end
        //             ^ start + minus.length - plus.length
        //             ^ start - diff
        //                 ^------^ tail before
        //             ^------^ tail after
        //                     ^ length - diff
        //                     ^ newLength
        for (var index = start + plus.length; index < oldLength - diff; index++) {
            var offset = index - diff;
            if (offset in array) {
                array[index] = array[offset];
            } else {
                array[index] = void 0;
                delete array[index];
            }
        }
    }
    array.length = newLength;
}


}],["index.js","raf","index.js",{"performance-now":19},function (require, exports, module, __filename, __dirname){

// raf/index.js
// ------------

var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

}],["dom.js","wizdom","dom.js",{},function (require, exports, module, __filename, __dirname){

// wizdom/dom.js
// -------------

"use strict";

module.exports = Document;
function Document(namespace) {
    this.doctype = null;
    this.documentElement = null;
    this.namespaceURI = namespace || "";
}

Document.prototype.nodeType = 9;
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Comment = Comment;
Document.prototype.Attr = Attr;
Document.prototype.NamedNodeMap = NamedNodeMap;

Document.prototype.createTextNode = function (text) {
    return new this.TextNode(this, text);
};

Document.prototype.createComment = function (text) {
    return new this.Comment(this, text);
};

Document.prototype.createElement = function (type, namespace) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createElementNS = function (namespace, type) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createAttribute = function (name, namespace) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

Document.prototype.createAttributeNS = function (namespace, name) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

function Node(document) {
    this.ownerDocument = document;
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
}

Node.prototype.appendChild = function appendChild(childNode) {
    return this.insertBefore(childNode, null);
};

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (!childNode) {
        throw new Error("Can't insert null child");
    }
    if (childNode.ownerDocument !== this.ownerDocument) {
        throw new Error("Can't insert child from foreign document");
    }
    if (childNode.parentNode) {
        childNode.parentNode.removeChild(childNode);
    }
    var previousSibling;
    if (nextSibling) {
        previousSibling = nextSibling.previousSibling;
    } else {
        previousSibling = this.lastChild;
    }
    if (previousSibling) {
        previousSibling.nextSibling = childNode;
    }
    if (nextSibling) {
        nextSibling.previousSibling = childNode;
    }
    childNode.nextSibling = nextSibling;
    childNode.previousSibling = previousSibling;
    childNode.parentNode = this;
    if (!nextSibling) {
        this.lastChild = childNode;
    }
    if (!previousSibling) {
        this.firstChild = childNode;
    }
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove null child");
    }
    var parentNode = childNode.parentNode;
    if (parentNode !== this) {
        throw new Error("Can't remove node that is not a child of parent");
    }
    if (childNode === parentNode.firstChild) {
        parentNode.firstChild = childNode.nextSibling;
    }
    if (childNode === parentNode.lastChild) {
        parentNode.lastChild = childNode.previousSibling;
    }
    if (childNode.previousSibling) {
        childNode.previousSibling.nextSibling = childNode.nextSibling;
    }
    if (childNode.nextSibling) {
        childNode.nextSibling.previousSibling = childNode.previousSibling;
    }
    childNode.previousSibling = null;
    childNode.parentNode = null;
    childNode.nextSibling = null;
    return childNode;
};

function TextNode(document, text) {
    Node.call(this, document);
    this.data = text;
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

function Comment(document, text) {
    Node.call(this, document);
    this.data = text;
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;
Comment.prototype.nodeType = 8;

function Element(document, type, namespace) {
    Node.call(this, document);
    this.tagName = type;
    this.namespaceURI = namespace;
    this.attributes = new this.ownerDocument.NamedNodeMap();
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

Element.prototype.hasAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return !!attr;
};

Element.prototype.getAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return attr ? attr.value : null;
};

Element.prototype.setAttribute = function (name, value, namespace) {
    var attr = this.ownerDocument.createAttribute(name, namespace);
    attr.value = value;
    this.attributes.setNamedItem(attr, namespace);
};

Element.prototype.removeAttribute = function (name, namespace) {
    this.attributes.removeNamedItem(name, namespace);
};

Element.prototype.hasAttributeNS = function (namespace, name) {
    return this.hasAttribute(name, namespace);
};

Element.prototype.getAttributeNS = function (namespace, name) {
    return this.getAttribute(name, namespace);
};

Element.prototype.setAttributeNS = function (namespace, name, value) {
    this.setAttribute(name, value, namespace);
};

Element.prototype.removeAttributeNS = function (namespace, name) {
    this.removeAttribute(name, namespace);
};

function Attr(ownerDocument, name, namespace) {
    this.ownerDocument = ownerDocument;
    this.name = name;
    this.value = null;
    this.namespaceURI = namespace;
}

Attr.prototype.nodeType = 2;

function NamedNodeMap() {
    this.length = 0;
}

NamedNodeMap.prototype.getNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    return this[key];
};

NamedNodeMap.prototype.setNamedItem = function (attr) {
    var namespace = attr.namespaceURI || "";
    var name = attr.name;
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var previousAttr = this[key];
    if (!previousAttr) {
        this[this.length] = attr;
        this.length++;
        previousAttr = null;
    }
    this[key] = attr;
    return previousAttr;
};

NamedNodeMap.prototype.removeNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var attr = this[key];
    if (!attr) {
        throw new Error("Not found");
    }
    var index = Array.prototype.indexOf.call(this, attr);
    delete this[key];
    delete this[index];
    this.length--;
};

NamedNodeMap.prototype.item = function (index) {
    return this[index];
};

NamedNodeMap.prototype.getNamedItemNS = function (namespace, name) {
    return this.getNamedItem(name, namespace);
};

NamedNodeMap.prototype.setNamedItemNS = function (attr) {
    return this.setNamedItem(attr);
};

NamedNodeMap.prototype.removeNamedItemNS = function (namespace, name) {
    return this.removeNamedItem(name, namespace);
};

}]])("colorim.html/index.js")
