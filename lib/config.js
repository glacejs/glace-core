"use strict";
/**
 * Configures `GlaceJS` before tests run.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

require("colors");
var _ = require("lodash");
var expect = require("chai").expect;
var fse = require("fs-extra");

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

var testDirs = targets.map(target => path.resolve(U.cwd, target))

/* Set up reports folder */

var reportsDir = path.resolve(U.cwd, (args.report || "reports"));
if (fs.existsSync(reportsDir)) fse.removeSync(reportsDir);
fse.mkdirsSync(reportsDir);


/**
 * Contains `GlaceJS` main configuration.
 *
 * @namespace GlaceConfig
 */
var config = module.exports = _.merge(config, {
    curTestCase: null,
    preloads: [],
    timeouts: {
        testCase: 180000,
    },
    testCases: [],
    testDirs: testDirs,
    reportsDir: reportsDir,
    isRunPassed: null,
    languages: []
});

/* Use CLI arguments */

config.uncaught = (args.uncaught || "log").toLowerCase();
expect([ "log", "fail", "mocha" ],
       "Invalid `--uncaught` value").include(config.uncaught);
config.rootConftest = args.rootConftest;
config.testRetries = args.retry || 0;
config.chunkRetries = args.chunkRetry || 0;
expect(config.testRetries).gte(0);
config.grep = args.grep;
config.pluginsDir = args.pluginsDir;

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
