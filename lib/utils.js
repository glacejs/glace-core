"use strict";

/**
 * Utils.
 *
 * @module
 */

const path = require("path");
const util = require("util");

const _ = require("lodash");
const U = require("glace-utils");
const LOG = U.logger;

const CONF = require("./config");

/**
* Helper to set actual log file.
*
* @function
*/
module.exports.setLog = () => {
    const logsDir = CONF.report.testDir || CONF.report.dir;
    const logFile = path.resolve(logsDir, "logs", "test.log");
    LOG.setFile(logFile);
};

/**
 * Account test error and add it to test or session errors.
 *
 * @function
 */
module.exports.accountError = (errMsg, err) => {
    errMsg = errMsg || "";

    if (CONF.test.curCase && !_.isEmpty(CONF.test.curCase.testParams)) {
        errMsg += "\n" + util.format(CONF.test.curCase.testParams);
    }
    if (err.message) {
        errMsg += "\nmessage: " + err.message;
    }
    if (err.stack) {
        errMsg += "\nstack: " + err.stack;
    }
    if (err.seleniumStack) {
        errMsg += "\nselenium: " + JSON.stringify(err.seleniumStack, null, "\t");
    }
    errMsg = errMsg.trim();

    if (CONF.test.curCase) {
        CONF.test.curCase.addError(errMsg);
    } else {
        CONF.session.errors.push(errMsg);
    }
};

/**
 * Get function description.
 *
 * @function
 * @arg {function} func - Function to read documentation.
 * @return {string} Documentation.
 */
module.exports.getDoc = func => {
    let doc = func.__doc__;
    if (!doc) return "";

    doc = doc
        .split("\n")
        .map(i => i.trim())
        .filter(i => i)
        .map(i => `   ${i}`)
        .join("\n");

    if (!doc) return "";
    return `  /**\n${doc}\n   */`;
};


module.exports.printTestErrors = (failedTests, log = console.log) => {
    if (!failedTests.length) return;
    log();
    log("TEST FAILURES:".bold);
    for (const testCase of failedTests) {
        log();
        log(("test: " + testCase.name).cyan.bold);
        for(const err of testCase.errors) {
            log();
            log(err.red.bold);
        }
    }
};


module.exports.printSessionErrors = (log = console.log) => {
    if (!CONF.session.errors.length) return;
    log();
    log("OUTTEST FAILURES:".bold);
    for (const error of CONF.session.errors) {
        log();
        log(error.red.bold);
    }
};
