"use strict";
/**
 * Creates new instance of `Steps` class.
 *
 * @class
 * @classdesc Contains collection of steps which may be called inside tests via
 * its instance [$](global.html#$). It mixes steps from plugins too.
 * @name Steps
 * @mixes TimerSteps
 * @prop {object} ctx - Storage to share some data between steps.
 */

var util = require("util");

require("colors");
var _ = require("lodash");
var U = require("glace-utils");

var CONF = require("../config");
var plugins = require("../plugins");
var tools = require("../tools");

var Steps = function () {
    this.ctx = {};
};
module.exports = Steps;

Steps.prototype.resetCtx = function () {
    /**
     * Helper to reset steps context.
     *
     * @memberOf Steps
     * @method resetCtx
     * @instance
     */

    this.ctx = {};
};

Steps.prototype.isTestFailed = function () {
    /**
     * Helper to check whether test was failed before current step.
     *
     * @memberOf Steps
     * @method isTestFailed
     * @instance
     * @return {undefined|boolean} `undefined` if test is absent,
     *  `true` if test was failed, `false` otherwise.
     */

    if (!CONF.test.curCase) return;
    return !!CONF.test.curCase.errors.length;
};

Steps.prototype.debug = async function () {
    /**
     * Step to enter to interactive debugging mode. May be used inside test if you
     * need to debug test in runtime.
     *
     * @async
     * @memberOf Steps
     * @method debug
     * @instance
     * @return {Promise<void>}
     * @example
     *
     * test("my test", () => {
     *     chunk(async () => {
     *         await $.debug();
     *     });
     * });
     */

    var onFail = CONF.session.debugOnFail;
    CONF.session.debugOnFail = false;
    await U.debug(setupDebug());
    CONF.session.debugOnFail = onFail;
};

Steps.prototype.listSteps = function (filter, namesOnly) {
    /**
     * Step to list available steps [debug mode].
     *
     * @memberOf Steps
     * @method listSteps
     * @instance
     * @arg {string} filter - Steps filter.
     * @arg {boolean} [namesOnly=false] - Search among step names only. By default
     * full-text search is used.
     */

    tools.printSteps(filter, namesOnly);
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
    }
};

/**
 * Helper to get steps instance.
 *
 * It wraps steps class with proxy object. Proxy observes steps call and in
 * debug mode if steps is failed it entered test to interactive debug mode.
 *
 * @method
 * @static
 * @arg {function} [cls] - Class with steps. By default original glace `Steps`
 *  will be used.
 * @return {Proxy} Wrapped steps instance.
 */
Steps.getInstance = function (cls) {
    return new Proxy(
        new (cls || Steps),
        {
            get: (target, property) => {
                var func = target[property];

                if (!util.isFunction(func)) return func;
                if (property === "debug" || !CONF.session.debugOnFail) {
                    return func;
                }

                return async function () {
                    try {
                        var result = await func.apply(target, arguments);
                    } catch (e) {
                        console.log(util.format(e).red);
                        await target.debug();
                        throw e;
                    }
                    return result;
                };
            },
        });
};

Steps.register(require("./timer"));
/* Load plugins steps */
Steps.register.apply(Steps, plugins.getModules("Steps"));

/**
 * Set up debug mode for glace.
 * @ignore
 */
const setupDebug = () => {
    global.search = $.listSteps.bind($);

    const helpMsg = "In interactive mode you can execute any nodejs code or glace step.\n" +
        "Available commands:\n" +
        "- search([query string]) - Search a glace step according to query. " +
        "For ex: > search('step to start timer')\n";

    return helpMsg;
};
