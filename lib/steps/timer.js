/* global expect */

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

var util = require("util");

var U = require("glace-utils");
var LOG = U.logger;
 
var A = require("../allure");

var TimerSteps = {

    pause: async function (timeout, message) {
        /**
         * Step to make pause in another step or test case. **Good style** is
         * to not use directly in test case, only inside another step.
         *
         * @async
         * @memberOf TimerSteps
         * @method pause
         * @instance
         * @arg {number} timeout - Pause time, sec.
         * @arg {string} message - Pause reason.
         * @return {Promise<void>}
         * @throws {AssertionError} If pause message isn't defined.
         * @example
         *
         * await SS.pause(1, "wait for server start");
         */

        A.step(`Sleep ${timeout} sec because ${message}`);
        expect(message, "Pause message is not defined").to.not.be.undefined;
        LOG.warn("Sleep", timeout, "sec, reason:", message);
        await U.sleep(timeout * 1000);
        A.pass();
    },

    startTimer: function () {
        /**
         * Step to start timer.
         * Each time when it will be called, timer will be reset.
         *
         * @memberOf TimerSteps
         * @method startTimer
         * @instance
         * @example
         *
         * SS.startTimer();
         * await SS.pause(1, "sleep a bit");
         * var elapsedSeconds = SS.getTimer();
         */

        A.step("Start timer");
        this._timer = new Date();
        A.pass();
    },

    stopTimer: function () {
        /**
         * Step to stop timer.
         *
         * @memberOf TimerSteps
         * @method stopTimer
         * @instance
         * @example
         *
         * SS.stopTimer();
         */

        A.step("Stop timer");
        this._timer = null;
        A.pass();
    },

    getTimer: function () {
        /**
         * Step to get timer.
         *
         * @memberOf TimerSteps
         * @method getTimer
         * @instance
         * @return {number} Number of seconds since timer starts.
         * @throws {AssertionError} If timer isn't started.
         * @example
         *
         * SS.startTimer();
         * await SS.pause(1, "sleep a bit");
         * var elapsedSeconds = SS.getTimer();
         */

        A.step("Get timer value");
        expect(this._timer, "Timer isn't started").to.exist;
        var result = (new Date() - this._timer) / 1000;
        A.pass();
        return result;
    },

    checkTimer: function (condition) {
        /**
         * Step to check timer.
         *
         * @memberOf TimerSteps
         * @method checkTimer
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

        if (typeof(condition) === "string") {
            var stepMsg = `Check timer ${condition}`;
        } else {
            stepMsg = util.format("Check timer with condition", condition);
        }

        A.step(stepMsg);
        expect(this.getTimer(), "Timing is failed").to.correspond(condition);
        A.pass();
    },
};

module.exports = TimerSteps;
