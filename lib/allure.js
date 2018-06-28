"use strict";

/**
 * [Allure](http://allure.qatools.ru/) wrapper.
 *
 * @module
 */

const fs = require("fs");

const Allure = require("allure-js-commons");
const Step = require("allure-js-commons/beans/step");

const CONF = require("./config");

let allure;

if (CONF.allure.use) {
    allure = new Allure();
    allure.setOptions({ targetDir: CONF.allure.dir });
    allure.PASSED = "passed";
    allure.FAILED = "failed";
    allure.SKIPPED = "skipped";
    /**
     * Defines if allure helper has steps or no.
     *
     * @memberOf module:allure
     * @method
     * @return {boolean} `true` if it has steps, `false` otherwise.
     */
    allure.hasSteps = function () {
        return this.getCurrentSuite().currentStep instanceof Step;
    };
    /**
     * Defines if test is started or no.
     *
     * @memberOf module:allure
     * @method
     * @return {boolean} `true` if test is started, `false` otherwise.
     */
    allure.isTestStarted = function () {
        return !!(this.getCurrentSuite() && this.getCurrentTest() && !this.getCurrentTest().status);
    };
    /**
     * Starts step if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - Step name.
     */
    allure.step = function () {
        if (this.isTestStarted()) this.startStep.apply(this, arguments);
    };
    /**
     * Ends step as passed if test is started.
     *
     * @memberOf module:allure
     * @method
     */
    allure.pass = function () {
        if (this.isTestStarted()) this.endStep(this.PASSED);
    };
    /**
     * Adds test story if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - Story name.
     */
    allure.story = function (name) {
        if (!this.isTestStarted()) return;
        this.getCurrentTest().addLabel("story", name);
    };
    /**
     * Adds test feature if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - Feature name.
     */
    allure.feature = function (name) {
        if (!this.isTestStarted()) return;
        this.getCurrentTest().addLabel("feature", name);
    };
    /**
     * Adds test environment value if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - Environment name.
     * @arg {string} value - Environment value.
     */
    allure.addEnvironment = function (name, value) {
        if (!this.isTestStarted()) return;
        this.getCurrentTest().addParameter("environment-variable", name, value);
    };
    /**
     * Adds test description if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} desc - Description.
     * @arg {string} type - Mime type.
     */
    allure.addDescription = function (desc, type) {
        if (!this.isTestStarted()) return;
        this.getCurrentTest().setDescription(desc, type);
    };
    /**
     * Attach content to test if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - Content name.
     * @arg {string} content - Content body.
     * @arg {string} type - Mime type.
     */
    allure.attach = function (name, content, type) {
        if (!this.isTestStarted()) return;
        this.addAttachment(name, Buffer.from(content), type);
    };
    /**
     * Attach JSON to test if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - JSON name.
     * @arg {string} obj - Object to convert to JSON.
     */
    allure.attachJson = function (name, obj) {
        if (!this.isTestStarted()) return;
        this.attach(name, JSON.stringify(obj, null, "  "), "application/json");
    };
    /**
     * Attach image to test if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - Image name.
     * @arg {string} imgPath - Image path.
     */
    allure.attachImage = function (name, imgPath) {
        if (!this.isTestStarted()) return;
        this.attach(name, fs.readFileSync(imgPath), "image/png");
    };
    /**
     * Attach video to test if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - Video name.
     * @arg {string} videoPath - Video path.
     */
    allure.attachVideo = function (name, videoPath) {
        if (!this.isTestStarted()) return;
        this.attach(name, fs.readFileSync(videoPath), "video/mp4");
    };
    /**
     * Attach text to test if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - Text name.
     * @arg {string} txt - Text content.
     */
    allure.attachText = function (name, txt) {
        this.attach(name, txt, "text/plain");
    };
    /**
     * Attach HTML to test if test is started.
     *
     * @memberOf module:allure
     * @method
     * @arg {string} name - HTML name.
     * @arg {string} html - HTML content.
     */
    allure.attachHtml = function (name, html) {
        this.attach(name, html, "application/html");
    };

} else {
    allure = new Proxy({}, { get: () => () => {} });
};

module.exports = allure;
