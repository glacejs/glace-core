"use strict";
/**
 * Makes tests root session.
 *
 * - runner loads root `conftest.js` if it is located on one level with
 *   each of `CONF.testDirs`;
 * - if each of `CONF.testDirs` is file with tests, runner loads and executes it;
 * - if each of `CONF.testDirs` is folder runner loads files inside recursive if
 *   file name starts with `test` and ends with `.js`;
 * - inside each subfolder of each of `CONF.testDirs` runner loads `conftest.js`
 *   file if it is present;
 *
 * @module
 */

var fs = require("fs");
var path = require("path")

var _ = require("lodash");
var expect = require("chai").expect;
var U = require("glace-utils");

require("./globals");
var ConfigError = require("./error").ConfigError;

/**
 * Loads special `preloads` files before main conftests and test files.
 *
 * Preloads are specified in `CONF.preloads` array. It may be managed only
 * programmatically and needs as extension point to load some custom files
 * before tests.
 *
 * After preloads it loads root (the mainest) conftest file, which may be set
 * via CLI.
 */
var preloads = () => {
    var pre = _.clone(CONF.preloads);

    if (CONF.rootConftest && !pre.includes(CONF.rootConftest)) {
        pre.push(CONF.rootConftest);
    };

    for (var preload of pre) {
        expect(
            fs.existsSync(preload) && fs.statSync(preload).isFile(),
            `Preloader '${preload}' isn't a file or doesn't exist`
        ).to.be.true;
        require(preload);
    };
};

/**
 * Main conftests are loaded before tests session creation and may used for
 * objects management, for example to created custom instance of global `SS`.
 *
 * Main conftest is `conftest.js` file which is located on one hierarchy level
 * with each specified tests folder or file.
 */
var mainConftests = () => {
    for (var testDir of CONF.testDirs) {

        if (!fs.existsSync(testDir)) {
            throw new ConfigError(
                `Tests file or folder '${testDir}' doesn't exist`);
        };

        var siblingConftest = path.resolve(path.dirname(testDir),
                                           "conftest.js");
        if (fs.existsSync(siblingConftest)) {
            require(siblingConftest);
        };
    };
};

/**
 * Callback to create tests session.
 *
 * It kills some processes before all if they are specified.
 */
var sessFunc = () => {

    if (CONF.killProcs) {
        before(async () => {
            for (var procName of CONF.killProcs) {
                await U.killProcs(procName);
            };
        });
    };

    for (var testDir of CONF.testDirs) {
        if (!fs.statSync(testDir).isDirectory()) {
            require(testDir);
            continue;
        };
        loadTests(testDir);
    };
};

/**
 * Loads test files recursively. Test file name should start with `test` and
 * end with `.js`.
 *
 * @function
 * @arg {string} dir - Folder with test files.
 */
var loadTests = dir => {
    for (var fileName of fs.readdirSync(dir)) {

        var filePath = path.resolve(dir, fileName);
        var fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            loadTests(filePath);
        };

        if (fileStat.isFile()) {
            if (fileName === "conftest.js") require(filePath);

            if (fileName.startsWith("test") && fileName.endsWith(".js")) {
                require(filePath);
            };
        };
    };
};

/* Starts session */
preloads();
mainConftests();
session(sessFunc);
