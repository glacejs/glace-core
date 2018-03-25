"use strict";

var U = require("glace-utils");

var CONF = require("../config");

/**
 * Iterates test chunks through all languages specified in config or options.
 *
 * It's applicable for multilingual application. If list of languages is
 * specified, it will be used firstly. Otherwise from configuration.
 *
 * @global
 * @function
 * @arg {object} [ctx] - Test case context.
 * @arg {object} [opts] - Options.
 * @arg {?string[]} [opts.languages] - List of tested languages.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Function with test steps.
 * @example
 *
 * test("Some test", ctx => {
 *     forEachLanguage(ctx, lang => {
 *         chunk(() => {
 *             // payload
 *         });
 *     });
 * });
 */
var forEachLanguage = (ctx, opts, fixtures, func) => {

    if (ctx instanceof Function) {
        func = ctx;
        ctx = {};
        opts = {};
        fixtures = [];
    }

    if (opts instanceof Function) {
        func = opts;
        opts = {};
        fixtures = [];
    }

    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    }

    ctx = ctx || {};
    opts = opts || {};
    fixtures = fixtures || [];

    var languages = ctx.language ? [ctx.language]
        : (opts.languages || CONF.languages);

    languages.forEach(_langCb(fixtures, func));
};

var _langCb = (fixtures, func) => lang => {
    scope(`for language "${lang}"`, () => {
        before(() => {
            if (CONF.curTestCase) {
                CONF.curTestCase.testParams.language = lang;
            }
        });
        U.wrap(fixtures, () => func(lang))();
    });
};

module.exports = forEachLanguage;
