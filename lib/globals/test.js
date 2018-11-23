"use strict";

const path = require("path");

const _ = require("lodash");
const U = require("glace-utils");

const CONF = require("../config");
const TestCase = require("../testing").TestCase;
const ScopeType = require("../testing").ScopeType;
const setLog = require("../utils").setLog;

const _test = (names => {
    return (name, fixtures, opts, func) => {
        CONF.test.id++;
        CONF.chunk.id = 0;

        let preloaded_passed_chunk_ids;

        if (CONF.filter.testIds && !CONF.filter.testIds.includes(CONF.test.id)) return;

        if (CONF.filter.include) {
            let isIncluded = false;
            for (const include of CONF.filter.include) {
                if (isFilterMatched(name, include.id)) {
                    preloaded_passed_chunk_ids = include.passed_chunk_ids;
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

        const skip = !!opts.skip;
        const skipReason = _.isString(opts.skip) ? opts.skip : null;
        const retries = U.defVal(opts.retry, CONF.test.retries, 0);

        opts.chunkRetry = U.defVal(opts.chunkRetry, CONF.chunk.retries, 0);
        opts.chunkTimeout = U.defVal(opts.chunkTimeout);

        let testCase;
        if (!CONF.retry.id) {
            testCase = new TestCase(name, CONF.test.id);
            testCase.addPassedChunkIds(preloaded_passed_chunk_ids || []);
            CONF.test.cases.push(testCase);
            if (skip) {
                testCase.status = TestCase.SKIPPED;
                if (skipReason) testCase.addDetails(skipReason);
            }
        } else {
            testCase = CONF.test.cases.filter(t => t.id === CONF.test.id)[0];
            expect(testCase, "Oops! Testcase isn't found by id").to.exist;
        }

        if (testCase.status === TestCase.SKIPPED) return;

        if (!CONF.retry.chunkIds[retries]) CONF.retry.chunkIds[retries] = [];
        CONF.retry.curChunkIds = CONF.retry.chunkIds[retries];

        testFunc({ testCase, fixtures, opts, func });
    };
})([]);

const testFunc = ({ testCase, fixtures, opts, func }) => {
    fixtures = [initTestFixture(testCase)].concat(fixtures);
    const scopeType = new ScopeType(testCase.name).setType("test");

    scope(scopeType, fixtures, opts, () => {
        func();
    });
};

const initTestFixture = testCase => {
    return U.makeFixture({ before: beforeCb(testCase), after: afterCb });
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

const isFilterMatched = (testName, filterId) => {
    if (filterId == CONF.test.id) return true;
    filterId = filterId.toString();
    if (CONF.filter.precise) {
        return testName.toLowerCase() === filterId.toLowerCase();
    } else {
        return testName.toLowerCase().includes(filterId.toLowerCase());
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
const test = (name, fixtures, opts, func) => {

    if (_.isFunction(opts)) [func, opts] = [opts];
    if (_.isPlainObject(fixtures)) [opts, fixtures] = [fixtures];
    if (_.isFunction(fixtures)) [func, fixtures] = [fixtures];

    fixtures = fixtures || [];
    opts = opts || {};

    _test(name, fixtures, opts, func);
};

module.exports = test;
