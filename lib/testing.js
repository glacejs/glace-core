"use strict";
/**
 * Contains classes and functions to save executed tests data.
 *
 * @module
 */

var _ = require("lodash");
var expect = require("chai").expect;
/**
 * Test case data structure.
 *
 * Contains full information and history about test case.
 *
 * @class
 * @arg {string} name - Test name.
 * @prop {string} name - Test name.
 * @prop {string} [status=NOT_STARTED] - Test status.
 * @prop {?string} [skipChunk=null] - Name of currently skipped chunk.
 * @prop {string[]} [screenshots=[]] - List of test screenshot paths.
 * @prop {string[]} [videos=[]] - List of test video paths.
 * @prop {string[]} [errors=[]] - List of test errors.
 * @prop {string[]} [rawInfo=[]] - List of additional test details.
 * @prop {object[]} [failedParams=[]] - List of test failed parameters.
 * @prop {object} [testParams={}] - Dict of test parameters.
 */
var TestCase = module.exports.TestCase = function (name) {
    this.duration = 0;
    this.name = name;
    this.status = TestCase.NOT_STARTED;
    this.skipChunk = null;
    this.chunks = [];
    this.reset();
};
/**
 * Starts test case.
 *
 * @method
 */
TestCase.prototype.start = function () {
    expect(this.status,
        `test case '${this.name}' is started already`)
        .to.not.be.equal(TestCase.IN_PROGRESS);
    this._startTime = new Date();
    this.status = TestCase.IN_PROGRESS;
};
/**
 * Ends test case.
 *
 * @method
 * @arg {string} status - Test case status.
 */
TestCase.prototype.end = function (status) {
    expect(this.status,
        `test case '${this.name}' isn't started yet`)
        .to.be.equal(TestCase.IN_PROGRESS);

    this.duration += new Date() - this._startTime;
    this.status = status;
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
        if (_.isEqual(params, failed)) return;
    }
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
/**
 * Adds chunk.
 *
 * @method
 * @arg {string} chunkName - Name of chunk.
 */
TestCase.prototype.addChunk = function (chunkName) {
    this.chunks.push(chunkName);
};
/**
 * Defines if test case has failed params or no.
 *
 * @method
 * @returns {boolean}
 */
TestCase.prototype.hasFailedParams = function () {
    return !((this.failedParams.length < 2) && _.isEmpty(this.failedParams[0]));
};

TestCase.NOT_STARTED = "not started";
TestCase.IN_PROGRESS = "in progress";
TestCase.FAILED = "failed";
TestCase.PASSED = "passed";
TestCase.SKIPPED = "skipped";

/**
 * Class defining mochajs scope name and type.
 */
class ScopeType extends String {
    /**
     * Set mochajs scope type.
     * @arg {string} type - Supported values are `scope`, `suite`, `test`.
     */
    setType (type) {
        this.type = type;
        return this;
    }
};

module.exports.ScopeType = ScopeType;
