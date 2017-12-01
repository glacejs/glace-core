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

/* Set up default config */

/**
 * Contains `GlaceJS` main configuration.
 *
 * @namespace GlaceConfig
 * @property {?TestCase} [curTestCase=null] - Pointer to current test case object.
 *  On tests run it points to `null`. The pointer changes when a test launches.
 * @property {TestCase[]} [testCases=[]] - List of all executed test cases. It
 *  populates when a test launches. It is used to store full information about
 *  executed tests and may be used in reporter.
 * @property {string} testDirs - Path to test directories or test modules.
 *  If it contains path to directory, tests will be loaded recursive from it.
 *  By default `GlaceJS` tries to load tests from `tests` folder in current
 *  work directory.
 * @property {string} reportsDir - Path to directory where reports will be put.
 *  By default `GlaceJS` tries to put reports to `reports` folder in current
 *  work directory.
 * @property {object} log - Logger settings.
 * @property {string} log.file - Path to common logger file, which is
 *  `glacejs.log` inside current work directory.
 * @property {string} [log.level=debug] - Common logger level.
 * @property {object} webdriver - Webdriver settings. Corresponds to
 *  `webdriverio` remote settings.
 * @property {boolean} [isWeb=false] - Flag to launch tests in browser.
 * @property {string} appUrl - URL of web application.
 * @property {boolean} [noDriversInstall=true] - Flag to not install selenium
 *  drivers on start.
 * @property {string} [platform=pc] - Platform type where should launch tests.
 *  Permitted values are `pc`, `android`, `ios`.
 * @property {string} browserName - Name of browser where tests will be
 *  executed. Default value depends on platform. `Chrome` for `pc`, `chrome`
 *  for `android`, `safari` for `ios`.
 * @property {number} [testRetries=0] - Number of times to retry a failed test.
 * @property {boolean} [stdoutLog=false] - Flag to print log message in stdout.
 * @property {boolean} [toTestrail=false] - Flag to plug `testrail` reporter.
 * @property {string} [grep] - Filter for test cases.
 * @property {boolean} [suppressUncaught=false] - Suppress uncaught exceptions
 *  processing by mochajs.
 * @property {boolean} [isDesktop=false] - Flag that tests are launched on
 *  desktop.
 * @property {boolean} [isMobile=false] - Flag that tests are launched on
 *  mobile device.
 * @property {boolean} [isAndroid=false] - Flag that tests are launched on
 *  android device.
 * @property {boolean} [isIos=false] - Flag that tests are launched on iOS
 *  device.
 */
var config = module.exports = _.merge(config, {
    curTestCase: null,
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
