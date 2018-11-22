"use strict";

const _ = require("lodash");
const U = require("glace-utils");

/**
 * Execute tests scope.
 *
 * @global
 * @function
 * @arg {string} name - Scope name.
 * @arg {function[]} [fixtures] - List of fixtures.
 * @arg {object} [opts] - Scope options.
 * @arg {number} [opts.chunkRetry] - Number of chunk retries on failure.
 * @arg {number} [opts.chunkTimeout] - Time to execute chunk or hook, sec.
 * @arg {function} func - Callback function with test cases.
 * @example

scope("Some test scope", () => {
    test("Some test name", () => {
        before(() => {
            someFunc();
        });
        chunk("chunk #1", () => {
            someFunc();
        });
        chunk("chunk #2", () => {
            someFunc();
        });
    });
});

 */
const scope = (name, fixtures, opts, func) => {

    if (_.isFunction(opts)) [func, opts] = [opts];
    if (_.isPlainObject(fixtures)) [opts, fixtures] = [fixtures];
    if (_.isFunction(fixtures)) [func, fixtures] = [fixtures];

    fixtures = fixtures || [];
    opts = opts || {};

    describe(name, scopeCb(fixtures, opts, func));
};

/**
 * Scope callback.
 * @ignore
 */
const scopeCb = (fixtures, opts, func) => function () {
    if (opts.chunkRetry) this.retries(opts.chunkRetry);
    if (opts.chunkTimeout) this.timeout(opts.chunkTimeout * 1000);
    U.wrap(fixtures, func)();
};

module.exports = scope;
