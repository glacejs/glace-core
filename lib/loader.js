/* global before session */

"use strict";

/**
 * Makes tests root session.
 *
 * - runner loads root `conftest.js` if it is located on one level with
 *   each of `CONF.test.dirs`;
 * - if each of `CONF.test.dirs` is file with tests, runner loads and executes it;
 * - if each of `CONF.test.dirs` is folder runner loads files inside recursive if
 *   file name starts with `test` and ends with `.js`;
 * - inside each subfolder of each of `CONF.test.dirs` runner loads `conftest.js`
 *   file if it is present;
 *
 * @module
 */

const fs = require("fs");
const path = require("path");

const _ = require("lodash");
const expect = require("chai").expect;
const U = require("glace-utils");

require("./globals");
const CONF = require("./config");
const ConfigError = require("./error").ConfigError;

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
const preloads = () => {
    const pre = _.clone(CONF.session.preloads);

    if (CONF.session.rootConftest && !pre.includes(CONF.session.rootConftest)) {
        pre.push(CONF.session.rootConftest);
    }

    for (const preload of pre) {
        expect(
            fs.existsSync(preload) && fs.statSync(preload).isFile(),
            `Preloader '${preload}' isn't a file or doesn't exist`
        ).to.be.true;
        require(preload);
    }
};

/**
 * Main conftests are loaded before tests session creation and may used for
 * objects management, for example to created custom instance of global `SS`.
 *
 * Main conftest is `conftest.js` file which is located on one hierarchy level
 * with each specified tests folder or file.
 */
const mainConftests = () => {
    for (const testDir of CONF.test.dirs) {

        if (!fs.existsSync(testDir)) {
            throw new ConfigError(
                `Tests file or folder '${testDir}' doesn't exist`);
        }

        const siblingConftest = path.resolve(path.dirname(testDir), "conftest.js");
        if (fs.existsSync(siblingConftest)) {
            require(siblingConftest);
        }
    }
};

/**
 * Callback to create tests session.
 *
 * It kills some processes before all if they are specified.
 */
const sessFunc = () => {

    if (CONF.session.killProcs) {
        before(async () => {
            for (const procName of CONF.session.killProcs) {
                await U.killProcs(procName);
            }
        });
    }

    for (const testDir of CONF.test.dirs) {
        if (!fs.statSync(testDir).isDirectory()) {
            require(testDir);
            continue;
        }
        loadTests(testDir);
    }
};

/**
 * Loads test files recursively. Test file name should start with `test` and
 * end with `.js`.
 *
 * @function
 * @arg {string} dir - Folder with test files.
 */
const loadTests = dir => {
    for (const fileName of fs.readdirSync(dir)) {

        const filePath = path.resolve(dir, fileName);
        const fileStat = fs.statSync(filePath);

        if (fileStat.isDirectory()) {
            loadTests(filePath);
        }

        if (fileStat.isFile()) {
            if (fileName === "conftest.js") require(filePath);

            if (fileName.startsWith("test") && fileName.endsWith(".js")) {
                require(filePath);
            }
        }
    }
};

if (!CONF.__testmode) {
    /* Starts session */
    preloads();
    mainConftests();
    session(sessFunc);
}
