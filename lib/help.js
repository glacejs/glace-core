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
        .usage("\nglace [options] [test-files-or-folders]".white.bold)
        .options({
            /* configuration */
            "user-config": {
                describe: d("Path to JS file with configuration which will be",
                            "merged with override default configuration.",
                            "Default is 'cwd/config.js' (if it exists)."),
                type: "string",
                group: "Core:",
            },
            "grep": {
                alias: "g",
                describe: d("Filter tests by name or name chunk."),
                type: "string",
                group: "Core:",
            },
            "root-conftest": {
                describe: d("Path to root conftest.js which will be loaded",
                            "before all."),
                type: "string",
                group: "Core:",
            },
            "languages": {
                describe: d("List of tested languages separated with comma."),
                type: "string",
                group: "Core:",
            },
            "retry": {
                describe: d("Number of times to retry failed test.",
                            "Default is 0."),
                type: "number",
                group: "Core:",
            },
            "chunk-retry": {
                describe: d("Number of times to retry failed chunk.",
                            "Default is 0."),
                type: "number",
                group: "Core:",
            },
            "uncaught": {
                describe: d("Strategy to process of uncaught exceptions.",
                            "Supported values are 'log', 'fail', 'mocha'.",
                            "Default value is 'log'."),
                type: "string",
                group: "Core:",
            },
            /* plugins */
            "plugins": {
                describe: d("Flag to show plugins only."),
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
                describe: d("Flag to disable default plugins."),
                type: "boolean",
                group: "Plugins:",
            },
            /* testrail */
            "testrail": {
                describe: d("Flag to activate testrail reporter."),
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
                describe: d("TestRail project id"),
                type: "string",
                group: "TestRail:",
            },
            "testrail-suite-id <id>": {
                describe: d("TestRail suite id"),
                type: "string",
                group: "TestRail:",
            },
            "testrail-run-name <name>": {
                describe: d("TestRail run name"),
                type: "string",
                group: "TestRail:",
            },
            "testrail-run-desc <description>": {
                describe: d("TestRail run description."),
                type: "string",
                group: "TestRail:",
            },
        })
    
    for (var help of plugins.getModules("pluginHelp")) {
        result = help(result, d);
    };
    result = cb(result);
    result.epilog("Have a green test ;)".green.bold);
    
    return result;
};
