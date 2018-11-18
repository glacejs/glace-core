"use strict";
/**
 * `GlaceJS` common reporter.
 *
 * @class
 * @name GlaceReporter
 * @arg {object} runner - `MochaJS` runner.
 */

const fs = require("fs");
const util = require("util");

const _ = require("lodash");
const MochaReporter = require("mocha").reporters.base;
const U = require("glace-utils");
const LOG = U.logger;

const CONF = require("../config");
const TestCase = require("../testing").TestCase;
const utils = require("../utils");

/**
 * Registered reporters.
 *
 * @type {object[]}
 */
let reporters = [];

const GlaceReporter = function (runner) {
    MochaReporter.call(this, runner);

    runner.on("start", () => {
        for (const reporter of reporters) {
            if (reporter.start) reporter.start();
        }
    });

    runner.on("end", () => {
        const failedTests = CONF.test.cases.filter(t => t.status === TestCase.FAILED);

        if (!failedTests.length) {
            if (!CONF.session.errors.length) CONF.session.isPassed = true;
        }

        saveFailedTests(failedTests);

        if (fs.existsSync(CONF.report.dir)) {
            U.clearEmptyFolders(CONF.report.dir);
        }

        for (const reporter of reporters) {
            if (reporter.end) reporter.end();
        }
    });

    runner.on("suite", mochaSuite => {
        const methodName = {
            suite: "suite",
            scope: "scope",
            test: "test",
        }[mochaSuite.title.type];

        for (const reporter of reporters) {
            if (reporter[methodName]) reporter[methodName](mochaSuite);
        }
    });

    runner.on("suite end", mochaSuite => {
        const methodName = {
            suite: "suiteEnd",
            scope: "scopeEnd",
            test: "testEnd",
        }[mochaSuite.title.type];

        for (const reporter of reporters) {
            if (reporter[methodName]) reporter[methodName](mochaSuite);
        }

        if (methodName === "testEnd") {
            CONF.test.curCase = null;
            CONF.report.testDir = null;
            utils.setLog(); // Current test case is finished, need to reinit log
        }
    });

    runner.on("test", mochaTest => {
        for (const reporter of reporters) {
            if (reporter.chunk) reporter.chunk(mochaTest);
        }
    });

    runner.on("test end", mochaTest => {
        for (const reporter of reporters) {
            if (reporter.chunkEnd) reporter.chunkEnd(mochaTest);
        }
    });

    runner.on("hook", mochaHook => {
        for (const reporter of reporters) {
            if (reporter.hook) reporter.hook(mochaHook);
        }
    });

    runner.on("hook end", mochaHook => {
        for (const reporter of reporters) {
            if (reporter.hookEnd) reporter.hookEnd(mochaHook);
        }
    });

    runner.on("pass", mochaTest => {

        passChunkId();
        handleSkipState(mochaTest);
    
        const method = mochaTest.state === "skipped" ? "skip" : "pass";
        for (const reporter of reporters) {
            if (reporter[method]) reporter[method](mochaTest);
        }
    });

    runner.on("fail", (mochaTest, err) => {
        utils.accountError(mochaTest.title, err);

        for (const reporter of reporters) {
            if (reporter.fail) reporter.fail(mochaTest, err);
        }

        if (CONF.session.exitOnFail) {
            CONF.test.curCase.end(TestCase.FAILED);
            runner.emit("end");
        }
    });

    runner.on("pending", mochaTest => {
        for (const reporter of reporters) {
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
    let prms = Promise.resolve();
    reporters.forEach(reporter => {
        if (reporter.done) {
            prms = prms
                .then(() => reporter.done())
                .catch(e => LOG.error(e));
        }
    });
    return prms.then(() => fn(failures));
};
/**
 * Registers reporters if they are not.
 *
 * @method
 * @static
 * @arg {...object} reporters - Sequence of reporters to register.
 */
GlaceReporter.register = function () {
    for (const reporter of arguments) {
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
    const args = Array.from(arguments);
    args.unshift(reporters);
    reporters = _.without.apply(_, args);
};

/**
 * Mark chunk as passed via its ID.
 * @ignore
 */
const passChunkId = () => {
    if (!CONF.chunk.curId) return;
    if (CONF.chunk.passedIds.includes(CONF.chunk.curId)) return;

    CONF.chunk.passedIds.push(CONF.chunk.curId);
    if (CONF.test.curCase) CONF.test.curCase.addPassedChunkId(CONF.chunk.curId);
    CONF.chunk.curId = null;
};

/**
 * Handle skip state of mocha test.
 * @ignore 
 */
const handleSkipState = mochaTest => {
    if (!CONF.test.curCase) return;
    if (CONF.test.curCase.skipChunk !== mochaTest.title) return;

    mochaTest.state = "skipped";
    CONF.test.curCase.skipChunk = null;
};

const saveFailedTests = failedTests => {

    if (fs.existsSync(CONF.report.failedTestsPath)) {
        try {
            fs.unlinkSync(CONF.report.failedTestsPath);
        } catch (e) {
            LOG.error(util.format(`Can't remove file '${CONF.report.failedTestsPath}'`, e));
            return;
        }
    }

    const data = [];
    for (const failedTest of failedTests) {
        data.push({ id: failedTest.id, passed_chunk_ids: failedTest.passedChunkIds });
    }

    try {
        fs.writeFileSync(
            CONF.report.failedTestsPath, JSON.stringify(data, null, "  "));
    } catch (e) {
        LOG.error(util.format(`Can't write file '${CONF.report.failedTestsPath}'`, e));
    }
};
