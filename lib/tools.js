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
        .filter(i => !i.startsWith("_"))
        .filter(i => /^\w+$/.test(i))
        .filter(i => /^\D/.test(i));

    var i = 0;
    for (var s of steps) {
        var func = SS[s];

        if (!util.isFunction(func)) continue;

        var doc = getDoc(func);
        if (!(s.toLowerCase().includes(filter) ||
            (doc && doc.toLowerCase().includes(filter)))) continue;

        console.log(d(`${++i}. ${s}:`));
        console.log(d(`  ${func.toString().split("{")[0]}{...}`));

        if (doc) {
            doc = `  /**\n${doc}\n   */`;
            console.log(highlight(doc, { language: "js" }));
        }
    };

    if (i === 0) {
        console.log("No steps are found".yellow);
    };
};

self.listTests = filter => {
    filter = filter || "";

    load();

    var conf = require("./config");

    var i = 0;
    for (var testCase of conf.testCases) {
        if (!testCase.name.toLowerCase().includes(filter)) continue;

        console.log(d(`${++i}. ${testCase.name}`));
    };

    if (i === 0) {
        console.log("No tests are found".yellow);
    };
};

self.listFixtures = filter => {
    filter = filter || "";

    load();

    var i = 0;
    for (var fx in global) {
        if (!fx.startsWith("fx")) continue;

        var doc = getDoc(global[fx]);

        if (!(fx.toLowerCase().includes(filter) ||
            (doc && doc.toLowerCase().includes(filter)))) continue;

        console.log(d(`${++i}. ${fx}`));

        if (doc) {
            doc = `  /**\n${doc}\n   */`;
            console.log(highlight(doc, { language: "js" }));
        }
    };

    if (i === 0) {
        console.log("No fixtures are found".yellow);
    };
};

var getDoc = func => {
    return func
        .__doc__
        .split("\n")
        .map(i => i.trim())
        .filter(i => i)
        .map(i => `   ${i}`)
        .join("\n");
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
