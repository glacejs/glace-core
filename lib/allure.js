"use strict";

/**
 * Allure wrapper.
 *
 * @module
 */

var Allure = require("allure-js-commons");

var CONF = require("./config");

if (CONF.allure.use) {
    var allure = new Allure();
    allure.setOptions({ targetDir: CONF.allure.dir });
    allure.step = allure.startStep;
} else {
    allure = {
        step: () => {},
    };
};

module.exports = allure;
