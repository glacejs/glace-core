"use strict";

/**
 * Glace tools.
 *
 * @module
 */

const util = require("util");

require("colors");
const _ = require("lodash");
const expect = require("chai").expect;
const highlight = require("cli-highlight").highlight;
const Testrail = require("testrail-api");
const U = require("glace-utils");

const classifier = require("./classifier")();
const plugins = require("./plugins");

const d = U.switchColor();
const self = module.exports;

const all_steps = [];
all_steps.isFilled = false;

self.listSteps = (filter, namesOnly) => {
    namesOnly = namesOnly || false;

    global.$ || global.$$ || global.SS || load();

    let steps = [];
    for (const key in $) {
        steps.push(key);
    };

    steps = _.union(
        steps,
        Object.getOwnPropertyNames($),
        Object.getOwnPropertyNames(Object.getPrototypeOf($))
    ).sort()
        .filter(i => !i.startsWith("_"))
        .filter(i => /^\w+$/.test(i))
        .filter(i => /^\D/.test(i));

    let filtered_steps = [];

    for (const s of steps) {
        if (all_steps.isFilled && !filter) break;

        const func = $[s];

        if (!util.isFunction(func)) continue;

        const doc = getDoc(func);

        const tmp = {
            name: s,
            description: `  ${func_desc(func)}`,
            doc: doc,
        };

        if (!all_steps.isFilled) all_steps.push(tmp);

        if (doc && !classifier.isTrained) {
            classifier.learn(doc, s);
        }

        if (namesOnly) {
            if (!U.textContains(s, filter)) continue;
        } else {
            if (!(U.textContains(s, filter) || U.textContains(doc, filter))) continue;
        }

        filtered_steps.push(tmp);
    };
    all_steps.isFilled = true;

    if (!classifier.isTrained) {
        classifier.train();
    }

    if (filter && !namesOnly) {
        filtered_steps = getRelevant(
            all_steps, filtered_steps,
            classifier.getClassifications(filter));
    }

    let i = 0;
    for (const s of (filter ? filtered_steps : all_steps)) {
        console.log(d(`${++i}. ${s.name}:`));
        console.log(d(s.description));
        if (s.doc) console.log(highlight(s.doc, { language: "js" }));
    }

    if (i === 0) {
        console.log("No steps are found".yellow);
    };
};

/**
 * Print list of implemented test cases.
 *
 * <img src="./list_tests.gif" title="listTests example" />
 *
 * @memberOf module:tools
 * @name listTests
 * @function
 * @arg {string} filter - String chunk to filter test cases.
 */
self.listTests = filter => {
    load();

    const conf = require("./config");

    let i = 0;
    for (const testCase of conf.test.cases) {
        if (!U.textContains(testCase.name, filter)) continue;
        console.log(d(`${++i}. ${testCase.name}`));
    };

    if (i === 0) {
        console.log("No tests are found".yellow);
    };
};

/**
 * Print list of available plugins.
 *
 * <img src="./list_plugins.gif" title="listPlugins example" />
 *
 * @memberOf module:tools
 * @name listPlugins
 * @function
 */
self.listPlugins = () => {
    const pluginsList = plugins.get();
    if (_.isEmpty(pluginsList)) {
        console.log("No plugins are detected".yellow);
    } else {
        for (const plugin of pluginsList) {
            console.log(plugin.name.yellow, plugin.path.white);
        }
    }
};

self.checkTestrail = cb => {
    let noErrors = true;
    const conf = require("./config");

    for (const opt in conf.testrail) {
        expect(conf.testrail[opt],
            `TestRail option '${opt}' isn't specified in config`)
            .to.exist;
    }

    load();

    console.log("TestRail connecting...".yellow);
    const testrail = new Testrail({
        host: conf.testrail.host,
        user: conf.testrail.user,
        password: conf.testrail.token });

    testrail.getCases(
        conf.testrail.projectId,
        { suite_id: conf.testrail.suiteId },
        (err, response, cases) => {

            if (err) {
                console.log(err);
                cb(1);
                return;
            }

            let t;
            let testrailNames = [], testrailDups = [];

            cases.forEach(t => {
                if (testrailNames.includes(t.title)) {
                    testrailDups.push(t.title);
                } else {
                    testrailNames.push(t.title);
                }
            });

            testrailDups = _.uniq(testrailDups);

            if (testrailDups.length) {
                noErrors = false;
                console.log("\nTestRail duplicated cases:".magenta.bold);
                for (t of testrailDups) {
                    console.log(`  - ${t}`.cyan.bold);
                }
            }

            const testNames = conf.test.cases.map(t => t.name);
            const absentTests = _.difference(testrailNames, testNames);
            const absentCases = _.difference(testNames, testrailNames);

            if (absentTests.length) {
                noErrors = false;
                console.log("\nNot implemented TestRail cases:".magenta.bold);
                for (t of absentTests) {
                    console.log(`  - ${t}`.cyan.bold);
                }
            }

            if (absentCases.length) {
                noErrors = false;
                console.log("\nAbsent TestRail cases:".magenta.bold);
                for (t of absentCases) {
                    console.log(`  - ${t}`.cyan.bold);
                }
            }

            if (noErrors) {
                console.log("TestRail cases correspond current tests".green.bold);
            }
            console.log(
                "\nTestRail suite is",
                `${conf.testrail.host}/index.php?/suites/view/${conf.testrail.suiteId}`.yellow);
            cb(noErrors ? 0 : 1);
        }); 
};

self.listFixtures = (filter, namesOnly) => {
    namesOnly = namesOnly || false;

    load();

    let i = 0;
    for (const fx in global) {
        if (!fx.startsWith("fx")) continue;

        const doc = getDoc(global[fx]);

        if (namesOnly) {
            if (!U.textContains(fx, filter)) continue;
        } else {
            if (!(U.textContains(fx, filter) || U.textContains(doc, filter))) continue;
        }

        console.log(d(`${++i}. ${fx}`));

        if (doc) {
            console.log(highlight(doc, { language: "js" }));
        }
    };

    if (i === 0) {
        console.log("No fixtures are found".yellow);
    };
};

const getRelevant = (all, filtered, classified) => {
    if (classified.map(i => i.value).reduce((j, i) => j === i ? j : NaN)) {
        return filtered;
    }

    classified = classified.slice(0, 3);

    const result = [];

    for (const cls of classified) {
        result.push(getStep(all, cls.label));
    };

    for (const f of filtered) {
        if (getStep(result, f.name)) continue;
        result.push(f);
    };

    return result.reverse();
};

const getStep = (bucket, name) => {
    for (const b of bucket) {
        if (b.name === name) return b;
    }
    return null;
};

const getDoc = func => {
    const doc = func
        .__doc__
        .split("\n")
        .map(i => i.trim())
        .filter(i => i)
        .map(i => `   ${i}`)
        .join("\n");
    if (!doc) return doc;
    return `  /**\n${doc}\n   */`;
};

const load = () => {

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

const func_desc = func => {
    return func.toString().replace("\n", " ").split(/\) *\{/)[0] + ") {...}";
};

module.exports.load = load;
