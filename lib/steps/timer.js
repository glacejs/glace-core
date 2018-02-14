"use strict";
/**
 * Steps to measure time.
 * 
 * These methods will be mixed with glacejs [Steps](https://glacejs.github.io/glace-core/Steps.html)
 * class and available via its instance [SS](https://glacejs.github.io/glace-core/global.html#SS)
 * in tests.
 *
 * @mixin TimerSteps
 */

var U = require("glace-utils");
var LOG = U.logger;

var TimerSteps = {
    /**
     * Step to make pause in another step or test case. **Good style** is
     * to not use directly in test case, only inside another step.
     *
     * @async
     * @method
     * @instance
     * @arg {number} timeout - Pause time, sec.
     * @arg {string} message - Pause reason.
     * @return {Promise<void>}
     * @throws {AssertionError} If pause message isn't defined.
     * @example
     *
     * await SS.pause(1, "wait for server start");
     */
    pause: async function (timeout, message) {
        expect(message, "Pause message is not defined").to.not.be.undefined;
        LOG.warn("Sleep", timeout, "sec, reason:", message);
        await U.sleep(timeout * 1000);
    },
    /**
     * Step to start timer.
     * Each time when it will be called, timer will be reset.
     *
     * @method
     * @instance
     * @example
     *
     * SS.startTimer();
     * await SS.pause(1, "sleep a bit");
     * var elapsedSeconds = SS.getTimer();
     */
    startTimer: function () {
        this._timer = new Date();
    },
    /**
     * Step to stop timer.
     *
     * @method
     * @instance
     * @example
     *
     * SS.stopTimer();
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
     * @throws {AssertionError} If timer isn't started.
     * @example
     *
     * SS.startTimer();
     * await SS.pause(1, "sleep a bit");
     * var elapsedSeconds = SS.getTimer();
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
     * @arg {string|object} condition - [chaijs](http://chaijs.com/) condition.
     * @throws {AssertionError} If timer verification was failed.
     * @example
     *
     * SS.startTimer();
     * SS.checkTimer("to exist");
     *
     * SS.startTimer();
     * await SS.pause(1, "sleep a bit");
     * SS.checkTimer({ "to be gte": 1 });
     */
    checkTimer: function (condition) {
        expect(this.getTimer(), "Timing is failed").to.correspond(condition);
    },
};

module.exports = TimerSteps;
