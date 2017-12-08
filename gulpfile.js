"use strict";
/**
 * Gulp tasks.
 *
 * @module
 */

var gulp = require("gulp");
var clean = require("gulp-clean");
var spawn = require("cross-spawn");

gulp.task("rm-docs", () => {
    gulp.src("docs", {read: false}).pipe(clean());
});

gulp.task("mk-docs", [ "rm-docs" ], () => {
    spawn.sync("jsdoc", [ "-c", "jsdoc.json", "-d", "docs" ], { stdio: "inherit" });
});

gulp.task("test-basic", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/integration/testBasic.js",
               ],
               { stdio: "inherit" });
});

gulp.task("test-retry", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/integration/testRetry.js",
                   "--retry", 2,
               ],
               { stdio: "inherit" });
});

gulp.task("test-chunk-retry", () => {
    spawn.sync("./bin/glace",
               [
                   "tests/integration/testRetry.js",
                   "--chunk-retry", 2,
               ],
               { stdio: "inherit" });
});

gulp.task("test-all", [
    "test-basic",
    "test-retry",
    "test-chunk-retry",
], () => {
})