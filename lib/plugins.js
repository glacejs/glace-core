"use strict";
/**
 * Plugins.
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

var systemPlugins = null; // plugins cache
var customPlugins = [];
/**
 * Gets modules from plugins.
 *
 * @arg {string} moduleName - Name of module to request from plugins.
 * @return {object[]} - List of modules requested from plugins.
 */
module.exports.getModules = moduleName => {

    var modules = [];
    for (var plugin of Object.values(getPlugins())) {
        var mod = plugin.module[moduleName];
        if (mod) modules.push(mod);
    };
    return modules;
};

var getPlugins = module.exports.get = () => {
    if (!systemPlugins) {

        systemPlugins = [];
        var systemNames = [];

        if (args.pluginsDir) {
            expect(fs.existsSync(args.pluginsDir),
                   `Plugins folder '${args.pluginsDir}' doesn't exist`)
                .to.be.true;

            for (var fileName of fs.readdirSync(args.pluginsDir).reverse()) {
                if (!systemNames.includes(fileName)) {
                    systemNames.push(fileName);
                    systemPlugins.push({
                        name: fileName,
                        path: path.resolve(args.pluginsDir, fileName),
                    });
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

                for (var fileName of fs.readdirSync(pluginDir).reverse()) {
                    if (fileName.startsWith("glace-")
                            && !skipped.includes(fileName)
                            && !systemNames.includes(fileName)) {

                        systemNames.push(fileName);
                        systemPlugins.push({
                            name: fileName,
                            path: path.resolve(pluginDir, fileName),
                        });
                    };
                };
            };
        };

        for (var plugin of _.clone(systemPlugins)) {
            try {
                plugin.module = require(plugin.path);
            } catch (e) {
                LOG.warn(`Can't load plugin '${plugin.path}'`);
                systemPlugins.splice(systemPlugins.indexOf(plugin), 1);
            };
        };
        systemPlugins.reverse(); // first load closer plugins, custom dir - last
    };
    
    var customNames = Object.values(customPlugins).map(p => p.name);

    var plugins = [];
    for (var plugin of systemPlugins) {
        /* override system plugins with custom */
        if (customNames.includes(plugin.name)) continue;
        plugins.push(plugin);
    };
    return plugins.concat(customPlugins);
};
/**
 * Clear plugins cache.
 *
 * @function
 */
module.exports.clearCache = () => plugins = null;
/**
 * Register custom plugin.
 *
 * @function
 * @arg {string} name - Name of plugin module.
 */
module.exports.register = name => {

    var customNames = Object.values(customPlugins).map(p => p.name);

    expect(customNames.includes(name),
           `Plugin '${name}' is registered already`)
        .to.be.undefined;

    customPlugins.push({
        name: name,
        path: require.resolve(name),
        module: require(name),
    });
};
