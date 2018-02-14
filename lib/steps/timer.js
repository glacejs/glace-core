"use strict";
/**
 * Steps to measure time.
 *
 * @mixin TimerSteps
 */

var U = require("glace-utils");
var LOG = U.logger;

var TimerSteps = {
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
     * @throws {AssertionError} If pause message isn't defined.
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
        this._timer = new Date();
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
     * Step to get timer.
     *
     * @method
     * @instance
     * @return {number} Number of seconds since timer starts.
     */
    getTimer: function () {
        expect(this._timer, "Timer isn't started").to.exist;
        return (new Date() - this._timer) / 1000;
    },
    /**
     * Step to check timer.
     *
     * @method
     * @instance
     * @arg {string|object} condition - chaijs condition.
     * @throws {AssertionError} If timer verification was failed.
     */
    checkTimer: function (condition) {
        expect(this.getTimer(), "Timing is failed").to.correspond(condition);
    },
};

module.exports = TimerSteps;
