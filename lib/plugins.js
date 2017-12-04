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

var plugins = null; // plugins cache
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
    if (!plugins) {

        var plugins = {};

        if (args.pluginsDir) {
            expect(fs.existsSync(args.pluginsDir),
                   `Plugins folder '${args.pluginsDir}' doesn't exist`)
                .to.be.true;

            for (var fileName of fs.readdirSync(args.pluginsDir)) {
                if (!Object.keys(plugins).includes(fileName)) {
    
                    plugins[fileName] = {
                        name: fileName,
                        path: path.resolve(args.pluginsDir, fileName),
                    };
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
                            && !Object.keys(plugins).includes(fileName)) {

                        plugins[fileName] = {
                            name: fileName,
                            path: path.resolve(pluginDir, fileName),
                        };
                    };
                };
            };
        };

        for (var plugin of Object.values(plugins)) {
            try {
                plugin.module = require(plugin.path);
            } catch (e) {
                LOG.warn(`Can't load plugin '${plugin.path}'`);
                delete plugins[plugin.name];
            };
        };
    };
    return plugins;
}
/**
 * Clear plugins cache.
 *
 * @function
 */
module.exports.clearCache = () => plugins = null;
/**
 * Add plugin to cache.
 *
 * @function
 * @arg {string} name - Name of plugin module.
 */
module.exports.add = name => {
    expect(plugins[name],
           `Plugin '${name}' is registered already`)
        .to.be.undefined;

    plugins[name] = {
        name: name,
        path: require.resolve(name),
        module: require(name),
    };
};
