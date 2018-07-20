"use strict";
/**
 * `GlaceJS` stdout reporter.
 *
 * @module
 */

const fs = require("fs");
const path = require("path");
const util = require("util");

const _ = require("lodash");
const colors = require("colors");
const fse = require("fs-extra");
const LOG = require("glace-utils").logger;
const MochaReporter = require("mocha").reporters.base;
const prettyms = require("pretty-ms");

const CONF = require("../config");
const TestCase = require("../testing").TestCase;

const sessionErrors = [];

let indents = 0;
const indent = () => Array(indents).join("  ");

fse.mkdirsSync(CONF.report.logsDir);

const report = fs.createWriteStream(
    path.resolve(CONF.report.logsDir, "stdout.log"), { flags : "w" });

const stdout = function() {
    report.write(colors.strip(util.format.apply(util, arguments)) + "\n");
    console.log.apply(console, arguments);
};

const epilogue = () => {
    let msg;
    const indent = "  ",
        passedTests = [],
        failedTests = [],
        skippedTests = [];

    for (const testCase of CONF.test.cases) {
        if (testCase.status === TestCase.FAILED) {
            failedTests.push(testCase);
        }
        if (testCase.status === TestCase.PASSED) {
            passedTests.push(testCase);
        }
        if (testCase.status === TestCase.SKIPPED) {
            skippedTests.push(testCase);
        }
    }

    if (passedTests.length !== 0) {
        msg = "passed test" + (passedTests.length === 1 ? "" : "s");
        stdout((indent + MochaReporter.symbols.ok + " " +
                String(passedTests.length).bold + " " + msg).green);
    }

    if (failedTests.length !== 0) {
        msg = "failed test" + (failedTests.length === 1 ? "" : "s");
        stdout((indent + MochaReporter.symbols.err + " " +
                String(failedTests.length).bold + " " + msg).red);
    }

    const execChunks = CONF.test.cases.reduce((a, b) => a + b.chunks.length, 0);
    if (execChunks !== 0) {
        msg = "executed chunk" + (execChunks === 1 ? "" : "s");
        stdout((indent + execChunks + " " + msg).white);
    }

    let execTime = CONF.test.cases
        .map(t => t.duration)
        .reduce((a, b) => a + b, 0);

    if (execTime > 0) {
        execTime = (execTime < 60000 ? `${execTime / 1000} sec` : prettyms(execTime)).white.bold;
        stdout();
        stdout(indent + "Summary tests time is".white, execTime);
    }

    if (skippedTests.length !== 0) {
        msg = "skipped test" + (skippedTests.length === 1 ? "" : "s");
        stdout();
        // HACK https://github.com/glacejs/glace-core/issues/136
        stdout(indent + "# ".gray + String(skippedTests.length).gray.bold + " " + msg.gray);

        for (const skip of skippedTests) {
            msg = `* '${skip.name}'`;
            if (skip.rawInfo[0]) {
                msg += " - " + skip.rawInfo[0].bold;
            }
            stdout(indent + indent + msg.gray);
        }
    }

    if (fs.existsSync(CONF.report.failedTestsPath)) {
        try {
            fs.unlinkSync(CONF.report.failedTestsPath);
        } catch (e) {
            LOG.error(`Can't remove file '${CONF.report.failedTestsPath}'`, e);
        }
    };

    if (failedTests.length) {
        const failedTestsJson = [];
        stdout();
        stdout("TEST FAILURES:".bold);
        for (const testCase of failedTests) {
            stdout();
            stdout(("test: " + testCase.name).cyan.bold);
            for(const err of testCase.errors) {
                stdout();
                stdout(err.red.bold);
            }
            const data = { name: testCase.name };
            if (!_.isEmpty(testCase.failedParams[0])) {
                data.params = testCase.failedParams;
            }
            failedTestsJson.push(data);
        }

        try {
            fs.writeFileSync(
                CONF.report.failedTestsPath,
                JSON.stringify(failedTestsJson, null, "  "));
        } catch (e) {
            LOG.error(`Can't write file '${CONF.report.failedTestsPath}'`, e);
        }
    }
    if (sessionErrors.length) {
        stdout();
        stdout("OUTTEST FAILURES:".bold);
        for (const error of sessionErrors) {
            stdout();
            stdout(error.red.bold);
        }
    }
};

module.exports = {
    /**
     * Called before tests end.
     *
     * @method
     * @instance
     */
    end: () => {
        epilogue();
        stdout();
        const reportMsg = "Local report is " + CONF.report.dir;
        stdout(Array(reportMsg.length + 1).join("-").yellow);
        stdout(reportMsg.yellow);
    },
    /**
     * Called on scope start.
     *
     * @method
     * @instance
     * @arg {object} scope - `MochaJS` suite.
     */
    scope: scope => {
        ++indents;
        if (indents) {
            stdout();
            stdout((indent() + "scope: " + scope.title).cyan);
        }
    },
    /**
     * Called before scope end.
     *
     * @method
     * @instance
     */
    scopeEnd: () => {
        --indents;
        if (!indents) stdout();
    },
    /**
     * Called on suite start.
     *
     * @method
     * @instance
     * @arg {object} suite - `MochaJS` suite.
     */
    suite: suite => {
        ++indents;
        if (indents) {
            stdout();
            stdout((indent() + "suite: " + suite.title).cyan);
        }
    },
    /**
     * Called before suite end.
     *
     * @method
     * @instance
     */
    suiteEnd: () => {
        --indents;
        if (!indents) stdout();
    },
    /**
     * Called on test start.
     *
     * @method
     * @instance
     * @arg {object} test - `MochaJS` suite.
     */
    test: test => {
        ++indents;
        if (indents) {
            stdout();
            stdout((indent() + "test: " + test.title).cyan.bold);
        }
    },
    /**
     * Called on test end.
     *
     * @method
     * @instance
     */
    testEnd: () => {
        --indents;
        if (!indents) stdout();
    },
    /**
     * Called on chunk passed.
     *
     * @method
     * @instance
     * @arg {object} chunk - `MochaJS` test.
     */
    pass: chunk => {
        let msg = indent() + "  " + MochaReporter.symbols.ok + " chunk";
        if (chunk.title) msg += ": " + chunk.title;
        stdout(msg.green);
    },
    /**
     * Called on chunk skipped.
     *
     * @method
     * @instance
     * @arg {object} chunk - `MochaJS` test.
     */
    skip: chunk => {
        let msg = indent() + "  # chunk";
        if (chunk.title) msg += ": " + chunk.title;
        stdout(msg.gray);
    },
    /**
     * Called on chunk or hook failed.
     *
     * @method
     * @instance
     * @arg {object} chunk - `MochaJS` test.
     */
    fail: (chunk, err) => {
        let errMsg;
        if (!CONF.test.curCase) {
            errMsg = chunk.title;

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
            sessionErrors.push(errMsg);
        } else {
            errMsg = _.last(CONF.test.curCase.errors);
        };
        let msg = indent() + "  " + MochaReporter.symbols.err + " chunk";
        if (chunk.title) msg += ": " + chunk.title;
        stdout(msg.red);
        if (CONF.report.errorsNow) {
            stdout(errMsg.red.bold);
        }
    },
    /**
     * Called on report finalizing.
     *
     * @method
     * @instance
     */
    done: () => new Promise(resolve => report.end(resolve)),
};
