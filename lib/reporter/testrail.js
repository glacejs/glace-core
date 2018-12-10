"use strict";
/**
 * [TestRail](https://www.gurock.com/testrail) reporter publishs test results
 * to remote testrail server via its API.
 *
 * @module
 */

const util = require("util");

const expect = require("chai").expect;
const Testrail = require("testrail-api");
const LOG = require("glace-utils").logger;

const CONF = require("../config");
const TestCase = require("../testing").TestCase;

for (const opt in CONF.testrail) {
    expect(CONF.testrail[opt],
        `TestRail option '${opt}' is not specified in config`)
        .to.exist;
}

const testrail = new Testrail({
    host: CONF.testrail.host,
    user: CONF.testrail.user,
    password: CONF.testrail.token });

testrail.isFailed = false;

const Results = {
    PASSED:   1,
    BLOCKED:  2,
    UNTESTED: 3,
    RETEST:   4,
    FAILED:   5
};

const cases = {};
let report = Promise.resolve();

const Reporter = {
    /**
     * Called on tests start.
     *
     * @method
     * @instance
     */
    start: () => {

        report = report.then(() => {
            return testrail.getCases(
                CONF.testrail.projectId, { suite_id: CONF.testrail.suiteId });

        }).then(result => {
            for (const remoteCase of result.body) {
                if (cases[remoteCase.title]) {
                    throw new Error("Detect duplicated cases in TestRail for " +
                        `name '${remoteCase.title}'. Only unique names should be.`);
                }
                cases[remoteCase.title] = { id: remoteCase.id };
            }

        }).then(() => {
            return testrail.addRun(CONF.testrail.projectId, {
                suite_id: CONF.testrail.suiteId, name: CONF.testrail.runName,
                description: CONF.testrail.runDescription });

        }).then(result => {
            CONF.testrail.runId = result.body.id;

        }).catch(e => {
            testrail.isFailed = true;
            LOG.error(util.format("Error to init TestRail report:", e));
        });
    },
    /**
     * Called before tests end.
     *
     * @method
     * @instance
     */
    end: () => {
        if (testrail.isFailed) return;
        console.log();
        const reportMsg = "TestRail report is " + CONF.testrail.host +
            "/index.php?/runs/view/" + CONF.testrail.runId;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
    },
    /**
     * Called on test end.
     *
     * @method
     * @instance
     */
    testEnd: () => {
        if (testrail.isFailed) return;
        const testrailCase = cases[CONF.test.curCase.name];
        if (!testrailCase) {
            LOG.error(`Testrail case '${CONF.test.curCase.name}' is absent`);
            return;
        }

        const testResult = { status_id: Results.PASSED, comment: "" };
        testResult.comment = Reporter.setComment();

        if (CONF.test.curCase.status === TestCase.SKIPPED) {
            testResult.status_id = Results.BLOCKED;
        }
        if (CONF.test.curCase.screenshots.length) {
            testResult.comment += Reporter.processScreens(CONF.test.curCase.screenshots);
        }
        if (CONF.test.curCase.videos.length) {
            testResult.comment += Reporter.processVideos(CONF.test.curCase.videos);
        }
        if (CONF.test.curCase.status === TestCase.FAILED) {
            testResult.status_id = Results.FAILED;
            testResult.comment += Reporter.processErrors(CONF.test.curCase.errors);
        }
        if (CONF.test.curCase.rawInfo.length) {
            testResult.comment += Reporter.processExtras(CONF.test.curCase.rawInfo);
        }

        testResult.comment = testResult.comment.trim();

        report = report.then(() => {
            return testrail.addResultForCase(
                CONF.testrail.runId, testrailCase.id, testResult);

        }).catch(e => {
            LOG.error(util.format(
                `Error to publish test '${CONF.test.curCase.name}' report to TestRail:`, e));
        });
    },
    /**
     * Called on report finalizing.
     *
     * @method
     * @instance
     */
    done: () => report,
};

/**
 * Entry point to set comment of test before testrail publication.
 * Can be overridden with custom function.
 *
 * @memberOf module:reporter/testrail
 * @instance
 * @function setComment
 * @return {string} - Test comment.
 *
 * @example <caption><b>Overriding with custom function</b></caption>
 * // should be after configuration but before tests run
 * const testrail = require("glace-core/lib/reporter/testrail");
 * testrail.setComment = myFuncToSetComment;
 */
Reporter.setComment = () => "";

/**
 * Entry point to process test screenshot paths before testrail publication.
 * Can be overridden with custom function.
 *
 * @memberOf module:reporter/testrail
 * @instance
 * @function processScreens
 * @arg {string[]} screens - List of screenshot paths.
 * @return {string} - Test screenshots info, attaching to test comment.
 *
 * @example <caption><b>Overriding with custom function</b></caption>
 * // should be after configuration but before tests run
 * const testrail = require("glace-core/lib/reporter/testrail");
 * testrail.processScreens = myFuncToProcessScreens;
 */
Reporter.processScreens = screens => {
    let result = "\n\nScreenshots:";
    screens.forEach((screen, i) => {
        result += `\n${i + 1}. ${screen}`;
    });
    return result;
};

/**
 * Entry point to process test video paths before testrail publication.
 * Can be overridden with custom function.
 *
 * @memberOf module:reporter/testrail
 * @instance
 * @function processVideos
 * @arg {string[]} videos - List of video paths.
 * @return {string} - Test videos info, attaching to test comment.
 *
 * @example <caption><b>Overriding with custom function</b></caption>
 * // should be after configuration but before tests run
 * const testrail = require("glace-core/lib/reporter/testrail");
 * testrail.processVideos = myFuncToProcessVideos;
 */
Reporter.processVideos = videos => {
    let result = "\n\nVideos:";
    videos.forEach((video, i) => {
        result += `\n${i + 1}. ${video}`;
    });
    return result;
};

/**
 * Entry point to process test errors before testrail publication.
 * Can be overridden with custom function.
 *
 * @memberOf module:reporter/testrail
 * @instance
 * @function processErrors
 * @arg {string[]} errors - List of test errors.
 * @return {string} - Test errors info, attaching to test comment.
 *
 * @example <caption><b>Overriding with custom function</b></caption>
 * // should be after configuration but before tests run
 * const testrail = require("glace-core/lib/reporter/testrail");
 * testrail.processErrors = myFuncToProcessErrors;
 */
Reporter.processErrors = errors => {
    let result = "\n\nErrors:";
    errors.forEach((error, i) => {
        result += `${i ? "\n" : ""}\n${i + 1}. ${error}`;
    });
    return result;
};

/**
 * Entry point to process test extra details before testrail publication.
 * Can be overridden with custom function.
 *
 * @memberOf module:reporter/testrail
 * @instance
 * @function processExtras
 * @arg {string[]} extras - List of extra details.
 * @return {string} - Test extra details, attaching to test comment.
 *
 * @example <caption><b>Overriding with custom function</b></caption>
 * // should be after configuration but before tests run
 * const testrail = require("glace-core/lib/reporter/testrail");
 * testrail.processExtras = myFuncToProcessExtras;
 */
Reporter.processExtras = extras => {
    let result = "\n\nExtra details:";
    extras.forEach((extra, i) => {
        result += `${i ? "\n" : ""}\n${i + 1}. ${extra}`;
    });
    return result;
};

module.exports = Reporter;
