"use strict";

var U = require("glace-utils");

/**
 * Execute tests scope.
 *
 * @global
 * @function
 * @arg {string} name - Scope name.
 * @arg {object} [opts] - Scope options.
 * @arg {number} [opts.chunkRetry] - Number of chunk retries on failure.
 * @arg {number} [opts.chunkTimeout] - Time to execute chunk or hook, sec.
 * @arg {function[]} [fixtures] - List of fixtures.
 * @arg {function} func - Function with test cases.
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
var scope = (name, opts, fixtures, func) => {

    if (opts instanceof Function) {
        func = opts;
        opts = {};
        fixtures = [];
    }
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    }
    opts = opts || {};
    fixtures = fixtures || {};

    describe(name, function () {
        if (opts.chunkRetry) this.retries(opts.chunkRetry);
        if (opts.chunkTimeout) this.timeout(opts.chunkTimeout * 1000);
        U.wrap(fixtures, func)();
    });
};

module.exports = scope;
