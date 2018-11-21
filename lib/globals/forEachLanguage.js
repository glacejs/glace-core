"use strict";

const U = require("glace-utils");

const CONF = require("../config");

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
const forEachLanguage = (name, opts, fixtures, func) => {

    if (name instanceof Function) {
        func = name;
        name = null;
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

    name = name || null;
    opts = opts || {};
    fixtures = fixtures || [];

    (opts.languages || CONF.test.languages).forEach(_langCb(name, fixtures, func));
};

const _langCb = (name, fixtures, func) => lang => {
    name = name || "for language";
    const _fixtures = [langFixture(lang)].concat(fixtures);

    scope(`${name} "${lang}"`, null, _fixtures, () => {
        func(lang);
    });
};

const beforeCb = lang => ctx => () => {
    if (!CONF.test.curCase) return;
    ctx.oldLang = CONF.test.curCase.testParams.language;
    CONF.test.curCase.testParams.language = lang;
};

const afterCb = ctx => () => {
    if (!CONF.test.curCase) return;
    CONF.test.curCase.testParams.language = ctx.oldLang;
};

const langFixture = lang => {
    return U.makeFixture({ before: beforeCb(lang), after: afterCb });
};

module.exports = forEachLanguage;
