"use strict";
/**
 * Contains classes and functions to save executed tests data.
 *
 * @module
 */

var _ = require("lodash");
/**
 * Test case data structure.
 *
 * Contains full information and history about test case.
 *
 * @class
 * @arg {string} name - Test name.
 * @prop {string} name - Test name.
 * @prop {status} [status=NOT_STARTED] - Test status.
 * @prop {string[]} [screenshots=[]] - List of test screenshot paths.
 * @prop {string[]} [videos=[]] - List of test video paths.
 * @prop {string[]} [errors=[]] - List of test errors.
 * @prop {string[]} [rawInfo=[]] - List of additional test details.
 * @prop {object[]} [failedParams=[]] - List of test failed parameters.
 * @prop {object} [testParams={}] - Dict of test parameters.
 */
var TestCase = module.exports.TestCase = function (name) {
    this.name = name;
    this.status = TestCase.NOT_STARTED;
};
/**
 * Resets test case info.
 *
 * @method
 */
TestCase.prototype.reset = function () {
    this.screenshots = [];
    this.videos = [];
    this.errors = [];
    this.rawInfo = [];
    this.failedParams = [];
    this.testParams = {};
};
/**
 * Adds failed params if they don't exist.
 *
 * @method
 * @arg {object} params - Parameters which test was failed with.
 */
TestCase.prototype.addFailedParams = function (params) {
    for (var failed of this.failedParams) {
        if (_.isEqual(params, failed)) break;
    };
    this.failedParams.push(params);
};
/**
 * Adds error to test case.
 *
 * @method
 * @arg {Error} err - Test error.
 */
TestCase.prototype.addError = function (err) {
    this.errors.push(err);
};
/**
 * Adds screenshot.
 *
 * @method
 * @arg {string} imagePath - Path to saved screenshot.
 */
TestCase.prototype.addScreenshot = function (imagePath) {
    this.screenshots.push(imagePath);
};
/**
 * Adds video.
 *
 * @method
 * @arg {string} videoPath - Path to saved video.
 */
TestCase.prototype.addVideo = function (videoPath) {
    this.videos.push(videoPath);
};
/**
 * Adds additional information.
 *
 * @method
 * @arg {string} info - Additional information.
 */
TestCase.prototype.addDetails = function (info) {
    this.rawInfo.push(info);
};

TestCase.NOT_STARTED = "not started";
TestCase.IN_PROGRESS = "in progress";
TestCase.FAILED = "failed";
TestCase.PASSED = "passed";
