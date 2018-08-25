"use strict";

const U = require("glace-utils");

const CONF = require("../config");
const hacking = require("../hacking");

let sessNum = 0;
const retryTests = [];

/**
 * Executes tests session.
 *
 * @global
 * @function
 * @arg {string} [name] - Session name. By default it includes start date time.
 * @arg {object} [fixtures=[]] - Session fixtures.
 * @arg {function} func - Function with test cases.
 * @example

session(() => {
    test("Test #1", () => {
        chunk("Chunk #1", () => {
            someFunc();
        });
        chunk("Chunk #2", () => {
            someFunc();
        });
    });
    test("Test #2", () => {
        chunk("Chunk #1", () => {
            someFunc();
        });
        chunk("Chunk #2", () => {
            someFunc();
        });
    });
});

 */
const session = (name, fixtures, func) => {

    if (name instanceof Function) {
        func = name;
        name = CONF.session.name;
        fixtures = [];
    }
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    }
    name = name || CONF.session.name;
    fixtures = fixtures || [];

    sessNum++;
    CONF.session.errors = [];

    suite(name, sessCb(fixtures, func));
};

/**
 * Session callback.
 * @ignore
 */
const sessCb = (fixtures, func) => () => {
    U.wrap(fixtures, func)();

    after(afterCb);
};

/**
 * After-hook callback.
 * @ignore
 */
const afterCb = () => {
    if (!retryTests.filter(r => r.args.retries > 0).length) return;

    let sessName = `Retry #${sessNum}`;

    /* HACK to pass mocha grep */
    const mochaRunner = hacking.getRunner();
    if (mochaRunner._grep !== mochaRunner._defaultGrep) {
        sessName += " - " + mochaRunner._grep.source;
    }

    global.session(sessName, retryCb);
};
/**
 * Retry session callback.
 * @ignore
 */
const retryCb = () => {
    for (const retry of retryTests) {
        if (retry.args.retries > 0) {
            retry.args.retries--;
            retry.func(retry.args);
        }
    }
};

module.exports.session = session;
module.exports.retryTests = retryTests;
