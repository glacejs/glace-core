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
    }
    return modules;
};

var getPlugins = module.exports.get = () => {
    if (!systemPlugins) {

        var fileName;
        systemPlugins = [];
        var systemNames = [];

        if (args.pluginsDir) {
            expect(fs.existsSync(args.pluginsDir),
                `Plugins folder '${args.pluginsDir}' doesn't exist`)
                .to.be.true;

            for (fileName of fs.readdirSync(args.pluginsDir).reverse()) {
                if (!systemNames.includes(fileName)) {
                    systemNames.push(fileName);
                    systemPlugins.push({
                        name: fileName,
                        path: path.resolve(args.pluginsDir, fileName),
                    });
                }
            }
        }

        if (!args.disableDefaultPlugins) {
            var skipped = [ "glace-js", "glace-core", "glace-utils" ];

            for (var pluginDir of _getPluginDirs()) {
                if (!fs.existsSync(pluginDir)) continue;

                for (fileName of fs.readdirSync(pluginDir).reverse()) {
                    if (fileName.startsWith("glace-")
                            && !skipped.includes(fileName)
                            && !systemNames.includes(fileName)) {

                        systemNames.push(fileName);
                        systemPlugins.push({
                            name: fileName,
                            path: path.resolve(pluginDir, fileName),
                        });
                    }
                }
            }
        }

        systemPlugins.reverse();

        for (var plugin of _.clone(systemPlugins)) {
            try {
                plugin.module = require(plugin.path);
            } catch (e) {
                LOG.warn(`Can't load plugin '${plugin.path}'`);
                systemPlugins.splice(systemPlugins.indexOf(plugin), 1);
            }
        }
    }

    var customNames = Object.values(customPlugins).map(p => p.name);

    return systemPlugins
        .filter(p => !customNames.includes(p.name))
        .concat(customPlugins);
};
/**
 * Clear plugins cache.
 *
 * @function
 */
module.exports.clearCache = () => systemPlugins = null;
/**
 * Registers custom plugin.
 *
 * @function
 * @arg {string} name - Name of plugin module.
 */
module.exports.register = name => {

    var customNames = Object.values(customPlugins).map(p => p.name);

    if (customNames.includes(name)) {
        LOG.warn(`Plugin '${name}' is registered already`);
        return;
    }

    customPlugins.push({
        name: name,
        path: require.resolve(name),
        module: require(name),
    });
};
/**
 * Gets names of registered custom plugins.
 *
 * @function
 * @return {array<string>} Plugin names.
 */
module.exports.getRegistered = () => {
    return customPlugins.map(p => p.name);
};
/**
 * Gets plugin dirs.
 *
 * @ignore
 * @function
 * @return {string[]} - List of paths.
 */
var _getPluginDirs = () => {
    var pluginDirs = _.clone(module.paths);

    if (require.main) {
        var mainDir = path.dirname(require.main.filename);
        if (!pluginDirs.includes(mainDir)) {
            pluginDirs.unshift(mainDir);
        }
    }

    if (!pluginDirs.includes(U.cwd)) {
        pluginDirs.unshift(U.cwd);
    }

    return pluginDirs;
};
