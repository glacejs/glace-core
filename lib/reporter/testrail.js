"use strict";
/**
 * TestRail reporter.
 *
 * @module
 */

const expect = require("chai").expect;
const Testrail = require("testrail-api");
const LOG = require("glace-utils").logger;

const CONF = require("../config");
const TestCase = require("../testing").TestCase;

for (const opt in CONF.testrail) {
    expect(CONF.testrail[opt],
        `TestRail option '${opt}' isn't specified in config`)
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

module.exports = {
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
            LOG.error("Error to init TestRail report:", e);
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
     * @arg {object} test - `MochaJS` suite.
     */
    testEnd: test => {
        if (testrail.isFailed) return;
        const testCase = CONF.test.cases.filter(t => t.name == test.title)[0];
        const testrailCase = cases[test.title];
        if (!testrailCase) return;

        const testResult = { status_id: Results.PASSED, comment: "" };

        if (testCase.screenshots.length) {
            testResult.comment += "Screenshots:";
            for (const screen of testCase.screenshots) {
                testResult.comment += "\n" + screen;
            }
        }
        if (testCase.videos.length) {
            testResult.comment += "\n\nVideos:";
            for (const video of testCase.videos) {
                testResult.comment += "\n" + video;
            }
        }
        if (testCase.rawInfo.length) {
            testResult.comment += "\n\nExtra details:";
            for (const info of testCase.rawInfo) {
                testResult.comment += "\n" + info;
            }
        }
        if (testCase.status === TestCase.SKIPPED) {
            testResult.status_id = Results.BLOCKED;
        }
        if (testCase.status === TestCase.FAILED) {
            testResult.status_id = Results.FAILED;
            testResult.comment += "\n\nErrors:";
            for (const error of testCase.errors) {
                testResult.comment += "\n" + error;
            }
        }

        report = report.then(() => {
            return testrail.addResultForCase(
                CONF.testrail.runId, testrailCase.id, testResult);

        }).catch(e => {
            LOG.error(
                `Error to publish test '${test.title}' report to TestRail:`, e);
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
