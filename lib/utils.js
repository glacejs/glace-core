"use strict";
/**
 * Utils.
 *
 * @module 
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var expect = require("chai").expect;
var U = require("glace-utils");

var args = U.config.args;
var LOG = U.logger;

var plugins = null;
module.exports.plugins = moduleName => {
    if (!plugins) {

        var pluginPaths = [],
            pluginNames = [];

        if (args.pluginsDir) {
            expect(fs.existsSync(args.pluginsDir),
                   `Plugins folder '${args.pluginsDir}' doesn't exist`)
                .to.be.true;

            for (var fileName of fs.readdirSync(args.pluginsDir)) {
                if (!pluginNames.includes(fileName)) {
                    pluginNames.push(fileName);
                    pluginPaths.push(path.resolve(args.pluginsDir, fileName));
                };
            };
        };

        if (!args.disableDefaultPlugins) {
            var pluginsRoot = require.main.filename;
            var glaceRoot = path.resolve(__dirname, "..", "..");

            while (!glaceRoot.startsWith(pluginsRoot)
                    && pluginsRoot !== path.dirname(pluginsRoot)) {
                pluginsRoot = path.dirname(pluginsRoot);
            };

            var pluginDirs = _.clone(module.paths)
                .reverse()
                .filter(filePath => filePath.startsWith(pluginsRoot));

            var skipped = [ "glace-js", "glace-core", "glace-utils" ];

            for (var pluginDir of pluginDirs) {
                if (!fs.existsSync(pluginDir)) continue;
                for (var fileName of fs.readdirSync(pluginDir)) {
                    if (fileName.startsWith("glace-")
                            && !skipped.includes(fileName)
                            && !pluginNames.includes(fileName)) {
                        pluginNames.push(fileName);
                        pluginPaths.push(path.resolve(pluginDir, fileName));
                    };
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
