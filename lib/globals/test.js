"use strict";

const path = require("path");

const _ = require("lodash");
const U = require("glace-utils");

const CONF = require("../config");
const TestCase = require("../testing").TestCase;
const ScopeType = require("../testing").ScopeType;
const setLog = require("../utils").setLog;

const scope_ = require("./scope");

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
        CONF.test.id++;
        CONF.chunk.id = 0;

        let preloaded_chunk_ids;
        const o = {};

        if (CONF.filter.testIds && !CONF.filter.testIds.includes(CONF.test.id)) return;

        if (CONF.filter.include) {
            let isIncluded = false;
            for (const include of CONF.filter.include) {
                if (isFilterMatched(name, include.id)) {
                    preloaded_chunk_ids = include.passed_chunk_ids;
                    isIncluded = true;
                    break;
                }
            }
            if (!isIncluded) return;
        }

        if (CONF.filter.exclude) {
            for (const exclude of CONF.filter.exclude) {
                if (isFilterMatched(name, exclude.id)) return;
            }
        }

        if (CONF.test.checkNames && !CONF.retry.id) {
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
        const retries = U.defVal(opts.retry, CONF.test.retries, 0);
        o.testOpts = {};
        o.testOpts.chunkRetry = U.defVal(opts.chunkRetry, CONF.chunk.retries, 0);
        o.testOpts.chunkTimeout = U.defVal(opts.chunkTimeout);

        if (!CONF.retry.id) {
            o.testCase = new TestCase(name, CONF.test.id);
            o.testCase.addPassedChunkIds(preloaded_chunk_ids || []);
            CONF.test.cases.push(o.testCase);
            if (skip) {
                o.testCase.status = TestCase.SKIPPED;
                if (skipReason) o.testCase.addDetails(skipReason);
            }
        } else {
            o.testCase = CONF.test.cases.filter(t => t.id === CONF.test.id)[0];
            expect(o.testCase, "Oops! Testcase isn't found by id").to.exist;
        }

        if (o.testCase.status === TestCase.SKIPPED) return;

        if (!CONF.retry.chunkIds[retries]) CONF.retry.chunkIds[retries] = [];
        CONF.retry.curChunkIds = CONF.retry.chunkIds[retries];

        testFunc(o);
    };
})([]);

const testFunc = o => {
    const scopeType = new ScopeType(o.name).setType("test");
    const fixtures = [initTestFixture(o)].concat(o.fixtures);
    const func = o.func;

    scope_(scopeType, o.testOpts, fixtures, () => {
        func();
    });
};

const initTestFixture = o => {
    return U.makeFixture({ before: beforeCb(o.testCase), after: afterCb });
};

const beforeCb = testCase => ctx => () => {
    ctx.testCase = testCase;
    ctx.testCase.reset();
    ctx.testCase.start();
    CONF.test.curCase = ctx.testCase;
    CONF.report.testDir = path.resolve(
        CONF.report.dir, "tests", U.toKebab(ctx.testCase.name));
    setLog(); // Current test case is started, need to reinit log
};

const afterCb = ctx => () => {
    if (ctx.testCase.errors.length) {
        ctx.testCase.end(TestCase.FAILED);
    } else {
        ctx.testCase.end(TestCase.PASSED);
    }
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

const isFilterMatched = (testName, filterId) => {
    if (filterId == CONF.test.id) return true;
    filterId = filterId.toString();
    if (CONF.filter.precise) {
        return testName.toLowerCase() === filterId.toLowerCase();
    } else {
        return testName.toLowerCase().includes(filterId.toLowerCase());
    }
};

module.exports = test;
