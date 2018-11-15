"use strict";

const _ = require("lodash");
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
 * @arg {object} [name="for language"] - Iterator namespace (will be report).
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {object} [opts] - Options.
 * @arg {?string[]} [opts.languages] - List of tested languages.
 * @arg {number} [opts.chunkRetry=0] - Number of chunk retries on failure.
 *  Overrides config value for concrete test chunks.
 * @arg {?number} [opts.chunkTimeout=null] - Time to execute chunk or hook, sec.
 * @arg {function} func - Function with test steps.
 * @example
 *
 * test("Some test", ctx => {
 *     forEachLanguage(lang => {
 *         chunk(() => {
 *             // payload
 *         });
 *     });
 * });
 */
const forEachLanguage = (name, fixtures, opts, func) => {

    if (_.isFunction(opts)) [func, opts] = [opts];
    if (_.isPlainObject(fixtures)) [opts, fixtures] = [fixtures];
    if (_.isFunction(fixtures)) [func, fixtures] = [fixtures];
    if (_.isArray(name)) [fixtures, name] = [name];
    if (_.isPlainObject(name)) [opts, name] = [name];
    if (_.isFunction(name)) [func, name] = [name];

    name = name || "for language";
    opts = opts || {};
    fixtures = fixtures || [];
    (opts.languages || CONF.test.languages).forEach(_langCb(name, fixtures, opts, func));
};

const _langCb = (name, fixtures, opts, func) => lang => {
    const _fixtures = [langFixture(lang)].concat(fixtures);

    scope(`${name} "${lang}"`, _fixtures, opts, () => {
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
