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
