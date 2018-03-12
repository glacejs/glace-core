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
                describe: d("Filter tests by name or name chunk."),
                type: "string",
                group: "Core:",
            },
            "report [path]": {
                describe: d("Path to reports folder. Default is 'cwd/reports'."),
                type: "string",
                group: "Core:",
            },
            "dont-clear-report": {
                describe: d("Don't clear previous report on tests run."),
                type: "boolean",
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
                describe: d("Enter to interactive debug mode on step failure."),
                type: "boolean",
                group: "Core:",
            },
            /* plugins */
            "plugins": {
                describe: d("Show plugins only."),
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
                describe: d("Path to xUnit report. Default is 'cwd/xunit.xml'."),
                type: "string",
                group: "xUnit:",
            },
            "xunit-suite-name [name]": {
                describe: d("Tests suite name in xUnit report.",
                    "By default it's the same as session name."),
                type: "string",
                group: "xUnit:",
            },
            /* testrail */
            "testrail": {
                describe: d("Activate testrail reporter."),
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
            "list-steps [filter]": {
                describe: d("Only list available steps."),
                group: "Tools:",
            },
            "list-tests [filter]": {
                describe: d("Only list collected tests."),
                group: "Tools:",
            },
            "list-fixtures [filter]": {
                describe: d("Only list available fixtures."),
                group: "Tools:",
            },
        });

    for (var help of plugins.getModules("pluginHelp")) {
        result = help(result, d);
    }
    result = cb(result);
    result.epilog("Have a green test ;)".green.bold).argv;
};
