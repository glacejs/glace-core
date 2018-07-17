"use strict";

const path = require("path");

const _ = require("lodash");
const U = require("glace-utils");
const LOG = U.logger;

const CONF = require("../config");
const TestCase = require("../testing").TestCase;
const ScopeType = require("../testing").ScopeType;

const retryTests = require("./session").retryTests;
const _scope = require("./scope");

/**
 * Helper to set actual log file.
 *
 * @function
 */
const setLog = () => {
    const testName = CONF.test.curCase ? U.toKebab(CONF.test.curCase.name) : "";
    const logFile = path.resolve(CONF.report.logsDir, testName, "logs", "test.log");
    LOG.setFile(logFile);
};
setLog(); // Set log immediately.

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
 * @arg {boolean|string} [opts.skip=false] - Flag to skip test or skip reason.
 * @arg {number} [opts.retry=0] - Number of retries on failure. Overrides
 *  config value for concrete test.
 * @arg {number} [opts.chunkRetry=0] - Number of chunk retries on failure.
 *  Overrides config value for concrete test chunks.
 * @arg {?number} [opts.chunkTimeout=null] - Time to execute chunk or hook, sec.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Test function.
 */
const baseTest = (names => {
    return (name, opts, fixtures, func) => {
        const o = {};

        if (CONF.filter.include) {
            let isIncluded = false;
            for (const include of CONF.filter.include) {
                if (isFilterMatched(name, include.name)) {
                    isIncluded = true;
                    o.ctxs = include.params;
                    break;
                }
            }
            if (!isIncluded) return;
        }

        if (CONF.filter.exclude) {
            for (const exclude of CONF.filter.exclude) {
                if (isFilterMatched(name, exclude.name)) return;
            }
        }

        if (CONF.test.checkNames) {
            if (names.includes(name)) {
                throw new Error(`Test case '${name}' is added already`);
            }
            names.push(name);
        }

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
        o.fixtures = fixtures || [];
        o.func = func;
        o.name = name;

        const skip = !!opts.skip;
        const skipReason = _.isString(opts.skip) ? opts.skip : null;
        o.retries = U.defVal(opts.retry, CONF.test.retries, 0);
        o.testOpts = {};
        o.testOpts.chunkRetry = U.defVal(opts.chunkRetry, CONF.test.chunkRetries, 0);
        o.testOpts.chunkTimeout = U.defVal(opts.chunkTimeout);

        o.testCase = new TestCase(name);
        CONF.test.cases.push(o.testCase);

        if (skip) {
            o.testCase.status = TestCase.SKIPPED;
            if (skipReason) o.testCase.addDetails(skipReason);
            return;
        }

        testFunc(o);
    };
})([]);

const testFunc = o => {
    o.ctxs = o.ctxs || [{}];
    _scope(new ScopeType(o.name).setType("test"), o.testOpts, () => {
        before(beforeCb(o));
        U.wrap(o.fixtures, wrapCb(o))();
        after(afterCb(o));
    });
};

const beforeCb = o => () => {
    if (o.testCase.hasFailedParams()) {
        o.failedParams = o.testCase.failedParams;
    } else {
        o.failedParams = o.ctxs;
    }
    o.testCase.reset();
    o.testCase.start();
    CONF.test.curCase = o.testCase;
    setLog(); // Current test case is started, need to reinit log
};

const afterCb = o => () => {
    if (o.testCase.errors.length) {
        o.testCase.end(TestCase.FAILED);
    } else {
        o.testCase.end(TestCase.PASSED);
    }

    CONF.test.curCase = null;
    setLog(); // Current test case is finished, need to reinit log

    if (o.testCase.status !== TestCase.FAILED || o.retries <= 0) {
        return;
    }
    o.retries--;

    if (!o.testCase.hasFailedParams()) {
        o.testCase.failedParams = o.failedParams;
    }

    o.ctxs = o.testCase.failedParams;
    retryTests.push({ func: testFunc, args: o });
};

const wrapCb = o => () => {
    for (const ctx of o.ctxs) o.func(ctx);
};

/**
 * Executes test case.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {object} [opts] - Options.
 * @arg {boolean|string} [opts.skip=false] - Flag to skip test or skip reason.
 * @arg {number} [opts.retry=0] - Number of retries on failure. Overrides
 *  config value for concrete test.
 * @arg {number} [opts.chunkRetry=0] - Number of chunk retries on failure.
 *  Overrides config value for concrete test chunks.
 * @arg {?number} [opts.chunkTimeout=null] - Time to execute chunk or hook, sec.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Test function.
 * @example
 *
 * test("Some test", () => {
 *     chunk("Some chunk", () => {
 *         someFunc();
 *     });
 * });
 *
 */
const test = (name, opts, fixtures, func) => {

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

    baseTest(name, opts, fixtures, func);
};

const isFilterMatched = (testName, filterName) => {
    if (CONF.filter.precise) {
        return testName.toLowerCase() === filterName.toLowerCase();
    } else {
        return testName.toLowerCase().includes(filterName.toLowerCase());
    }
};

module.exports = test;
