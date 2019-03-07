"use strict";
/**
 * GlaceJS reporter package.
 *
 * @module
 */

const CONF = require("../config");
const plugins = require("../plugins");

const base = require("./base");

const main = () => {
    if (CONF.report.dots) {
        base.register(require("./dots"));
    } else {
        base.register(require("./stdout"));
    };

    if (CONF.testrail.use) base.register(require("./testrail"));
    if (CONF.xunit.use) base.register(require("./xunit"));
    if (CONF.allure.use) base.register(require("./allure"));

    for (const reporter of plugins.getModules("reporter")) {
        base.register(reporter);
    }
    return base;
};

module.exports = CONF.__testmode ? main : main();
