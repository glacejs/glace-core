"use strict";

/**
 * Glace tools.
 *
 * @module
 */

var util = require("util");

require("colors");
var _ = require("lodash");
var highlight = require("cli-highlight").highlight;
var U = require("glace-utils");

var d = U.switchColor();

var self = module.exports;

self.listSteps = filter => {
    filter = filter || "";

    global.SS || load();

    var steps = [];
    for (var key in SS) {
        steps.push(key);
    };

    steps = _.union(
        steps,
        Object.getOwnPropertyNames(SS),
        Object.getOwnPropertyNames(Object.getPrototypeOf(SS))
    ).sort()
        .filter(i => i.toLowerCase().includes(filter))
        .filter(i => !i.startsWith("_"))
        .filter(i => /^\w+$/.test(i))
        .filter(i => /^\D/.test(i))
        .filter(i => util.isFunction(SS[i]));

    var i = 0;
    for (var s of steps) {
        console.log(d(`${++i}. ${s}:`));
        console.log(d(`  ${SS[s].toString().split("{")[0]}{...}`));

        var doc = SS[s]
            .__doc__
            .split("\n")
            .map(i => i.trim())
            .filter(i => i)
            .map(i => `   ${i}`)
            .join("\n");

        if (doc) {
            doc = `  /**\n${doc}\n   */`;
            console.log(highlight(doc, { language: "js" }));
        }
    };

    if (steps.length === 0) {
        console.log("No steps are found".yellow);
    };
};

self.listTests = filter => {
    filter = filter || "";

    load();

    var conf = require("./config"),
        testCase, testCases = [];

    for (testCase of conf.testCases) {
        if (testCase.name.toLowerCase().includes(filter)) {
            testCases.push(testCase);
        }
    }

    var i = 0;
    for (testCase of testCases) {
        console.log(d(`${++i}. ${testCase.name}`));
    };

    if (testCases.length === 0) {
        console.log("No tests are found".yellow);
    };
};

self.listFixtures = filter => {
    filter = filter || "";

    load();

    var fx, fixtures = [];
    for (fx in global) {
        if (fx.startsWith("fx") && fx.includes(filter)) {
            fixtures.push(fx);
        }
    }

    var i = 0;
    for (fx of fixtures) {
        console.log(d(`${++i}. ${fx}`));

        var doc = global[fx]
            .__doc__
            .split("\n")
            .map(i => i.trim())
            .filter(i => i)
            .map(i => `   ${i}`)
            .join("\n");

        if (doc) {
            doc = `  /**\n${doc}\n   */`;
            console.log(highlight(doc, { language: "js" }));
        }
    };

    if (fixtures.length === 0) {
        console.log("No fixtures are found".yellow);
    };
};

var load = () => {
    global.before = () => {};
    global.after = () => {};
    global.beforeEach = () => {};
    global.afterEach = () => {};
    global.it = () => {};
    global.describe = (name, cb) => {
        cb.call({
            retries: () => {},
            timeout: () => {},
        });
    };

    require("./globals");
    require("./loader");
};
