"use strict";
/**
 * `GlaceJS` common reporter.
 *
 * @class
 * @name GlaceReporter
 * @arg {object} runner - `MochaJS` runner.
 */

var _ = require("lodash");
var fs = require("fs");
var util = require("util");

var MochaReporter = require("mocha").reporters.base;
var U = require("glace-utils");
var LOG = U.logger;

var CONF = require("../config");
var TestCase = require("../testing").TestCase;
/**
 * Registered reporters.
 *
 * @type {object[]}
 */
var reporters = [];
var sessErrsNum = 0;

var GlaceReporter = function (runner) {
    MochaReporter.call(this, runner);

    runner.on("start", () => {
        for (var reporter of reporters) {
            if (reporter.start) reporter.start();
        }
    });

    runner.on("end", () => {

        if (!CONF.test.cases.filter(t => t.status === TestCase.FAILED).length && !sessErrsNum) {
            CONF.session.isPassed = true;
        }

        if (fs.existsSync(CONF.report.dir)) {
            U.clearEmptyFolders(CONF.report.dir);
        }

        for (var reporter of reporters) {
            if (reporter.end) reporter.end();
        }
    });

    runner.on("suite", mochaSuite => {
        for (var reporter of reporters) {
            if (CONF.test.suites.includes(mochaSuite.title)) {
                if (reporter.suiteEnd) reporter.suite(mochaSuite);
            } else if (_isSuiteTest(mochaSuite)) {
                if (reporter.test) reporter.test(mochaSuite);
            } else {
                if (reporter.scope) reporter.scope(mochaSuite);
            }
        }
    });

    runner.on("suite end", mochaSuite => {
        for (var reporter of reporters) {
            if (CONF.test.suites.includes(mochaSuite.title)) {
                if (reporter.suiteEnd) reporter.suiteEnd(mochaSuite);
            } else if (_isSuiteTest(mochaSuite)) {
                if (reporter.testEnd) reporter.testEnd(mochaSuite);
            } else {
                if (reporter.scopeEnd) reporter.scopeEnd(mochaSuite);
            }
        }
    });

    runner.on("test", mochaTest => {
        for (var reporter of reporters) {
            if (reporter.chunk) reporter.chunk(mochaTest);
        }
    });

    runner.on("test end", mochaTest => {
        for (var reporter of reporters) {
            if (reporter.chunkEnd) reporter.chunkEnd(mochaTest);
        }
    });

    runner.on("hook", mochaHook => {
        for (var reporter of reporters) {
            if (reporter.hook) reporter.hook(mochaHook);
        }
    });

    runner.on("hook end", mochaHook => {
        for (var reporter of reporters) {
            if (reporter.hookEnd) reporter.hookEnd(mochaHook);
        }
    });

    runner.on("pass", mochaTest => {
        if (CONF.test.curCase && CONF.test.curCase.skipChunk === mochaTest.title) {
            mochaTest.state = "skipped";
            CONF.test.curCase.skipChunk = null;
        }

        var method = mochaTest.state === "skipped" ? "skip" : "pass";
        for (var reporter of reporters) {
            if (reporter[method]) reporter[method](mochaTest);
        }
    });

    runner.on("fail", (mochaTest, err) => {
        if (CONF.test.curCase) {
            var errMsg = mochaTest.title;

            if (!_.isEmpty(CONF.test.curCase.testParams)) {
                errMsg += "\n" + util.format(CONF.test.curCase.testParams);
            }
            if (err.message) {
                errMsg += "\nmessage: " + err.message;
            }
            if (err.stack) {
                errMsg += "\nstack: " + err.stack;
            }
            if (err.seleniumStack) {
                errMsg += "\nselenium: " + JSON.stringify(err.seleniumStack,
                    null, "\t");
            }

            CONF.test.curCase.addError(errMsg);
            CONF.test.curCase.addFailedParams(
                _.clone(CONF.test.curCase.testParams));
        } else {
            sessErrsNum++;
        }

        for (var reporter of reporters) {
            if (reporter.fail) reporter.fail(mochaTest, err);
        }

        if (CONF.session.exitOnFail) {
            CONF.test.curCase.end(TestCase.FAILED);
            runner.emit("end");
        }
    });

    runner.on("pending", mochaTest => {
        for (var reporter of reporters) {
            if (reporter.pending) reporter.pending(mochaTest);
        }
    });
};
util.inherits(GlaceReporter, MochaReporter);
module.exports = GlaceReporter;
/**
 * Finalizes reporting.
 *
 * @function
 * @async
 * @arg {Array.<*>} failures - Tests failures.
 * @arg {function} fn - Finalizator.
 */
GlaceReporter.prototype.done = function (failures, fn) {
    var prms = Promise.resolve();
    reporters.forEach(reporter => {
        if (reporter.done) {
            prms = prms
                .then(() => reporter.done())
                .catch(e => LOG.error(e));
        }
    });
    prms.then(() => fn(failures));
};
/**
 * Registers reporters if they are not.
 *
 * @method
 * @static
 * @arg {...object} reporters - Sequence of reporters to register.
 */
GlaceReporter.register = function () {
    for (var reporter of arguments) {
        if (!reporters.includes(reporter)) {
            reporters.push(reporter);
        }
    }
};
/**
 * Removes reporters if they are registered.
 *
 * @method
 * @static
 * @arg {...object} reporters - Sequence of reporters to remove.
 */
GlaceReporter.remove = function () {
    reporters = _.without.apply(_, reporters, arguments);
};
/**
 * Helper to define whether `MochaJS` suite is `GlaceJS` test or no.
 *
 * It iterates among registered tests and check if suite name matches name
 * someone of tests. It is not possible to use `CONF.test.curCase` to compare
 * because `CONF.test.curCase` is assigned after event `suite`.
 *
 * @function
 * @ignore
 * @arg {object} mochaSuite - `MochaJS` suite.
 * @return {boolean} - `true` if `MochaJS` suite is `GlaceJS` test, `false`
 *  otherwise.
 */
var _isSuiteTest = mochaSuite => {
    for (var testCase of CONF.test.cases) {
        if (mochaSuite.title === testCase.name) {
            return true;
        }
    }
    return false;
};
