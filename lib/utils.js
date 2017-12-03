"use strict";
/**
 * Utils.
 *
 * @module 
 */

var fs = require("fs");
var path = require("path");

var expect = require("chai").expect;
var U = require("glace-utils");

var args = U.config.args;
var LOG = U.logger;

var plugins = null;
module.exports.plugins = moduleName => {
    if (!plugins) {
        var pluginPaths = [];

        if (args.pluginsDir) {
            expect(fs.existsSync(args.pluginsDir),
                   `Plugins folder '${args.pluginsDir}' doesn't exist`)
                .to.be.true;

            for (var name of fs.readdirSync(args.pluginsDir)) {
                pluginPaths.push(path.resolve(args.pluginsDir, name));
            };
        } else {

            var root = path.resolve(__dirname, "..", "..");
            for (var name of fs.readdirSync(root)) {
                if (name.startsWith("glace-") &&
                        ![ "glace-js", "glace-core", "glace-utils" ].includes(name)) {
                    pluginPaths.push(path.resolve(root, name));
                };
            };
        };

        plugins = [];
        for (var pluginPath of pluginPaths) {
            try {
                plugins.push(require(pluginPath));
            } catch (e) {
                LOG.warn(`Can't load plugin '${pluginPath}'`);
            };
        };
    };

    var modules = [];
    for (var plugin of plugins) {
        var mod = plugin[moduleName];
        if (mod) modules.push(mod);
    };
    return modules;
};
