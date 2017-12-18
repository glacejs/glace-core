"use strict";
/**
 * Configures `GlaceJS` before tests run.
 *
 * @namespace GlaceConfig
 * @prop {?TestCase} curTestCase - Currently executed test.
 * @prop {TestCase[]} testCases - List of executed tests.
 * @prop {string[]} preloads - List of module paths which will be loaded before
 *  test run.
 * @prop {string[]} [testDirs=cwd/tests] - List of folder or file paths with tests.
 * @prop {string} [reportsDir=cwd/reports] - Path to reports folder.
 * @prop {?boolean} [isRunPassed] - Whether test run is passed.
 * @prop {string[]} [languages=[]] - List of tested languages.
 * @prop {boolean} [clearReport=true] - Clear report before test run.
 * @prop {string} [uncaught=log] - Strategy to process uncaught exceptions.
 * @prop {string} [rootConftest] - Path to root conftest.js.
 * @prop {number} [testRetries=0] - Number of test retries on test failure.
 * @prop {number} [chunkRetries=0] - Number of chunk retries on chunk failure.
 * @prop {string} grep - Test name or name chunk to filter tests.
 * @prop {string} pluginsDir - Path to custom plugins folder.
 * @prop {string} [sessionName] - Name of tests session.
 * @prop {number} [sessionId] - ID of tests session.
 * @prop {object} testrail - TestRail reporter configuration.
 * @prop {boolean} [testrail.use=false] - Activate TestRail reporter.
 * @prop {?string} [testrail.host=null] - TestRail host.
 * @prop {?string} [testrail.user=null] - TestRail user.
 * @prop {?string} [testrail.token=null] - TestRail token.
 * @prop {?number} [testrail.projectId=null] - TestRail project ID.
 * @prop {?number} [testrail.suiteId=null] - TestRail suite ID.
 * @prop {?string} [testrail.runName=null] - TestRail run name.
 * @prop {?string} [testrail.runDescription=null] - TestRail run description.
 */

var fs = require("fs");
var path = require("path");

require("colors");
var _ = require("lodash");
var expect = require("chai").expect;

var U = require("glace-utils");
var LOG = U.logger;

var plugins = require("./plugins");

var config = U.config;
var args = config.args;

if (args.plugins) {
    var noPlugins = true;
    for (var plugin of plugins.get()) {
        noPlugins = false;
        console.log(plugin.name.yellow, plugin.path.white);
    };
    if (noPlugins) console.log("No plugins are detected".yellow);
    process.exit();
};

/* Set up test folders */

if (args._ && args._.length) {
    var targets = args._;
} else if (args.targets && args.targets.length) {
    var targets = args.targets;
} else {
    var targets = ["tests"];
};

var config = _.merge(config, {
    curTestCase: null,
    preloads: [],
    timeouts: {
    },
    testCases: [],
    testDirs: targets.map(target => path.resolve(U.cwd, target)),
    reportsDir: path.resolve(U.cwd, (args.report || "reports")),
    isRunPassed: null,
    languages: []
});

/* Use CLI arguments */
config.timeouts.chunk = (args.chunkTimeout || 180) * 1000;
config.clearReport = !args.dontClearReport;
config.uncaught = (args.uncaught || "log").toLowerCase();
expect([ "log", "fail", "mocha" ],
       "Invalid `--uncaught` value").include(config.uncaught);
config.rootConftest = args.rootConftest;
config.testRetries = args.retry || 0;
config.chunkRetries = args.chunkRetry || 0;
expect(config.testRetries).gte(0);
config.grep = args.g || args.grep;
config.pluginsDir = args.pluginsDir;
var date = new Date();
config.sessionName = U.defVal(args.sessionName, `Session ${date.toLocaleString()}`);
config.sessionId = date.getTime();

config.xunit = U.defVal(config.xunit, {});
config.xunit.use = U.defVal(args.xunit, false);
config.xunit.path = U.defVal(args.xunitPath, path.resolve(U.cwd, "xunit.xml"));
config.xunit.suiteName = U.defVal(args.xunitSuiteName, config.sessionName);

config.testrail = U.defVal(config.testrail, {});
config.testrail.use = U.defVal(args.testrail, false);
config.testrail.host = U.defVal(args.testrailHost);
config.testrail.user = U.defVal(args.testrailUser);
config.testrail.token = U.defVal(args.testrailToken);
config.testrail.projectId = U.defVal(args.testrailProjectId);
config.testrail.suiteId = U.defVal(args.testrailSuiteId);
config.testrail.runName = U.defVal(args.testrailRunName);
config.testrail.runDescription = U.defVal(args.testrailRunDesc);

if (args.languages) {
    config.languages = _.filter(_.map(args.languages.split(','),
                                      el => el.trim()));
};

/* Load plugins configs */
plugins.getModules("config");

/* Merge user config */

var userConfig = {};
var userConfigPath = path.resolve(U.cwd, (args.userConfig || "config.js"));

if (fs.existsSync(userConfigPath)) {
    userConfig = require(userConfigPath);
};
_.assign(config, userConfig);

module.exports = config;
