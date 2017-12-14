"use strict";
/**
 * Gulp tasks.
 *
 * @module
 */

require("colors");
var gulp = require("gulp");
var clean = require("gulp-clean");
var spawn = require("cross-spawn");

gulp.task("rm-docs", () => {
    gulp.src("docs", {read: false}).pipe(clean());
});

gulp.task("mk-docs", () => {
    spawn.sync("jsdoc", [ "-c", "jsdoc.json", "-d", "docs" ], { stdio: "inherit" });
});

gulp.task("test-basic", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/e2e/testBasic.js",
               ],
               { stdio: "inherit" });
});

gulp.task("test-retry", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/e2e/testRetry.js",
                   "--retry", 2,
               ],
               { stdio: "inherit" });
});

gulp.task("test-chunk-retry", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/e2e/testRetry.js",
                   "--chunk-retry", 2,
               ],
               { stdio: "inherit" });
});

gulp.task("test-own-app", () => {
    spawn.sync("./tests/e2e/ownApp",
               [
                   "tests/e2e/testBasic.js",
               ],
               { stdio: "inherit" });
});

gulp.task("test-suppress-uncaught", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/e2e/testUncaughtExceptions.js",
               ],
               { stdio: "inherit" });
    console.log("Uncaught exceptions were suppressed and logged.".white.bold.bgRed);
});

gulp.task("test-fail-on-uncaught", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/e2e/testUncaughtExceptions.js",
                   "--uncaught", "fail",
               ],
               { stdio: "inherit" });
    console.log("Test was failed on uncaught.".white.bold.bgRed);
});

gulp.task("test-mocha-uncaught", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/e2e/testUncaughtExceptions.js",
                   "--uncaught", "mocha",
               ],
               { stdio: "inherit" });
    console.log("Test queue is broken due to mocha uncaught processing.".white.bold.bgRed);
});

gulp.task("test-timer-steps", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/e2e/testTimerSteps.js",
               ],
               { stdio: "inherit" });
});

gulp.task("test-custom-reporter", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/e2e/testCustomReporter.js",
               ],
               { stdio: "inherit" });
});

gulp.task("test-all", [
    "test-basic",
    "test-retry",
    "test-chunk-retry",
    "test-own-app",
    "test-suppress-uncaught",
    "test-fail-on-uncaught",
    "test-mocha-uncaught",
    "test-timer-steps",
    "test-custom-reporter",
], () => {
});

gulp.task("test-unit", () => {

    var res = spawn.sync(
        "./bin/glace",
        [
            "tests/unit",
        ],
        { stdio: "inherit" });

    if (res.error) {
        console.log(res.error);
        process.exit(1);
    };
    if (res.status) {
        process.exit(res.status);
    };
});
