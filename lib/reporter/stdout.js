"use strict";
/**
 * `GlaceJS` stdout reporter.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");
var util = require("util");

var colors = require("colors");
var MochaReporter = require("mocha").reporters.base;

var CONF = require("../config");
var TestCase = require("../testing").TestCase;

var sessionErrors = [];

var indents = 0;
var indent = () => Array(indents).join("  ");

var report = fs.createWriteStream(
    path.resolve(process.cwd(), "report.log"), { flags : "w" });

var stdout = function() {
    report.write(colors.strip(util.format.apply(util, arguments)) + "\n");
    console.log.apply(console, arguments);
};

var epilogue = () => {
    var msg,
        testCase,
        indent = "  ",
        passedTests = [],
        failedTests = [],
        skippedTests = [];

    for (testCase of CONF.testCases) {
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

    var execChunks = CONF.testCases.reduce((a, b) => a + b.chunks.length, 0);
    if (execChunks !== 0) {
        msg = "executed chunk" + (execChunks === 1 ? "" : "s");
        stdout((indent + execChunks + " " + msg).white);
    }

    var execTime = CONF.testCases
        .map(t => t.duration)
        .reduce((a, b) => a + b, 0) / 1000;

    if (execTime > 0) {
        stdout();
        stdout(indent + "Summary tests time is".white,
            `${execTime} sec`.white.bold);
    }

    if (skippedTests.length !== 0) {
        msg = "skipped test" + (skippedTests.length === 1 ? "" : "s");
        stdout();
        stdout((indent + "# " +
                String(skippedTests.length).bold + " " + msg).gray);

        for (var skip of skippedTests) {
            msg = `* '${skip.name}'`;
            if (skip.rawInfo[0]) {
                msg += " - " + skip.rawInfo[0].bold;
            }
            stdout(indent + indent + msg.gray);
        }
    }

    if (failedTests.length) {
        stdout();
        stdout("TEST FAILURES:".bold);
        for (testCase of failedTests) {
            stdout();
            stdout(("test: " + testCase.name).cyan.bold);
            for(var err of testCase.errors) {
                stdout();
                stdout(err.red.bold);
            }
        }
    }
    if (sessionErrors.length) {
        stdout();
        stdout("OUTTEST FAILURES:".bold);
        for (var error of sessionErrors) {
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
        var reportMsg = "Local report is " + CONF.reportsDir;
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
        if (indents !== 1) {
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
        if (indents === 1) stdout();
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
        stdout();
        stdout((indent() + "test: " + test.title).cyan.bold);
    },
    /**
     * Called on test end.
     *
     * @method
     * @instance
     */
    testEnd: () => {
        --indents;
        if (indents === 1) stdout();
    },
    /**
     * Called on chunk passed.
     *
     * @method
     * @instance
     * @arg {object} chunk - `MochaJS` test.
     */
    pass: chunk => {
        var msg = indent() + "  " + MochaReporter.symbols.ok + " chunk";
        if (chunk.title) msg += ": " + chunk.title;
        stdout(msg.green);
    },
    /**
     * Called on chunk or hook failed.
     *
     * @method
     * @instance
     * @arg {object} chunk - `MochaJS` test.
     */
    fail: (chunk, err) => {
        if (!CONF.curTestCase) {
            var errMsg = chunk.title;

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
        }
        var msg = indent() + "  " + MochaReporter.symbols.err + " chunk";
        if (chunk.title) msg += ": " + chunk.title;
        stdout(msg.red);
    },
    /**
     * Called on report finalizing.
     *
     * @method
     * @instance
     */
    done: () => new Promise(resolve => report.end(resolve)),
};
