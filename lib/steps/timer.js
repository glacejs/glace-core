"use strict";
/**
 * Time steps.
 *
 * @module
 */

var U = require("glace-utils");
var LOG = U.logger;
/**
 * Steps to measure time.
 *
 * @mixin TimerSteps
 */
module.exports = {
    /**
     * Step to make pause in another step or test case. Good style to rid of
     * its direct usage in test case, only inside other step.
     *
     * @async
     * @method
     * @instance
     * @arg {number} timeout - Pause time, sec.
     * @arg {string} message - Pause reason.
     * @return {Promise<void>}
     */
    pause: async function (timeout, message) {
        expect(message, "Pause message is not defined").to.not.be.undefined;
        LOG.warn("Sleep", timeout, "sec, reason:", message);
        await U.sleep(timeout * 1000);
    },
    /**
     * Step to start timer.
     *
     * @method
     * @instance
     */
    startTimer: function () {
        this._timer = new Date;
    },
    /**
     * Step to stop timer.
     *
     * @method
     * @instance
     */
    stopTimer: function () {
        this._timer = null;
    },
    /**
     * Step to check timer.
     *
     * @method
     * @instance
     * @arg {string|object} condition - chaijs condition.
     * @throws {AssertionError} - If timer verification is failed.
     */
    checkTimer: function (condition) {
        expect(this._timer, "Timer isn't started").to.exist;
        var diff = (new Date - this._timer) / 1000;
        expect(diff, "Timing is failed").to.correspond(condition);
    },
};
