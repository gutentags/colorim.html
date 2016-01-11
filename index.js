"use strict";

var Document = require("gutentag/document");
var Scope = require("gutentag/scope");
var Essay = require("./essay.html");

var scope = new Scope();
var document = new Document(window.document.body);
var essay = new Essay(document.documentElement, scope);
