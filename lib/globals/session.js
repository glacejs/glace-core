"use strict";

var U = require("glace-utils");

var CONF = require("../config");
var hacking = require("../hacking");

/**
 * Executed sessions counter.
 * 
 * @type {Number}
 */
var sessNum = 0;
var retryTests = [];
/**
 * Executes tests session.
 *
 * @global
 * @function
 * @arg {string} [name] - Session name. By default it includes start date time.
 * @arg {object} [ctx] - Session context. By default it's empty.
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
var session = (name, ctx, fixtures, func) => {

    if (name instanceof Function) {
        func = name;
        name = CONF.session.name;
        ctx = {};
        fixtures = [];
    }
    if (ctx instanceof Function) {
        func = ctx;
        ctx = {};
        fixtures = [];
    }
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    }
    name = name || CONF.session.name;
    ctx = ctx || {};
    fixtures = fixtures || [];

    sessNum++;
    ctx.sessionNumber = sessNum;
    CONF.session.errors = [];

    suite(name, () => {
        U.wrap(fixtures, func)();

        after(() => {
            if (!retryTests.length) return;

            var sessName = `Retry #${sessNum}`;
            /* Hack to pass mocha grep */
            var mochaRunner = hacking.getRunner();
            if (mochaRunner._grep !== mochaRunner._defaultGrep) {
                sessName += " - " + mochaRunner._grep.source;
            }
            var sessCtx = { retryNumber: sessNum };

            global.session(sessName, sessCtx, null, () => {
                for (const retry of retryTests) retry.func(retry.args);
            });
        });
    });
};

module.exports.session = session;
module.exports.retryTests = retryTests;
