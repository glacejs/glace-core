"use strict";

/**
 * Glace dots reporter.
 *
 * @module
 */

require("colors");

const CONF = require("../config");
const TestCase = require("../testing").TestCase;
const utils = require("../utils");

let i = 0;
module.exports = {

    suite: suite => {
        if (suite.title.toString() == CONF.session.name) {
            const msg = Array(i).join("\n") + ">".cyan.bold + " ";
            process.stdout.write(msg);
            i = 2;
        }
    },

    pass: () => {
        process.stdout.write(".".green);
    },

    fail: () => {
        process.stdout.write("x".red);
    },

    end: () => {
        const failedTests = CONF.test.cases.filter(
            t => t.status === TestCase.FAILED);

        utils.printTestErrors(failedTests);
        utils.printSessionErrors();
    },

    done: console.log,
};
