"use strict";
/**
 * Steps collection which will be executed in test cases.
 *
 * @class
 * @name Steps
 * @mixes TimerSteps
 */

var _ = require("lodash");
var U = require("glace-utils");
var LOG = U.logger;

var CONF = require("../config");
var utils = require("../utils");

var Steps = function () {
    this.config = CONF;
};
module.exports = Steps;
/**
 * Step to make pause in another step or test case. Good style to rid of
 * its direct usage in test case, only inside other step.
 *
 * @method
 * @async
 * @arg {number} timeout - Pause time, sec.
 * @arg {string} message - Pause reason.
 * @return {Promise<void>}
 */
Steps.prototype.pause = async function (timeout, message) {
    expect(message, "Pause message is not defined").to.not.be.undefined;
    LOG.warn("Sleep", timeout, "sec, reason:", message);
    await U.sleep(timeout * 1000);
};
/**
 * Registers sequence of objects containing steps.
 *
 * @method
 * @static
 */
Steps.register = function () {
    for (var obj of arguments) {
        _.assign(this.prototype, obj);
    };
};
/* Load plugins steps */
Steps.register.apply(Steps, utils.plugins("Steps"));
