"use strict";

/**
 * Glace tools.
 *
 * @module
 */

var util = require("util");

require("colors");
var _ = require("lodash");
var expect = require("chai").expect;
var highlight = require("cli-highlight").highlight;
var natural = require("natural");
var Testrail = require("testrail-api");
var U = require("glace-utils");

var d = U.switchColor();
var self = module.exports;

var classifier = new natural.BayesClassifier();
classifier.isTrained = false;

var all_steps = [];
all_steps.isFilled = false;

self.listSteps = (filter, namesOnly) => {
    namesOnly = namesOnly || false;

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

    var filtered_steps = [];

    for (var s of steps) {
        if (all_steps.isFilled && !filter) break;

        var func = SS[s];

        if (!util.isFunction(func)) continue;

        var doc = getDoc(func);

        var tmp = {
            name: s,
            description: `  ${func.toString().split("{")[0]}{...}`,
            doc: doc,
        };

        if (!all_steps.isFilled) all_steps.push(tmp);

        if (doc && !classifier.isTrained) {
            classifier.addDocument(doc, s);
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
        classifier.isTrained = true;
    }

    if (filter && !namesOnly) {
        filtered_steps = getRelevant(
            all_steps, filtered_steps,
            classifier.getClassifications(filter));
    }

    var i = 0;
    for (s of (filter ? filtered_steps : all_steps)) {
        console.log(d(`${++i}. ${s.name}:`));
        console.log(d(s.description));
        if (s.doc) console.log(highlight(s.doc, { language: "js" }));
    }

    if (i === 0) {
        console.log("No steps are found".yellow);
    };
};

self.listTests = filter => {
    load();

    var conf = require("./config");

    var i = 0;
    for (var testCase of conf.testCases) {
        if (!U.textContains(testCase.name, filter)) continue;
        console.log(d(`${++i}. ${testCase.name}`));
    };

    if (i === 0) {
        console.log("No tests are found".yellow);
    };
};

self.checkTestrail = cb => {
    var noErrors = true;
    var conf = require("./config");

    for (var opt in conf.testrail) {
        expect(conf.testrail[opt],
            `TestRail option '${opt}' isn't specified in config`)
            .to.exist;
    }

    load();

    var testrail = new Testrail({
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

            var t;
            var testrailNames = [], testrailDups = [];

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
                console.log("TestRail duplicated cases:".magenta);
                for (t of testrailDups) {
                    console.log(`  - ${t}`.cyan);
                }
            }

            var testNames = conf.testCase.map(t => t.name);
            var absentTests = _.difference(testrailNames, testNames);
            var absentCases = _.difference(testNames, testrailNames);

            if (absentTests.length) {
                noErrors = false;
                console.log("Not implemented TestRail cases:".magenta);
                for (t of absentTests) {
                    console.log(`  - ${t}`.cyan);
                }
            }

            if (absentCases.length) {
                noErrors = false;
                console.log("Absent TestRail cases:".magenta);
                for (t of absentCases) {
                    console.log(`  - ${t}`.cyan);
                }
            }

            if (noErrors) {
                console.log("TestRail cases correspond current tests");
            }
            cb(noErrors ? 0 : 1);
        }); 
};

self.listFixtures = (filter, namesOnly) => {
    namesOnly = namesOnly || false;

    load();

    var i = 0;
    for (var fx in global) {
        if (!fx.startsWith("fx")) continue;

        var doc = getDoc(global[fx]);

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

var getRelevant = (all, filtered, classified) => {
    if (classified.map(i => i.value).reduce((j, i) => j === i ? j : NaN)) {
        return filtered;
    }

    classified = classified.slice(0, 3);

    var result = [];

    for (var cls of classified) {
        result.push(getStep(all, cls.label));
    };

    for (var f of filtered) {
        if (getStep(result, f.name)) continue;
        result.push(f);
    };

    return result.reverse();
};

var getStep = (bucket, name) => {
    for (var b of bucket) {
        if (b.name === name) return b;
    }
    return null;
};

var getDoc = func => {
    var doc = func
        .__doc__
        .split("\n")
        .map(i => i.trim())
        .filter(i => i)
        .map(i => `   ${i}`)
        .join("\n");
    if (!doc) return doc;
    return `  /**\n${doc}\n   */`;
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
