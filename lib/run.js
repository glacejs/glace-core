"use strict";
/**
 * Runs tests.
 *
 *  - executes `runner.js` file, which is entry point to load and execute
 *    files with tests
 *  - connects custom reporter to `mochajs`.
 *
 * @function
 * @name run
 * @arg {function} cb - Callback.
 */

var fs = require("fs");
var path = require("path");

var fse = require("fs-extra");
var Mocha = require("mocha");

var CONF = require("./config");
var hacking = require("./hacking");
var tools = require("./tools");

var run = cb => {
    resetReport();

    if (CONF.session.uncaughtException !== "mocha") hacking.suppressMochaUncaught();

    var mocha = new Mocha({ grep: CONF.filter.grep,
        timeout: CONF.test.chunkTimeout,
        retries: CONF.chunkRetries,
        reporter: path.resolve(__dirname, "reporter") });
    mocha.addFile(path.resolve(__dirname, "loader.js"));

    if (cb) {
        _run(mocha, cb);
    } else {
        return new Promise(resolve => _run(mocha, resolve));
    }
};

/**
 * Runs mocha.
 *
 * @ignore
 */
var _run = (mocha, fin) => {
    mocha.run(code => {
        var clampedCode = Math.min(code, 255);
        if (CONF.session.isPassed) clampedCode = 0;
        fin(clampedCode);
    });
};

/**
 * Resets report folder.
 *
 * @ignore
 */
var resetReport = () => {
    if (CONF.report.clear && fs.existsSync(CONF.report.dir)) {
        fse.removeSync(CONF.report.dir);
    }
    fse.mkdirsSync(CONF.report.dir);
};

/**
 * Runs glace framework.
 *
 * @arg {function} cb - Callback.
 */
var glaceRun = cb => {
    if (CONF.tools.stepsList) {
        tools.listSteps(CONF.tools.stepsFilter);
        return cb();
    } else if (CONF.tools.fixturesList) {
        tools.listFixtures(CONF.tools.fixturesFilter);
        return cb();
    } else if (CONF.tools.testsList) {
        tools.listTests(CONF.tools.testsFilter);
        return cb();
    } else if (CONF.tools.checkTestrail) {
        return tools.checkTestrail(cb);
    } else if (CONF.tools.pluginsList) {
        return tools.listPlugins(cb);
    } else {
        return run(cb);
    }
};

module.exports = glaceRun;
