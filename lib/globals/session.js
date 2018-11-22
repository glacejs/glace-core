"use strict";

const _ = require("lodash");

const CONF = require("../config");

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

    if (_.isFunction(fixtures)) [func, fixtures] = [fixtures];
    if (_.isArray(name)) [fixtures, name] = [name];
    if (_.isFunction(name)) [func, name] = [name];

    name = name || CONF.session.name;
    fixtures = fixtures || [];
    CONF.session.errors = [];

    suite(name, null, fixtures, sessCb(name, fixtures, func));
};

/**
 * Session callback.
 * @ignore
 */
const sessCb = (name, fixtures, func) => () => {
    func();
    after(afterCb(name, fixtures, func));
};

/**
 * After-hook callback.
 * @ignore
 */
const afterCb = (name, fixtures, func) => () => {
    delete CONF.retry.chunkIds[CONF.retry.id];
    if (_.isEmpty(CONF.retry.chunkIds)) return;
    CONF.retry.id++;
    CONF.test.id = 0;
    suite(name, null, fixtures, sessCb(name, fixtures, func));
};

module.exports = session;
