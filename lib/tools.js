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
const CONF = require("./config");
const plugins = require("./plugins");

const d = U.switchColor();

let stepsCache = null;

/**
 * Get list of steps data, where step data is an object with keys:
 * `name` - name of step, `decription` - short details of steps,
 * `doc` - documentation of step.
 *
 * @memberOf module:tools
 * @function
 * @arg {string} [filter] - String chunk to filter steps.
 * @arg {boolean} [namesOnly=false] - Flag to filter by step names only.
 * @return {array<object>}
 */
const listSteps = (filter, namesOnly=false) => {
    if (!stepsCache) {
        stepsCache = getStepsData(getStepNames());
        learnClassifier(stepsCache);
    }
    if (!filter) return stepsCache;
    return filterSteps(stepsCache, filter, namesOnly);
};

/**
 * Print list of steps in stdout.
 *
 * @memberOf module:tools
 * @function
 * @arg {string} [filter] - String chunk to filter steps.
 * @arg {boolean} [namesOnly=false] - Flag to filter by step names only.
 */
const printSteps = (filter, namesOnly=false) => {
    const steps = listSteps(filter, namesOnly);

    if (!steps.length) {
        console.log("No steps are found".yellow);
        return;
    }

    steps.forEach((step, i) => {
        console.log(d(`${i+1}. ${step.name}:`));
        console.log(d(step.description));
        if (step.doc) console.log(highlight(step.doc, { language: "js" }));
    });
};

/**
 * Print list of implemented test cases.
 *
 * <img src="./list_tests.gif" title="listTests example" />
 *
 * @memberOf module:tools
 * @name listTests
 * @function
 * @arg {string} [filter] - String chunk to filter test cases.
 */
const printTests = filter => {
    fakeLoad();

    let cases = CONF.test.cases;
    if (filter) cases = cases.filter(c => U.textContains(c.name, filter));

    if (!cases.length) {
        console.log("No tests are found".yellow);
        return;
    }

    cases.forEach((c, i) => {
        console.log(d(`${i+1}. ${c.name}`));
    });
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
const printPlugins = () => {
    const pluginsList = plugins.get();

    if (!pluginsList.length) {
        console.log("No plugins are detected".yellow);
        return;
    }

    pluginsList.forEach((p, i) => {
        console.log(`${i+1}. ${p.name}`.yellow, p.path);
    });
};

/**
 * Get list of available fixtures.
 *
 * @memberOf module:tools
 * @function
 * @arg {string} [filter] - String chunk to filter fixtures.
 * @arg {boolean} [namesOnly=false] - Flag to filter by fixture names only.
 * @return {array<object>}
 */
const listFixtures = (filter, namesOnly=false) => {
    fakeLoad();
    const fixtures = getFixtures();
    if (!filter) return fixtures;
    return filterFixtures(fixtures, filter, namesOnly);
};

/**
 * Print list of fixtures in stdout.
 *
 * @memberOf module:tools
 * @function
 * @arg {string} [filter] - String chunk to filter fixtures.
 * @arg {boolean} [namesOnly=false] - Flag to filter by fixture names only.
 */
const printFixtures = (filter, namesOnly=false) => {
    const fixtures = listFixtures(filter, namesOnly);

    if (!fixtures.length) {
        console.log("No fixtures are found".yellow);
        return;
    }

    fixtures.forEach((fx, i) => {
        console.log(d(`${i+1}. ${fx.name}`));
        if (fx.doc) console.log(highlight(fx.doc, { language: "js" }));
    });
};

/**
 * Make fake load of tests in order to collect tests, fixtures, steps, etc.
 *
 * @memberOf module:tools
 * @function
 */
const fakeLoad = () => {

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

/**
 * Check testrail cases consistency with implemented tests.
 *
 * @memberOf module:tools
 * @function
 * @arg {function} cb - Callback function.
 */
const checkTestrail = cb => {
    checkTestrailOpts();
    fakeLoad();

    console.log("TestRail connecting...".yellow);

    const testrail = new Testrail({
        host: CONF.testrail.host,
        user: CONF.testrail.user,
        password: CONF.testrail.token });

    checkTestrailCases(testrail, cb);
};

module.exports = {
    checkTestrail,
    fakeLoad,
    listSteps,
    printSteps,
    printTests,
    printPlugins,
    listFixtures,
    printFixtures,
};

/**
 * Check testrail options.
 * @ignore
 */
const checkTestrailOpts = () => {
    for (const opt in CONF.testrail) {
        expect(CONF.testrail[opt],
            `TestRail option '${opt}' isn't specified in config`)
            .to.exist;
    }
};

/**
 * Check testrail missed cases which are implemented.
 * @ignore
 */
const checkTestrailMissed = cases => {
    const testrailNames = cases.map(case_ => case_.title);
    const testNames = CONF.test.cases.map(case_ => case_.name);

    const missed = _.difference(testNames, testrailNames);
    if (!missed.length) return 0;

    console.log("\nMissed TestRail cases:".magenta.bold);
    missed.forEach((title, i) => {
        console.log(`${i+1}. ${title}`.cyan.bold);
    });
    return 1;
};

/**
 * Check testrail cases which are not implemented yet.
 * @ignore
 */
const checkTestrailNotImplemented = cases => {
    const testrailNames = cases.map(case_ => case_.title);
    const testNames = CONF.test.cases.map(case_ => case_.name);

    const notImplemented = _.difference(testrailNames, testNames);
    if (!notImplemented.length) return 0;

    console.log("\nNot implemented TestRail cases:".magenta.bold);
    notImplemented.forEach((title, i) => {
        console.log(`${i+1}. ${title}`.cyan.bold);
    });
    return 1;
};

/**
 * Check testrail duplicated cases.
 * @ignore
 */
const checkTestrailDuplicates = cases => {
    const testrailNames = [];
    let testrailDups = [];

    cases.forEach(case_ => {
        if (testrailNames.includes(case_.title)) {
            testrailDups.push(case_.title);
        } else {
            testrailNames.push(case_.title);
        }
    });

    testrailDups = _.uniq(testrailDups);
    if (!testrailDups.length) return 0;

    console.log("\nTestRail duplicated cases:".magenta.bold);
    testrailDups.forEach((title, i) => {
        console.log(`${i+1}. ${title}`.cyan.bold);
    });
    return 1;
};

/**
 * Check testrail cases.
 * @ignore
 */
const checkTestrailCases = (client, cb) => {
    client.getCases(
        CONF.testrail.projectId,
        { suite_id: CONF.testrail.suiteId },
        (err, response, cases) => {

            if (err) {
                console.log(err);
                cb(1);
                return;
            }

            let errorCode = 0;

            errorCode += checkTestrailDuplicates(cases);
            errorCode += checkTestrailNotImplemented(cases);
            errorCode += checkTestrailMissed(cases);

            if (!errorCode) {
                console.log("TestRail cases correspond current tests".green.bold);
            }
            console.log(
                "\nTestRail suite is",
                `${CONF.testrail.host}/index.php?/suites/view/${CONF.testrail.suiteId}`.yellow);

            cb(errorCode);
        });
};

/**
 * Get fixtures.
 * @ignore
 */
const getFixtures = () => {
    const fixtures = [];

    for (const name in global) {
        if (!name.startsWith("fx")) continue;
        const func = global[name];
        if (!util.isFunction(func)) continue;

        fixtures.push({
            name: name,
            doc: getDoc(func),
        });
    }

    return fixtures;
};

/**
 * Filter fixtures.
 * @ignore
 */
const filterFixtures = (fixtures, filter, namesOnly) => {
    const filtered = [];

    for (const fx of fixtures) {
        if (namesOnly) {
            if (!U.textContains(fx.name, filter)) continue;
        } else {
            if (!U.textContains(fx.name, filter) && !U.textContains(fx.doc, filter)) continue;
        }
        filtered.push(fx);
    }

    return filtered;
};

/**
 * Get list of step names.
 *
 * @ignore
 * @function
 * @return {array<string>}
 */
const getStepNames = () => {
    global.$ || fakeLoad();

    let names = [];
    for (const key in $) {
        names.push(key);
    };

    names = _.union(
        names,
        Object.getOwnPropertyNames($),
        Object.getOwnPropertyNames(Object.getPrototypeOf($))
    ).sort()
        .filter(i => !i.startsWith("_"))
        .filter(i => /^\w+$/.test(i))
        .filter(i => !["constructor"].includes(i))
        .filter(i => /^\D/.test(i));

    return names;
};

/**
 * Get list of step data, where step data is an object with keys:
 * `name` - name of step, `decription` - short details of steps,
 * `doc` - documentation of step.
 *
 * @ignore
 * @function
 * @arg {array<string>} names - List of step names.
 * @return {array<object>} 
 */
const getStepsData = names => {
    const result = [];

    for (const name of names) {
        const func = $[name];
        if (!util.isFunction(func)) continue;

        result.push({
            name: name,
            description: funcDescription(func),
            doc: getDoc(func),
        });
    };

    return result;
};

/**
 * Learn classifier on step names and description.
 * @ignore
 */
const learnClassifier = steps => {
    steps.forEach(step => classifier.learn(step.doc, step.name));
};

/**
 * Filter steps and return relevant result merged with ML predictions.
 * @ignore
 */
const filterSteps = (steps, filter, namesOnly) => {
    let filtered = [];

    for (const step of steps) {
        if (namesOnly) {
            if (!U.textContains(step.name, filter)) continue;
        } else {
            if (!U.textContains(step.name, filter) && !U.textContains(step.doc, filter)) continue;
        }
        filtered.push(step);
    }

    if (!namesOnly) {
        const classified = classifier.getClassifications(filter);
        filtered = getRelevantSteps(steps, filtered, classified);
    }

    return filtered;
};

/**
 * Get relevant steps.
 * @ignore
 */
const getRelevantSteps = (all, filtered, classified) => {
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

/**
 * Get step.
 * @ignore
 */
const getStep = (bucket, name) => {
    for (const b of bucket) {
        if (b.name === name) return b;
    }
    return null;
};

/**
 * Get function description.
 * @ignore
 */
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

/**
 * Get function description.
 * @ignore 
 */
const funcDescription = func => {
    return "  " + func.toString().replace("\n", " ").split(/\) *\{/)[0] + ") {...}";
};
