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

var expect = require("chai").expect;
var U = require("glace-utils");

require("./globals");
var ConfigError = require("./error").ConfigError;

var preloads = CONF.preloads;
if (CONF.rootConftest) preloads = preloads.concat(CONF.rootConftest);

for (var preload of preloads) {
    expect(fs.existsSync(preload) && fs.statSync(preload).isFile(),
           `Preloader '${preload}' isn't a file or doesn't exist`)
        .to.be.true;
    require(preload);
};

/* Checks test dirs and load sibling conftests */
for (var testDir of CONF.testDirs) {

    if (!fs.existsSync(testDir)) {
        throw new ConfigError(
            `File or folder with tests "${testDir}" doesn't exist`);
    };

    var siblingConftest = path.resolve(path.dirname(testDir),
                                       "conftest.js");
    if (fs.existsSync(siblingConftest)) require(siblingConftest);
};

/* Starts session */
session(() => {

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

        var loadTests = dir => {
            for (var fileName of fs.readdirSync(dir)) {
                var filePath = path.resolve(dir, fileName);

                if (fileName === "conftest.js") require(filePath);

                if (fileName.startsWith("test") && fileName.endsWith(".js")) {
                    require(filePath);
                };
                if (fs.statSync(filePath).isDirectory()) {
                    loadTests(filePath);
                };
            };
        };
        loadTests(testDir);
    };
});
