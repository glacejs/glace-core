"use strict";
/**
 * Configures `GlaceJS` before tests run.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var expect = require("chai").expect;
var fse = require("fs-extra");

var U = require("glace-utils");
var LOG = U.logger;

var utils = require("./utils");
/* Load plugins configs */
utils.plugins("config");

var config = U.config;
var args = config.args;

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
    preloads = [],
    timeouts: {
        testCase: 180000,
    },
    testCases: [],
    testDirs: testDirs,
    reportsDir: reportsDir,
    testrail: {
        host: null,
        user: null,
        token: null,
    },
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
config.toTestrail = !!args.testrail;  // default `false`
config.grep = args.grep;

if (args.languages) {
    config.languages = _.filter(_.map(args.languages.split(','),
                                      el => el.trim()));
};

/* Merge user config */

var userConfig = {};
var userConfigPath = path.resolve(U.cwd, (args.config || "config.js"));

if (fs.existsSync(userConfigPath)) {
    userConfig = require(userConfigPath);
};
_.assign(config, userConfig);
