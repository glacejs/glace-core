"use strict";
/**
 * Creates new instance of `Steps` class.
 *
 * @class
 * @classdesc Contains collection of steps which may be called inside tests via
 * its instance [SS](global.html#SS). It mixes steps from plugins too.
 * @name Steps
 * @mixes TimerSteps
 */

var _ = require("lodash");
var U = require("glace-utils");

var plugins = require("../plugins");

var Steps = function () {};
module.exports = Steps;
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
