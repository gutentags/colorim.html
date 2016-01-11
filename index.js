"use strict";

var Document = require("gutentag/document");
var Scope = require("gutentag/scope");
var Essay = require("./essay.html");
var Animator = require("blick");

var scope = new Scope();
scope.animator = new Animator();
var document = new Document(window.document.body);
var essay = new Essay(document.documentElement, scope);
