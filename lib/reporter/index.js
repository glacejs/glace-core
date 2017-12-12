"use strict";
/**
 * GlaceJS reporter package.
 *
 * @module
 */

var CONF = require("../config");
var plugins = require("../plugins");

var base = require("./base");

base.register(require("./stdout"));

if (CONF.testrail.use) base.register(require("./testrail"));
if (CONF.xunit.use) base.register(require("./xunit"));

for (var reporter of plugins.getModules("reporter")) {
    base.register(reporter);
};

module.exports = base;
