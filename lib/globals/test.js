"use strict";

var path = require("path");

var _ = require("lodash");
var U = require("glace-utils");
var LOG = U.logger;

var CONF = require("../config");
var TestCase = require("../testing").TestCase;

var retryTests = require("./session").retryTests;

/**
 * Helper to set actual log file.
 *
 * @function
 */
var setLog = () => {
    var testName = CONF.curTestCase ? _.kebabCase(CONF.curTestCase.name) : "";
    var logFile = path.resolve(CONF.logsDir, testName, "logs", "test.log");
    LOG.setFile(logFile);
};
setLog(); // Set log immediatelly.

/**
 * Basis for any test case.
 *
 * If test with the same was registered already, this test will be omitted
 * with corresponding error in log.
 *
 * If retries amount is specified and this test was failed, the test will be
 * added to queue in separated session with title containing `Retry` and its
 * number.
 *
 * @abstract
 * @function
 * @arg {string} name - Name of test case.
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.skip=false] - Flag to skip test.
 * @arg {string} [opts.skipReason=null] - Skip reason if test is marked as skipped.
 * @arg {number} [opts.retry=0] - Number of retries on failure. Overrides
 *  config value for concrete test.
 * @arg {number} [opts.chunkRetry=0] - Number of chunk retries on failure.
 *  Overrides config value for concrete test chunks.
 * @arg {?number} [opts.chunkTimeout=null] - Time to execute chunk or hook, sec.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Test function.
 */
var baseTest = (names => {
    return (name, opts, fixtures, func) => {
        var ctxs;

        if (CONF.filter.include) {
            var isIncluded = false;
            for (var include of CONF.filter.include) {
                if (isFilterMatched(name, include.name)) {
                    isIncluded = true;
                    ctxs = include.params;
                    break;
                }
            }
            if (!isIncluded) return;
        }

        if (CONF.filter.exclude) {
            for (var exclude of CONF.filter.exclude) {
                if (isFilterMatched(name, exclude.name)) return;
            }
        }

        if (names.includes(name)) {
            throw new Error(`Test case '${name}' is added already`);
        }
        names.push(name);

        if (opts instanceof Function) {
            func = opts;
            opts = {};
            fixtures = [];
        }
        if (fixtures instanceof Function) {
            func = fixtures;
            fixtures = [];
        }
        opts = opts || {};
        fixtures = fixtures || [];

        opts.skip = U.defVal(opts.skip, false);
        opts.skipReason = U.defVal(opts.skipReason);
        opts.retry = U.defVal(opts.retry, CONF.testRetries, 0);
        opts.chunkRetry = U.defVal(opts.chunkRetry, CONF.chunkRetries, 0);
        opts.chunkTimeout = U.defVal(opts.chunkTimeout);

        var testCase = new TestCase(name);
        CONF.testCases.push(testCase);

        if (opts.skip) {
            testCase.status = TestCase.SKIPPED;
            if (opts.skipReason) testCase.addDetails(opts.skipReason);
            return;
        }

        var retries = opts.retry;

        var testFunc = ctxs => {
            ctxs = ctxs || [{}];

            scope(name, opts, () => {
                var failedParams;

                before(() => {
                    failedParams = testCase.failedParams;
                    testCase.reset();
                    testCase.start();
                    CONF.curTestCase = testCase;
                    setLog(); // Current test case is started, need to reinit log
                });

                U.wrap(fixtures, () => {
                    for (var ctx of ctxs) func(ctx);
                })();

                after(() => {
                    if (testCase.errors.length) {
                        testCase.end(TestCase.FAILED);
                    } else {
                        testCase.end(TestCase.PASSED);
                    }

                    CONF.curTestCase = null;
                    setLog(); // Current test case is finished, need to reinit log

                    if (testCase.status !== TestCase.FAILED || retries <= 0) {
                        return;
                    }
                    retries--;

                    if (_.isEmpty(testCase.failedParams[0]) &&
                        !_.isEmpty(failedParams[0])) {
                        testCase.failedParams = failedParams;
                    }

                    var testParams = testCase.failedParams;
                    retryTests.push({
                        func: testFunc,
                        args: testParams,
                    });
                });
            });
        };
        testFunc(ctxs);
    };
})([]);
/**
 * Executes test case.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.skip=false] - Flag to skip test.
 * @arg {string} [opts.skipReason=null] - Skip reason if test is marked as skipped.
 * @arg {number} [opts.retry=0] - Number of retries on failure. Overrides
 *  config value for concrete test.
 * @arg {number} [opts.chunkRetry=0] - Number of chunk retries on failure.
 *  Overrides config value for concrete test chunks.
 * @arg {?number} [opts.chunkTimeout=null] - Time to execute chunk or hook, sec.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Test function.
 * @example

test("Some test", () => {
    chunk("Some chunk", () => {
        someFunc();
    });
});

 */
var test = (name, opts, fixtures, func) => {

    if (opts instanceof Function) {
        func = opts;
        opts = {};
        fixtures = [];
    }
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    }
    opts = opts || {};
    fixtures = fixtures || [];

    baseTest(name, opts, fixtures, ctx => {
        func(ctx);
    });
};

var isFilterMatched = (testName, filterName) => {
    var result;
    if (CONF.filter.precise) {
        result = testName.toLowerCase() === filterName.toLowerCase();
    } else {
        result = testName.toLowerCase().includes(filterName.toLowerCase());
    }
    return result;
};

module.exports = test;
