"use strict";
/**
 * Configures `GlaceJS` before tests run.
 *
 * @namespace GlaceConfig
 * @prop {object} cluster - Cluster namespace.
 * @prop {boolean} [cluster.isMaster=true] - Mark current process as master.
 * @prop {boolean} [cluster.isSlave=false] - Mark current process as slave.
 * @prop {number} [cluster.slavesNum=0] - Number of slaves to launch.
 * @prop {number} [cluster.slaveId=null] - ID of slave.
 * @prop {object} session - Session namespace.
 * @prop {string} session.name - Session name. By default contains timestamp.
 *  Can be overridden with CLI option `--session-name`.
 * @prop {string} session.id - Session ID. Default is timestamp.
 * @prop {boolean} [session.isPassed=false] - Flag to define if tests session
 *  run is passed or no.
 * @prop {array<string>} [session.preloads=[]] - Array of paths to `js` modules
 *  which will be loaded before tests session run.
 * @prop {boolean} [session.interactive=false] - Flag to launch interactive
 *  session. Can be overridden with CLI option `-i / --interactive`.
 * @prop {boolean} [session.debugOnFail=false] - Flag to enter to interactive
 *  mode on step failure. Can be overridden with CLI option `--debug-on-fail`.
 * @prop {boolean} [session.exitOnFail=false] - Flag to break tests session on
 *  first test failure. Can be overridden with CLI option `--exit-on-fail`.
 * @prop {string} [session.uncaughtException=log] - Strategy to process uncaught
 *  exceptions. Available values are `log`, `fail`, `mocha`. Can be overridden
 *  with CLI option `--uncaught`.
 * @prop {string} session.rootConftest - Path to `js` module which will be
 *  loaded right after preloads. Can be overridden with CLI
 *  option `--root-conftest`.
 * @prop {array<string>} session.killProcs - Array of process names which will
 *  be killed before tests session run. Can be overridden with CLI
 *  option `--kill-procs`.
 * @prop {object} test - Test namespace.
 * @prop {?TestCase} [test.curCase=null] - Currently executed test case.
 * @prop {array<TestCase>} [test.cases=[]] - Array of session test cases.
 * @prop {array<string>} [test.languages=[]] - Array of language names. Can be
 *  overridden with CLI option `--languages`.
 * @prop {array<string>} [test.dirs=[]] - Array of test files or folders. Can
 *  be overridden with CLI arguments or option `--targets` separated with comma.
 * @prop {boolean} [test.checkNames=true] - Flag to check test names uniqueness.
 *  Can be overridden with CLI option `--dont-check-names`.
 * @prop {integer} [test.retries=0] - Number of test retries on failure. Can
 *  be overridden with CLI option `--retry`.
 * @prop {integer} [test.chunkRetries=0] - Number of chunk retries on failure.
 *  Can be overridden with CLI option `--chunk-retry`.
 * @prop {integer} [test.chunkTimeout=180000] - Timeout of chunk execution, ms.
 *  Can be overridden with CLI option `--chunk-timeout`, sec.
 * @prop {object} report - Report namespace.
 * @prop {string} [report.dir=cwd/report] - Folder to save tests session report.
 * @prop {string} [report.testDir] - Folder to save test-specific artifacts.
 * @prop {boolean} [report.clear=true] - Flag to clear report before tests run.
 *  Can be overridden with CLI option `--dont-clear-report`.
 * @prop {boolean} [report.errorsNow=false] - Flag to print test error right
 *  after its capture. Can be overridden with CLI option `--errors-now`.
 * @prop {string} [report.failedTestsPath=cwd/failed-tests.json] - Path to file
 *  where info about failed tests will be saved to. Can be overridden with CLI
 *  option `--failed-tests-path`.
 * @prop {object} [xunit] - xUnit report namespace.
 * @prop {boolean} [xunit.use=false] - Flag to activate xUnit report. Can be
 *  overridden with CLI option `--xunit`.
 * @prop {string} [xunit.path=report.dir/xunit.xml] - Path to xUnit report. Can
 *  be overridden with CLI option `--xunit-path`.
 * @prop {string} [xunit.suiteName=session.name] - xUnit suite name. Can be
 *  overridden with CLI option `--xunit-suite-name`.
 * @prop {object} [allure] - Allure report namespace.
 * @prop {boolean} [allure.use=false] - Flag to activate allure report. Can be
 *  overridden with CLI option `--allure`.
 * @prop {string} [allure.dir=report.dir/allure] - Folder to save allure report.
 *  Can be overridden with CLI option `--allure-dir`.
 * @prop {string} [allure.suiteName=session.name] - Allure suite name. Can be
 *  overridden with CLI option `--allure-suite-name`.
 * @prop {object} testrail - Testrail report namespace.
 * @prop {boolean} [testrail.use=false] - Flag to activate testrail report. Can
 *  be overridden with CLI option `--testrail`.
 * @prop {string} testrail.host - Testrail host. Can be overridden with CLI
 *  option `--testrail-host`.
 * @prop {string} testrail.user - Testrail user name or email. Can be overridden
 *  with CLI option `--testrail-user`.
 * @prop {string} testrail.token - Testrail auth token. Can be overridden with
 *  CLI option `--testrail-token`.
 * @prop {string} testrail.projectId - Testrail project ID. Can be overridden
 *  with CLI option `--testrail-project-id`.
 * @prop {string} testrail.suiteId - Testrail suite ID. Can be overridden with
 *  CLI option `--testrail-suite-id`.
 * @prop {string} testrail.runName - Testrail run name. Can be overridden with
 *  CLI option `--testrail-run-name`.
 * @prop {string} testrail.runDescription - Testrail run description. Can be
 *  overridden with CLI option `--testrail-run-description`.
 * @prop {object} plugins - Plugins namespace.
 * @prop {string} plugins.dir - Folder with custom plugins. Can be overridden
 *  with CLI option `--plugins-dir`.
 * @prop {object} filter - Tests filter namespace.
 * @prop {string} filter.grep - Mocha grep option to filter tests, scopes and
 *  suites. Can be overridden with CLI option `-g / --grep`.
 * @prop {array<string>} filter.include - List of test names which should be
 *  included to tests session. Can be overridden with CLI option `--include`.
 * @prop {array<string>} filter.exclude - List of test names which should be
 *  excluded from tests session. Can be overridden with CLI option `--exclude`.
 * @prop {boolean} [filter.precise=false] - Flag for precise tests inclusion or
 *  exclusion (not substring pattern). Can be overridden with CLI option
 *  `--precise`.
 * @prop {object} tools - Tools namespace.
 * @prop {boolean} [tools.stepsList=false] - Flag to list available steps only.
 *  Can be overridden with CLI option `--list-steps`.
 * @prop {string} tools.stepsFilter - String to filter steps. Can be overridden
 *  with CLI option `--list-steps`.
 * @prop {boolean} [tools.testsList=false] - Flag to list implemented tests
 *  only. Can be overridden with CLI option `--list-tests`.
 * @prop {string} tools.testsFilter - String to filter tests. Can be overridden
 *  with CLI option `--list-tests`.
 * @prop {boolean} [tools.fixturesList=false] - Flag to list available fixtures
 *  only. Can be overridden with CLI option `--list-fixtures`.
 * @prop {string} tools.fixturesFilter - String to filter fixtures. Can be
 *  overridden with CLI option `--list-fixtures`.
 * @prop {boolean} [tools.checkTestrail=false] - Flag to check matching of
 *  testrail cases with implemented tests only. Can be overridden with CLI
 *  option `--testrail-check`.
 */

const fs = require("fs");
const path = require("path");

require("colors");
const _ = require("lodash");
const expect = require("chai").expect;

const U = require("glace-utils");
U.docString();

const plugins = require("./plugins");

let config = U.config;
const args = config.args;

if (U.config.__testmode) config = {}; // not affect global config in test mode

config.cluster = U.defVal(config.cluster, {});
config.cluster.slavesNum = U.defVal(args.slaves, 0);
if (config.cluster.slavesNum === "auto") {
    config.cluster.slavesNum = require("os").cpus().length;
} else {
    config.cluster.slavesNum = +config.cluster.slavesNum;
}
config.cluster.slaveId = parseInt(process.env.GLACE_SLAVE_ID) || null;
config.cluster.isSlave = !!process.env.GLACE_SLAVE_ID;
config.cluster.isMaster = !!config.cluster.slavesNum && !config.cluster.isSlave;
config.cluster.artifactsDir = path.resolve(U.cwd, U.defVal(args.reportDir, "report"));

config.counters = U.defVal(config.counters, {});
config.counters.testId = 0;
config.counters.chunkId = 0;
config.counters.curChunkId = null;
config.counters.passedChunkIds = [];

config.session = U.defVal(config.session, {});
const date = new Date();
config.session.name = U.defVal(args.sessionName, `Session ${date.toLocaleString()}`);
config.session.id = date.getTime();
config.session.isPassed = false;
config.session.preloads = [];
config.session.interactive = args.i || args.interactive || false;
if (config.cluster.slavesNum) {
    expect(config.session.interactive,
        "Interactive mode is incompatible with `--slaves`").to.be.false;
}
config.session.debugOnFail = args.debugOnFail || false;
if (config.cluster.slavesNum) {
    expect(config.session.debugOnFail,
        "`--debug-on-fail` is incompatible with `--slaves`").to.be.false;
}
config.session.exitOnFail = args.exitOnFail || false;
config.session.uncaughtException = (args.uncaught || "log").toLowerCase();
expect([ "log", "fail", "mocha" ],
    "Invalid `--uncaught` option").include(config.session.uncaughtException);
if (args.rootConftest) config.session.rootConftest = path.resolve(U.cwd, args.rootConftest);
if (args.killProcs && !config.cluster.isSlave) config.session.killProcs = U.splitBy(args.killProcs, ",");

const get_targets = () => {
    let tt;
    if (args._ && args._.length) {
        tt = args._;
    } else if (args.targets && args.targets.length) {
        tt = U.splitBy(args.targets, ",");
    } else {
        tt = ["tests"];
    };
    return tt.map(t => path.resolve(U.cwd, t));
};

config.test = U.defVal(config.test, {});
config.test.curCase = null;
config.test.cases = [];
config.test.languages = [];
if (args.languages) config.test.languages = U.splitBy(args.languages, ",");
config.test.dirs = get_targets();
config.test.checkNames = !args.dontCheckNames;
config.test.retries = U.defVal(args.retry, 0);
expect(config.test.retries, "Invalid `--retry` option").to.be.gte(0);
config.test.chunkRetries = U.defVal(args.chunkRetry, 0);
expect(config.test.chunkRetries, "Invalid `--chunk-retry` option").to.be.gte(0);
config.test.chunkTimeout = (args.chunkTimeout || 180) * 1000 || Infinity;
config.test.__chunkId = [0 /* test id */, 0 /* chunk id in test */];
config.test.__curChunkId = null;

config.report = U.defVal(config.report, {});
config.report.dir = config.cluster.artifactsDir;
if (config.cluster.isMaster) {
    config.report.dir = path.resolve(config.report.dir, "master");
}
if (config.cluster.isSlave) {
    config.report.dir = path.resolve(config.report.dir, "slave-" + config.cluster.slaveId);
}
config.report.testDir = null;
config.report.clear = !args.dontClearReport;
config.report.errorsNow = args.errorsNow || false;
config.report.failedTestsPath = path.resolve(config.report.dir, U.defVal(args.failedTestsPath, "failed-tests.json"));
if (!config.report.failedTestsPath.endsWith(".json")) config.report.failedTestsPath += ".json";

const tests_filter = filter => {
    const filePath = path.resolve(U.cwd, filter);
    if (fs.existsSync(filePath)) {
        config.filter.precise = true;
        return U.loadJson(filePath);
    } else {
        return U.splitBy(filter, "|").map(e => { return { name: e }; });
    }
};

config.filter = U.defVal(config.filter, {});
config.filter.grep = args.g || args.grep;
config.filter.precise = args.precise || false;
if (args.include) config.filter.include = tests_filter(args.include);
if (args.exclude) config.filter.exclude = tests_filter(args.exclude);
if (config.filter.include) {
    for (const include of config.filter.include) {
        if (!include.passed_chunk_ids) continue;
        config.counters.passedChunkIds = config.counters.passedChunkIds.concat(include.passed_chunk_ids);
    }
}
if (process.env.GLACE_TEST_IDS) {
    config.filter.testIds = U.splitBy(process.env.GLACE_TEST_IDS, ",").map(i => +i);
} else {
    config.filter.testIds = null;
};

config.xunit = U.defVal(config.xunit, {});
config.xunit.use = U.defVal(args.xunit, false);
config.xunit.path = path.resolve(config.report.dir, U.defVal(args.xunitPath, "xunit.xml"));
config.xunit.suiteName = U.defVal(args.xunitSuiteName, config.session.name);

config.allure = U.defVal(config.allure, {});
config.allure.use = U.defVal(args.allure, false);
config.allure.dir = path.resolve(config.report.dir, U.defVal(args.allureDir, "allure"));
config.allure.suiteName = U.defVal(args.allureSuiteName, config.session.name);

config.testrail = U.defVal(config.testrail, {});
config.testrail.use = U.defVal(args.testrail, false);
config.testrail.host = U.defVal(args.testrailHost);
config.testrail.user = U.defVal(args.testrailUser);
config.testrail.token = U.defVal(args.testrailToken);
config.testrail.projectId = U.defVal(args.testrailProjectId);
config.testrail.suiteId = U.defVal(args.testrailSuiteId);
config.testrail.runName = U.defVal(args.testrailRunName);
config.testrail.runDescription = U.defVal(args.testrailRunDesc);

config.plugins = U.defVal(config.plugins, {});
if (args.pluginsDir) config.plugins.dir = path.join(U.cwd, args.pluginsDir);
config.plugins.disableDefault = U.defVal(args.disableDefaultPlugins, false);

plugins.getModules("config");

config.tools = U.defVal(config.tools, {});
config.tools.stepsList = !!args.listSteps;
config.tools.stepsFilter = typeof(args.listSteps) === "string" ? args.listSteps : null;
config.tools.testsList = !!args.listTests;
config.tools.testsFilter = typeof(args.listTests) === "string" ? args.listTests : null;
config.tools.fixturesList = !!args.listFixtures;
config.tools.fixturesFilter = typeof(args.listFixtures) === "string" ? args.listFixtures : null;
config.tools.pluginsList = !!args.listPlugins;
config.tools.checkTestrail = U.defVal(args.testrailCheck, false);

if (config.session.debugOnFail) {
    config.test.chunkTimeout = Infinity;
    config.xunit.use = false;
    config.allure.use = false;
    config.testrail.use = false;
}

if (config.session.interactive) {
    const temp = require("temp").track();
    const tempPath = temp.path({ prefix: "test", suffix: ".js" });
    const tempData = "test('interactive', () => chunk(async () => await $.debug()));";
    fs.writeFileSync(tempPath, tempData);
    config.test.dirs = [tempPath];
    config.test.chunkTimeout = Infinity;
    config.filter.grep = null;
    config.filter.include = null;
    config.filter.exclude = null;
    config.xunit.use = false;
    config.allure.use = false;
    config.testrail.use = false;
}

let userConfig = {};
const userConfigPath = path.resolve(U.cwd, (args.userConfig || "config.js"));
if (fs.existsSync(userConfigPath)) userConfig = require(userConfigPath);
_.assign(config, userConfig);

module.exports = config;
