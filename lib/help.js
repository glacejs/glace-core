"use strict";
/**
 * Help description.
 *
 * @function
 * @name help
 * @arg {function} d - Function to process option description.
 * @arg {function} cb - Callback to expand default help.
 */

require("colors");
var U = require("glace-utils");

var plugins = require("./plugins");

module.exports = (d, cb) => {

    d = d || U.switchColor();
    cb = cb || (o => o);

    var result = U.help(d)
        .usage("\nglace [options] [sequence-of-test-files-or-folders]".white.bold)
        .options({
            /* configuration */
            "user-config [path]": {
                describe: d("Path to JS file with configuration which will be",
                    "merged with override default configuration.",
                    "Default is 'cwd/config.js' (if it exists)."),
                type: "string",
                group: "Core:",
            },
            "session-name [name]": {
                describe: d("Tests run session name.",
                    "Default value includes word 'session' and datetime."),
                type: "string",
                group: "Core:",
            },
            "grep <pattern>": {
                alias: "g",
                describe: d("Filter tests by part of name (powered by mocha)."),
                type: "string",
                group: "Core:",
            },
            "include <sequence>": {
                describe: d("Sequence of test name parts separated by ' | '",
                    "in order to choose tests for run. Or path to json file",
                    "with test names and params."),
                type: "string",
                group: "Core:",
            },
            "exclude <sequence>": {
                describe: d("Sequence of test name parts separated by ' | '",
                    "in order to exclude tests from run. Or path to json file",
                    "with test names."),
                type: "string",
                group: "Core:",
            },
            "precise-match": {
                describe: d("Precise tests inclusion or exclusion (not substring pattern)."),
                type: "boolean",
                group: "Core:",
            },
            "report-dir [path]": {
                describe: d("Path to report folder. Default is 'cwd/report'."),
                type: "string",
                group: "Core:",
            },
            "dont-clear-report": {
                describe: d("Don't clear previous report on tests run."),
                type: "boolean",
                group: "Core:",
            },
            "dont-check-names": {
                describe: d("Don't check test names uniqueness",
                    "(usually useful in unit testing)."),
                type: "boolean",
                group: "Core:",
            },
            "failed-tests-path [path]": {
                describe: d("Path to save failed tests in JSON format.",
                    "Default is 'cwd/report/failed-tests.json'."),
                type: "string",
                group: "Core:",
            },
            "root-conftest <path>": {
                describe: d("Path to root conftest.js which will be loaded",
                    "before all."),
                type: "string",
                group: "Core:",
            },
            "languages <sequence>": {
                describe: d("List of tested languages separated with comma."),
                type: "string",
                group: "Core:",
            },
            "retry [times]": {
                describe: d("Number of times to retry failed test.",
                    "Default is 0."),
                type: "number",
                group: "Core:",
            },
            "chunk-retry [times]": {
                describe: d("Number of times to retry failed chunk.",
                    "Default is 0."),
                type: "number",
                group: "Core:",
            },
            "chunk-timeout [sec]": {
                describe: d("Time to execute chunk or hook, sec.",
                    "Default is 180."),
                type: "number",
                group: "Core:",
            },
            "uncaught [type]": {
                describe: d("Strategy to process uncaught exceptions.",
                    "Default value is 'log'. See details in",
                    "https://glacejs.github.io/glace-core"),
                type: "string",
                choices: [ "log", "fail", "mocha" ],
                group: "Core:",
            },
            "kill-procs <sequence>": {
                describe: d("List of process names separated with comma,",
                    "which will be killed before tests run."),
                type: "string",
                group: "Core:",
            },
            "debug-on-fail": {
                describe: d("Enter to interactive debug mode on step failure.",
                    "Incompatible with '--slaves' option."),
                type: "boolean",
                group: "Core:",
            },
            "exit-on-fail": {
                describe: d("Finish test run on first failure."),
                type: "boolean",
                group: "Core:",
            },
            "dots": {
                describe: d("Print dots instead of test & chunk names."),
                type: "boolean",
                group: "Core:",
            },
            "errors-now": {
                describe: d("Print error message immediately when it happened."),
                type: "boolean",
                group: "Core:",
            },
            "deep-errors": {
                describe: d("Print deep objects structure in error message."),
                type: "boolean",
                group: "Core:",
            },
            "interactive": {
                describe: d("Launch interactive mode to execute steps",
                    "manually in terminal. Incompatible with '--slaves' option."),
                alias: "i",
                type: "boolean",
                group: "Core:",
            },
            "slaves <number|auto>": {
                describe: d("Split tests by slaves and execute them in",
                    "separated processes in parallel."),
                type: "string",
                group: "Core:",
            },
            /* plugins */
            "list-plugins": {
                describe: d("List plugins end exit."),
                type: "boolean",
                group: "Plugins:",
            },
            "plugins-dir [path]": {
                describe: d("Path to custom plugins folder. By default it searches",
                    "plugins inside folder, where 'glace-core' is installed."),
                type: "string",
                group: "Plugins:",
            },
            "disable-default-plugins": {
                describe: d("Disable default plugins."),
                type: "boolean",
                group: "Plugins:",
            },
            /* xunit */
            "xunit": {
                describe: d("Activate xUnit reporter."),
                type: "boolean",
                group: "xUnit:",
            },
            "xunit-path [path]": {
                describe: d("Path to xUnit report. Default is 'cwd/report/xunit.xml'."),
                type: "string",
                group: "xUnit:",
            },
            "xunit-suite-name [name]": {
                describe: d("Tests suite name in xUnit report.",
                    "By default it's the same as session name."),
                type: "string",
                group: "xUnit:",
            },
            /* allure */
            "allure": {
                describe: d("Activate Allure reporter."),
                type: "boolean",
                group: "Allure:",
            },
            "allure-dir [path]": {
                describe: d("Path to allure report folder. Default is 'cwd/report/allure'."),
                type: "string",
                group: "Allure:",
            },
            /* testrail */
            "testrail": {
                describe: d("Activate TestRail reporter."),
                type: "boolean",
                group: "TestRail:",
            },
            "testrail-host <host>": {
                describe: d("TestRail host."),
                type: "string",
                group: "TestRail:",
            },
            "testrail-user <user>": {
                describe: d("TestRail username or email."),
                type: "string",
                group: "TestRail:",
            },
            "testrail-token <token>": {
                describe: d("TestRail token."),
                type: "string",
                group: "TestRail:",
            },
            "testrail-project-id <id>": {
                describe: d("TestRail project id."),
                type: "string",
                group: "TestRail:",
            },
            "testrail-suite-id <id>": {
                describe: d("TestRail suite id."),
                type: "string",
                group: "TestRail:",
            },
            "testrail-run-name <name>": {
                describe: d("TestRail run name."),
                type: "string",
                group: "TestRail:",
            },
            "testrail-run-desc <description>": {
                describe: d("TestRail run description."),
                type: "string",
                group: "TestRail:",
            },
            /* tools */
            "testrail-check": {
                describe: d("Check TestRail cases consistency with",
                    "implemented tests."),
                type: "boolean",
                group: "Tools:",
            },
            "list-steps [filter]": {
                describe: d("List available steps and exit."),
                group: "Tools:",
            },
            "list-tests [filter]": {
                describe: d("List collected tests and exit."),
                group: "Tools:",
            },
            "list-fixtures [filter]": {
                describe: d("List available fixtures and exit."),
                group: "Tools:",
            },
        });

    for (var help of plugins.getModules("pluginHelp")) {
        result = help(result, d);
    }
    result = cb(result);
    result.epilog("Have a green test ;)".green.bold).argv;
};
