"use strict";
/**
 * GlaceJS reporter package.
 *
 * @module
 */

var CONF = require("../config");

var base = require("./base");

base.register(require("./stdout"));

if (CONF.testrail.use) base.register(require("./testrail"));

module.exports = base;
