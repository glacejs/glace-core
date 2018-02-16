"use strict";
/**
 * Creates new instance of `Steps` class.
 *
 * @class
 * @classdesc Contains collection of steps which may be called inside tests via
 * its instance [SS](global.html#SS). It mixes steps from plugins too.
 * @name Steps
 * @mixes TimerSteps
 * @prop {object} ctx - Storage to share some data between steps.
 */

var _ = require("lodash");
var U = require("glace-utils");

var CONF = require("../config");
var plugins = require("../plugins");

var Steps = function () {
    this.ctx = {};
};
module.exports = Steps;
/**
 * Helper to reset steps context.
 *
 * @method
 */
Steps.prototype.resetCtx = function () {
    this.ctx = {};
};
/**
 * Helper to check whether test was failed before current step.
 *
 * @method
 * @return {undefined|boolean} `undefined` if test is absent,
 *  `true` if test was failed, `false` otherwise.
 */
Steps.prototype.isTestFailed = function () {
    if (!CONF.curTestCase) return;
    return !!CONF.curTestCase.errors.length;
};
/**
 * Step to enter to interactive debugging mode. May be used inside test if you
 * need to debug test in runtime.
 *
 * @async
 * @method
 * @return {Promise<void>}
 * @example
 *
 * test("my test", () => {
 *     chunk(async () => {
 *         await SS.debug();
 *     });
 * });
 */
Steps.prototype.debug = function () {
    return U.debug();
};
/**
 * Registers steps (mixes them).
 *
 * @method
 * @static
 * @arg {...object} steps - Sequence of steps to register.
 * @example
 *
 * var MyStepsMixin = require("./my-steps-mixin");
 * var AnotherStepsMixin = require("./another-steps-mixin");
 *
 * Steps.register(MyStepsMixin, AnotherStepsMixin);
 */
Steps.register = function () {
    for (var obj of arguments) {
        _.assign(this.prototype, obj);
    };
};

Steps.register(require("./timer"));
/* Load plugins steps */
Steps.register.apply(Steps, plugins.getModules("Steps"));
