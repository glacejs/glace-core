"use strict";

/**
 * Allure wrapper.
 *
 * @module
 */

var fs = require("fs");

var Allure = require("allure-js-commons");
var Step = require("allure-js-commons/beans/step");

var CONF = require("./config");

if (CONF.allure.use) {
    var allure = new Allure();
    allure.setOptions({ targetDir: CONF.allure.dir });
    allure.PASSED = "passed";
    allure.FAILED = "failed";
    allure.SKIPPED = "skipped";

    allure.hasSteps = function () {
        return this.getCurrentSuite().currentStep instanceof Step;
    };

    allure.isTestStarted = function () {
        return !!(this.getCurrentSuite() && this.getCurrentTest() && !this.getCurrentTest().status);
    };

    allure.step = function () {
        if (this.isTestStarted()) this.startStep.apply(this, arguments);
    };

    allure.pass = function () {
        if (this.isTestStarted()) this.endStep(this.PASSED);
    };

    allure.story = function (name) {
        if (!this.isTestStarted()) return;
        this.getCurrentTest().addLabel("story", name);
    };

    allure.feature = function (name) {
        if (!this.isTestStarted()) return;
        this.getCurrentTest().addLabel("feature", name);
    };

    allure.attach = function (name, content, type) {
        if (!this.isTestStarted()) return;
        this.addAttachment(name, Buffer.from(content), type);
    };

    allure.attachJson = function (name, obj) {
        if (!this.isTestStarted()) return;
        this.addAttachment(name, JSON.stringify(obj, null, "  "), "application/json");
    };

    allure.attachImage = function (name, imgPath) {
        if (!this.isTestStarted()) return;
        this.attach(name, fs.readFileSync(imgPath), "image/png");
    };

    allure.attachVideo = function (name, videoPath) {
        if (!this.isTestStarted()) return;
        this.attach(name, fs.readFileSync(videoPath), "video/mp4");
    };

    allure.attachText = function (name, txt) {
        this.attach(name, txt, "text/plain");
    };

    allure.attachHtml = function (name, html) {
        this.attach(name, html, "application/html");
    };

    allure.addEnvironment = function (name, value) {
        if (!this.isTestStarted()) return;
        this.getCurrentTest().addParameter("environment-variable", name, value);
    };

    allure.addDescription = function (desc, type) {
        if (!this.isTestStarted()) return;
        this.getCurrentTest().setDescription(desc, type);
    };
} else {
    allure = new Proxy({}, { get: () => () => {} });
};

module.exports = allure;
