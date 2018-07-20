"use strict";
/**
 * TestRail reporter.
 *
 * @module
 */

const expect = require("chai").expect;
const Testrail = require("testrail-api");

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
let testrailFailed = false;

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
            return new Promise((resolve, reject) => {
                testrail.getCases(
                    CONF.testrail.projectId,
                    { suite_id: CONF.testrail.suiteId },
                    (err, response, _cases) => {
                        if (err) return reject(err);
                        for (const _case of _cases) {
                            if (cases[_case.title]) {
                                return reject(new Error(
                                    "Detect duplicated cases with name " +
                                    `'${_case.title}'. Only unique names ` +
                                    "should be."));
                            }
                            cases[_case.title] = { id: _case.id };
                        }
                        resolve();
                    }); 
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                testrail.addRun(
                    CONF.testrail.projectId,
                    { suite_id: CONF.testrail.suiteId,
                        name: CONF.testrail.runName,
                        description: CONF.testrail.runDescription },
                    (err, response, run) => {
                        if (err) return reject(err);
                        CONF.testrail.runId = run.id;
                        resolve();
                    });
            });
        })
            .catch(e => {
                testrailFailed = true;
                console.log("Error to init TestRail report:", e);
            });
    },
    /**
     * Called before tests end.
     *
     * @method
     * @instance
     */
    end: () => {
        if (testrailFailed) return;
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
        if (testrailFailed) return;
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
            return new Promise((resolve, reject) => {
                testrail.addResultForCase(
                    CONF.testrail.runId,
                    testrailCase.id,
                    testResult,
                    (err, res) => {
                        if (err) return reject(err);
                        resolve(res);
                    });
            });
        }).catch(e => {
            console.log(
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
