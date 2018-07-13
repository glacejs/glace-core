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
        const methodName = {
            suite: "suite",
            scope: "scope",
            test: "test",
        }[mochaSuite.title.type];

        for (var reporter of reporters) {
            if (reporter[methodName]) reporter[methodName](mochaSuite);
        }
    });

    runner.on("suite end", mochaSuite => {
        const methodName = {
            suite: "suiteEnd",
            scope: "scopeEnd",
            test: "testEnd",
        }[mochaSuite.title.type];

        for (var reporter of reporters) {
            if (reporter[methodName]) reporter[methodName](mochaSuite);
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
