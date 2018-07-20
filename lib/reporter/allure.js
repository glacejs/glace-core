"use strict";

/**
 * Allure reporter.
 *
 * @module
 */

require("colors");

const allure = require("../allure");
const CONF = require("../config");
const TestCase = require("../testing").TestCase;

module.exports = {

    start: () => {
        allure.startSuite(CONF.allure.suiteName);
    },

    end: () => {
        const skipped = CONF.test.cases.filter(t => t.status === TestCase.SKIPPED);

        for (const skip of skipped) {
            allure.startCase(skip.name);

            if (skip.rawInfo[0]) {
                allure.endCase(allure.SKIPPED, { message: skip.rawInfo[0] });
            } else {
                allure.endCase(allure.SKIPPED);
            }
        }

        allure.endSuite();

        console.log();
        const reportMsg = "Allure report is " + CONF.allure.dir;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
    },

    suite: suite => {
        allure.startSuite(suite.title);
    },

    suiteEnd: () => {
        allure.endSuite();
    },

    scope: scope => {
        if (!allure.isTestStarted()) return;
        allure.startStep(scope.title);
        allure.getCurrentSuite().currentStep.isScope = true; // small hack
    },

    scopeEnd: () => {
        if (allure.isTestStarted()) allure.endStep();
    },

    test: test => {
        allure.startCase(test.title);
    },

    testEnd: test => {
        const testCase = CONF.test.cases.filter(t => t.name == test.title)[0];

        if (testCase.status === TestCase.PASSED) {
            allure.endCase(allure.PASSED);
        }

        if (testCase.status === TestCase.FAILED) {
            allure.endCase(allure.FAILED, getErrors(testCase));
        }
    },

    chunk: chunk => {
        allure.startStep(chunk.title);
    },

    skip: () => {
        while (allureNotScope()) allure.endStep(allure.SKIPPED);
    },

    pass: () => {
        while (allureNotScope()) allure.endStep(allure.PASSED);
    },

    fail: () => {
        while (allureNotScope()) allure.endStep(allure.FAILED);
    },
};

const allureNotScope = () => allure.hasSteps() && !allure.getCurrentSuite().currentStep.isScope;

const getErrors = testCase => {
    const result = {};

    const errMsgs = getErrMsgs(testCase.errors);

    if (errMsgs.length === 0) {
        result.message = "Show details ➤";
    } else if (errMsgs.length === 1) {
        result.message = errMsgs[0];
    } else {
        let n = 0;
        result.message = errMsgs.map(i => `${++n}. ${i}`).join("\r");
    }

    result.stack = testCase.errors.map(e => e.split("\n").join("\r")).join("\n\r");

    return result;
};

const getErrMsgs = errs => {
    const result = [];
    for (const err of errs) {
        for (const line of err.split("\n")) {
            if (line.startsWith("message: ")) {
                result.push(line.substr(9));
                break;
            };
        }
    }
    return result;
};
