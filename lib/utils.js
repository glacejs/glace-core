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
    const logsDir = CONF.report.testDir || CONF.report.dir;
    const logFile = path.resolve(logsDir, "logs", "test.log");
    LOG.setFile(logFile);
};
