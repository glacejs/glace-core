/* global scope before */

"use strict";

var U = require("glace-utils");

var CONF = require("../config");

/**
 * Executed sessions counter.
 * 
 * @type {Number}
 */
var sessNum = 0;
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
        name = CONF.sessionName;
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
    name = name || CONF.sessionName;
    ctx = ctx || {};
    fixtures = fixtures || [];

    sessNum++;
    ctx.sessionNumber = sessNum;

    scope(name, () => {
        before(() => CONF.isRunPassed = true);
        U.wrap(fixtures, func)();
    });
};

module.exports = session;
