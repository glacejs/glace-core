"use strict";
/**
 * Plugins.
 *
 * @module 
 */

const fs = require("fs");
const path = require("path");

const _ = require("lodash");
const expect = require("chai").expect;
const U = require("glace-utils");

const CONF = U.config; // HACK to avoid cross-import between config.js and plugins.js
const LOG = U.logger;

let systemPlugins = null;
let customPlugins = [];

/**
 * Get list of found and registered plugins. Each plugin is an object with keys:
 * `name` - plugin name, `path` - plugin path, `module` - loaded plugin module.
 * Order of resolving, if there plugins with the same names:
 * 1. Registered custom plugins.
 * 2. Plugins which are far from `glace-core` package.
 *
 * @function
 * @return {array<object>}
 */
const get = () => {
    if (!systemPlugins) {
        systemPlugins = [];
        systemPlugins = findPlugins(systemPlugins);
        systemPlugins = getPluginsFromDir(systemPlugins);
        systemPlugins = loadPlugins(systemPlugins);
    }

    const customPluginNames = getNames({ type: "custom" });

    return systemPlugins
        .filter(p => !customPluginNames.includes(p.name))
        .concat(customPlugins);
};

/**
 * Traverse folders and find `glace` plugins.
 * @ignore
 */
const findPlugins = plugins => {
    if (CONF.plugins.disableDefault) return plugins;
    
    const SKIPPED_PACKAGES = ["glace-js", "glace-core", "glace-utils"];

    const foundPlugins = [];
    const foundPluginNames = [];

    for (const pluginDir of dirsToSearchPlugins()) {
        if (!fs.existsSync(pluginDir)) continue;
        for (const fileName of fs.readdirSync(pluginDir)) {

            if (!fileName.startsWith("glace-") ||
                SKIPPED_PACKAGES.includes(fileName) ||
                foundPluginNames.includes(fileName)) continue;

            foundPlugins.push({
                name: fileName,
                path: path.resolve(pluginDir, fileName),
            });
            foundPluginNames.push(fileName);
        }
    }

    return plugins
        .filter(p => !foundPluginNames.includes(p.name))
        .concat(foundPlugins);
};

/**
 * Get list of plugins for folder specified in config.
 * @ignore
 */
const getPluginsFromDir = plugins => {
    if (!CONF.plugins.dir) return plugins;

    expect(fs.existsSync(CONF.plugins.dir) && fs.statSync(CONF.plugins.dir).isDirectory(),
        `Plugins folder '${CONF.plugins.dir}' doesn't exist or isn't a folder`).to.be.true;

    const dirPlugins = [];
    const dirPluginNames = [];

    for (const fileName of fs.readdirSync(CONF.plugins.dir)) {
        dirPlugins.push({
            name: fileName,
            path: path.resolve(CONF.plugins.dir, fileName),
        });
        dirPluginNames.push(fileName);
    }

    return plugins
        .filter(p => !dirPluginNames.includes(p.name))
        .concat(dirPlugins);
};

/**
 * Load required plugins and return back list of loaded plugins.
 * @ignore 
 */
const loadPlugins = plugins => {
    const loadedPlugins = [];

    for (const plugin of plugins) {
        try {
            plugin.module = require(plugin.path);
            loadedPlugins.push(Object.freeze(plugin));
        } catch (e) {
            LOG.error(`Can't load plugin '${plugin.path}':`, e);
        }
    }

    return loadedPlugins;
};

/**
 * Gets modules from plugins.
 *
 * @arg {string} moduleName - Name of module to request from plugins.
 * @return {object[]} - List of modules requested from plugins.
 */
const getModules = moduleName => {
    const modules = [];
    for (const plugin of get()) {
        const mod = plugin.module[moduleName];
        if (mod) modules.push(mod);
    }
    return modules;
};
/**
 * Clear plugins cache.
 *
 * @function
 */
const clearCache = () => systemPlugins = null;
/**
 * Registers custom plugin.
 *
 * @function
 * @arg {string} name - Name of plugin module.
 */
const register = name => {
    const customPluginNames = getNames({ type: "custom" });

    if (customPluginNames.includes(name)) {
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
 * Removes custom plugin from list of registered.
 *
 * @function
 * @arg {string} name - Name of registered plugin.
 */
const remove = name => {
    const customPluginNames = getNames({ type: "custom" });

    if (!customPluginNames.includes(name)) {
        LOG.warn(`Plugin '${name}' isn't registered yet`);
        return;
    }

    customPlugins = customPlugins.filter(p => p.name !== name);
};

/**
 * Gets names of plugins.
 *
 * @function
 * @arg {object} opts - Options.
 * @arg {string} [opts.type] - Type of plugins. Supported values are `custom`
 * and `system`, if omitted then names of all plugins will be returned.
 * @return {array<string>} Plugin names.
 */
const getNames = opts => {
    opts = opts || {};
    let names;
    if (opts.type === "custom") {
        names = customPlugins.map(p => p.name).sort();
    } else if (opts.type === "system") {
        names = (systemPlugins || []).map(p => p.name).sort();
    } else {
        names = _.uniq((systemPlugins || []).map(p => p.name).concat(customPlugins.map(p => p.name))).sort();
    };
    return names;
};

/**
 * Get folders to search plugins.
 * @ignore
 */
const dirsToSearchPlugins = () => {
    const pluginDirs = _.clone(module.paths);

    if (require.main) {
        const mainDir = path.dirname(require.main.filename);
        if (!pluginDirs.includes(mainDir)) {
            pluginDirs.unshift(mainDir);
        }
    }

    if (!pluginDirs.includes(U.cwd)) {
        pluginDirs.unshift(U.cwd);
    }

    return pluginDirs;
};

module.exports = {
    get,
    getModules,
    getNames,
    register,
    remove,
    clearCache,
};
