"use strict";

/**
 * Contains `GlaceJS` errors.
 *
 * @module
 */

const util = require("util");

const GlaceError = require("glace-utils").GlaceError;
/**
 * Error which is thrown when configuration is wrong.
 *
 * @class
 * @arg {string} message - Error message.
 */
const ConfigError = module.exports.ConfigError = function (message) {
    GlaceError.call(this, message);
};
util.inherits(ConfigError, GlaceError);
/**
 * Error which is thrown when step execution is wrong.
 *
 * @class
 * @arg {string} message - Error message.
 */
const StepError = module.exports.StepError = function (message) {
    GlaceError.call(this, message);
};
util.inherits(StepError, GlaceError);
