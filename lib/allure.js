"use strict";

/**
 * Allure wrapper.
 *
 * @module
 */

var Allure = require("allure-js-commons");
var Step = require("allure-js-commons/beans/step");

var CONF = require("./config");

if (CONF.allure.use) {
    var allure = new Allure();
    allure.setOptions({ targetDir: CONF.allure.dir });
    allure.step = function () {
        if (this.getCurrentSuite().currentStep instanceof Step) {
            this.startStep.apply(this, arguments);
        }
    };
    allure.pass = function () {
        if (this.getCurrentSuite().currentStep instanceof Step) {
            this.endStep("passed");
        }
    };
} else {
    allure = {
        step: () => {},
        pass: () => {},
    };
};

module.exports = allure;
