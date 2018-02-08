"use strict";
/**
 * Collection of steps which will be executed in test cases.
 *
 * @class
 * @name Steps
 * @mixes TimerSteps
 */

var _ = require("lodash");
var U = require("glace-utils");

var plugins = require("../plugins");

var Steps = function () {};
module.exports = Steps;
/**
 * Step to enter to interactive debugging mode.
 *
 * @async
 * @function
 * @return {Promise}
 */
Steps.prototype.debug = function () {
    return U.debug();
};
/**
 * Registers steps.
 *
 * @method
 * @static
 * @arg {...object} steps - Sequence of steps to register.
 */
Steps.register = function () {
    for (var obj of arguments) {
        _.assign(this.prototype, obj);
    };
};

Steps.register(require("./timer"));
/* Load plugins steps */
Steps.register.apply(Steps, plugins.getModules("Steps"));
