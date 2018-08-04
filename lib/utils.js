"use strict";

/**
 * Utils.
 *
 * @module
 */

const path = require("path");

const U = require("glace-utils");
const LOG = U.logger;

const CONF = require("./config");

/**
* Helper to set actual log file.
*
* @function
*/
module.exports.setLog = () => {
    const testName = CONF.test.curCase ? U.toKebab(CONF.test.curCase.name) : "";
    const logFile = path.resolve(CONF.report.logsDir, testName, "logs", "test.log");
    LOG.setFile(logFile);
};
