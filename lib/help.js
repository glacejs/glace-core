"use strict";
/**
 * Help description.
 *
 * @module
 */

require("colors");
var U = require("glace-utils");

var plugins = require("./plugins");

var d = U.switchColor();

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
        "testrail": {
            describe: d("Activate testrail reporter."),
            type: "boolean",
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
    })

for (var help of plugins.getModules("pluginHelp")) {
    result = help(result, d);
};

result
    .epilog("Have a green test ;)".green.bold)
    .argv;
