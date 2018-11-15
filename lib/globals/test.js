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
 * Global function, existing in `glace` tests, which creates test case.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case. By default, should be unique in session.
 * But uniqueness check can be skipped with CLI option `--dont-check-names`.
 * @arg {object} [opts] - Options.
 * @arg {boolean|string} [opts.skip=false] - Flag to skip test or skip reason message.
 * @arg {?number} [opts.retry=null] - Number of test retries on failure. Overrides
 * [config](GlaceConfig.html#test-retry) settings.
 * @arg {?number} [opts.chunkRetry=null] - <a name="test-chunk-retry" href="#test-chunk-retry">#</a>
 * Number of chunk retries on failure. Overrides [config](GlaceConfig.html#test-chunk-retry) settings.
 * @arg {?number} [opts.chunkTimeout=null] - <a name="test-chunk-timeout" href="#test-chunk-timeout">#</a>
 * Time to execute chunk or hook, **sec**. Overrides [config](GlaceConfig.html#test-chunk-timeout) settings.
 * @arg {function[]} [fixtures] - Involved [fixtures](tutorial-common-used-funcs.html#fixtures) list.
 * @arg {function} func - Сallback function with [chunks](#chunk__anchor) and hooks.
 *
 * @example <caption><b>Simple test</b></caption>
 *
 * test("Some test", () => {
 *     chunk("Some chunk", () => {
 *         someFunc();
 *     });
 * });
 *
 * @example <caption><b>Test with retry</b></caption>
 *
 * test("Test with retry", { retry: 2 }, () => {
 *     chunk(() => {
 *         someFunc();
 *     });
 * });
 *
 * @example <caption><b>Test with fixtures</b></caption>
 *
 * test("Test with fixtures", null, [fix_func_1, fix_func_2], () => {
 *     chunk(() => {
 *         someFunc();
 *     });
 * });
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
