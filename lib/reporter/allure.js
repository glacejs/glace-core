"use strict";

/**
 * Allure reporter.
 *
 * @module
 */

require("colors");
var Step = require("allure-js-commons/beans/step");

var allure = require("../allure");
var CONF = require("../config");
var TestCase = require("../testing").TestCase;

module.exports = {
    start: () => {
        allure.startSuite(CONF.sessionName);
    },
    end: () => {
        var skipped = CONF.testCases.filter(t => t.status === TestCase.SKIPPED);
        for (var skip of skipped) {
            allure.startCase(skip.name);
            if (skip.rawInfo[0]) {
                allure.endCase(skip.status, { message: skip.rawInfo[0] });
            } else {
                allure.endCase(skip.status);
            };
        };
        allure.endSuite();

        console.log();
        var reportMsg = "Allure report is " + CONF.allure.dir;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
    },
    suite: suite => {
        allure.startSuite(suite.title);
    },
    suiteEnd: () => {
        allure.endSuite();
    },
    test: test => {
        allure.startCase(test.title);
    },
    testEnd: test => {
        var testCase = CONF.testCases.filter(t => t.name === test.title)[0];
        if (testCase.status === TestCase.PASSED) {
            allure.endCase(testCase.status);
        }
        if (testCase.status === TestCase.FAILED) {
            allure.endCase(testCase.status, { message: "Show details ➤", stack: getErrors(testCase) });
        }
    },
    chunk: chunk => {
        allure.startStep(chunk.title);
    },
    skip: () => {
        while (allure.getCurrentSuite().currentStep instanceof Step) {
            allure.endStep(TestCase.SKIPPED);
        };
    },
    pass: () => {
        while (allure.getCurrentSuite().currentStep instanceof Step) {
            allure.endStep(TestCase.PASSED);
        };
    },
    fail: () => {
        while (allure.getCurrentSuite().currentStep instanceof Step) {
            allure.endStep(TestCase.FAILED);
        };
    },
};

var getErrors = testCase => testCase.errors.map(e => e.split("\n").join("\r")).join("\n\r");
