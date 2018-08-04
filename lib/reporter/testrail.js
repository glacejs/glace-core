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
     */
    testEnd: () => {
        if (testrail.isFailed) return;
        const testrailCase = cases[CONF.test.curCase.name];
        if (!testrailCase) {
            LOG.error(`Testrail case '${CONF.test.curCase.name}' is absent`);
            return;
        }

        const testResult = { status_id: Results.PASSED, comment: "" };

        if (CONF.test.curCase.screenshots.length) {
            testResult.comment += "Screenshots:";
            for (const screen of CONF.test.curCase.screenshots) {
                testResult.comment += "\n" + screen;
            }
        }
        if (CONF.test.curCase.videos.length) {
            testResult.comment += "\n\nVideos:";
            for (const video of CONF.test.curCase.videos) {
                testResult.comment += "\n" + video;
            }
        }
        if (CONF.test.curCase.rawInfo.length) {
            testResult.comment += "\n\nExtra details:";
            for (const info of CONF.test.curCase.rawInfo) {
                testResult.comment += "\n" + info;
            }
        }
        if (CONF.test.curCase.status === TestCase.SKIPPED) {
            testResult.status_id = Results.BLOCKED;
        }
        if (CONF.test.curCase.status === TestCase.FAILED) {
            testResult.status_id = Results.FAILED;
            testResult.comment += "\n\nErrors:";
            for (const error of CONF.test.curCase.errors) {
                testResult.comment += "\n" + error;
            }
        }

        report = report.then(() => {
            return testrail.addResultForCase(
                CONF.testrail.runId, testrailCase.id, testResult);

        }).catch(e => {
            LOG.error(
                `Error to publish test '${CONF.test.curCase.name}' report to TestRail:`, e);
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
