"use strict";

const fs = require("fs");

const temp = require("temp").track();
const U = require("glace-utils");

const plugins = require("../../lib/plugins");

const CONFIG_PATH = "../../lib/config";

const sandbox = sinon.createSandbox();
let log, exit, config;

suite("config", () => {

    beforeChunk(() => {
        delete U.config.args.userConfig;
        delete U.config.args.testrail;
        delete U.config.args.allure;
        delete U.config.args.xunit;
        delete U.config.args.preciseMatch;
        delete U.config.args.g;
        delete U.config.args.grep;
        delete U.config.args.i;
        delete U.config.args.interactive;
        delete U.config.args.uncaught;
        delete U.config.args.dontCheckNames;
        delete U.config.args.retry;
        delete U.config.args.chunkRetry;
        log = console.log;
        exit = process.exit;
        U.config.__testmode = true;
        config = rewire(CONFIG_PATH);
    });

    afterChunk(() => {
        console.log = log;
        process.exit = exit;
        U.config.__testmode = false;
        sandbox.restore();
    });

    test("session", () => {

        chunk("default values", () => {
            expect(config.session).to.exist;
            expect(config.session.name).to.include("Session");
            expect(config.session.id).to.exist;
            expect(config.session.errors).to.be.empty;
            expect(config.session.isPassed).to.be.false;
            expect(config.session.preloads).to.be.empty;
            expect(config.session.interactive).to.be.false;
            expect(config.session.debugOnFail).to.be.false;
            expect(config.session.exitOnFail).to.be.false;
            expect(config.session.uncaughtException).to.be.equal("log");
            expect(config.session.rootConftest).to.be.undefined;
            expect(config.session.killProcs).to.be.undefined;
        });

        chunk("custom name", () => {
            U.config.args.sessionName = "hello world";
            config = rewire(CONFIG_PATH);
            expect(config.session.name).to.be.equal("hello world");
        });

        chunk("enabled interactive", () => {
            U.config.args.i = true;
            config = rewire(CONFIG_PATH);
            expect(config.session.interactive).to.be.true;
            delete U.config.args.i;
            U.config.args.interactive = true;
            config = rewire(CONFIG_PATH);
            expect(config.session.interactive).to.be.true;
        });

        chunk("enabled debugOnFail", () => {
            U.config.args.debugOnFail = true;
            config = rewire(CONFIG_PATH);
            expect(config.session.debugOnFail).to.be.true;
            delete U.config.args.debugOnFail;
        });

        chunk("enabled exitOnFail", () => {
            U.config.args.exitOnFail = true;
            config = rewire(CONFIG_PATH);
            expect(config.session.exitOnFail).to.be.true;
        });

        chunk("custom uncaughtException", () => {
            U.config.args.uncaught = "FAIL";
            config = rewire(CONFIG_PATH);
            expect(config.session.uncaughtException).to.be.equal("fail");
            U.config.args.uncaught = "MOCHA";
            config = rewire(CONFIG_PATH);
            expect(config.session.uncaughtException).to.be.equal("mocha");
            U.config.args.uncaught = "invalid";
            expect(() => rewire(CONFIG_PATH)).to.throw("Invalid `--uncaught`");
        });

        chunk("custom rootConftest", () => {
            U.config.args.rootConftest = "conftest";
            config = rewire(CONFIG_PATH);
            expect(config.session.rootConftest).to.endWith("conftest");
        });

        chunk("custom killProcs", () => {
            U.config.args.killProcs = "java, chrome";
            config = rewire(CONFIG_PATH);
            expect(config.session.killProcs).to.be.eql(["java", "chrome"]);
        });
    });

    test("retry", () => {
        chunk("default values", () => {
            expect(config.retry).to.exist;
            expect(config.retry.id).to.be.equal(0);
            expect(config.retry.chunkIds).to.be.eql({});
            expect(config.retry.curChunkIds).to.be.null;
        });
    });

    test("test", () => {

        chunk("default values", () => {
            expect(config.test).to.exist;
            expect(config.test.id).to.be.equal(0);
            expect(config.test.curCase).to.be.null;
            expect(config.test.cases).to.be.empty;
            expect(config.test.languages).to.be.empty;
            expect(config.test.dirs).to.not.be.empty;
            expect(config.test.checkNames).to.be.true;
            expect(config.test.retries).to.be.equal(0);
        });

        chunk("custom languages", () => {
            U.config.args.languages = "ee, ru, en";
            config = rewire(CONFIG_PATH);
            expect(config.test.languages).to.be.eql(["ee", "ru", "en"]);
        });

        chunk("custom dirs", () => {
            delete U.config.args._;
            delete U.config.args.targets;
            config = rewire(CONFIG_PATH);
            expect(config.test.dirs).to.have.length(1);
            expect(config.test.dirs[0]).to.endWith("tests");
            delete U.config.args.targets;
            U.config.args._ = ["mytests"];
            config = rewire(CONFIG_PATH);
            expect(config.test.dirs).to.have.length(1);
            expect(config.test.dirs[0]).to.endWith("mytests");
            delete U.config.args._;
            U.config.args.targets = "mytests";
            config = rewire(CONFIG_PATH);
            expect(config.test.dirs).to.have.length(1);
            expect(config.test.dirs[0]).to.endWith("mytests");
        });

        chunk("disabled checkNames", () => {
            U.config.args.dontCheckNames = true;
            config = rewire(CONFIG_PATH);
            expect(config.test.checkNames).to.be.false;
        });

        chunk("custom retries", () => {
            U.config.args.retry = 1;
            config = rewire(CONFIG_PATH);
            expect(config.test.retries).to.be.equal(1);

            U.config.args.retry = -1;
            config = rewire(CONFIG_PATH);
            expect(config.test.retries).to.be.equal(0);
        });
    });

    test("chunk", () => {
        chunk("default values", () => {
            expect(config.chunk).to.exist;
            expect(config.chunk.id).to.be.equal(0);
            expect(config.chunk.curId).to.be.null;
            expect(config.chunk.passedIds).to.be.eql([]);
            expect(config.chunk.retries).to.be.equal(0);
            expect(config.chunk.timeout).to.be.equal(180000);
        });

        chunk("custom retries", () => {
            U.config.args.chunkRetry = 1;
            config = rewire(CONFIG_PATH);
            expect(config.chunk.retries).to.be.equal(1);

            U.config.args.chunkRetry = -1;
            config = rewire(CONFIG_PATH);
            expect(config.chunk.retries).to.be.equal(0);
        });

        chunk("custom timeout", () => {
            U.config.args.chunkTimeout = 10;
            config = rewire(CONFIG_PATH);
            expect(config.chunk.timeout).to.be.equal(10000);
        });

        chunk("disabled timeout", () => {
            U.config.args.chunkTimeout = "no";
            config = rewire(CONFIG_PATH);
            expect(config.chunk.timeout).to.be.equal(Infinity);
        });
    });

    test("report", () => {

        chunk("default values", () => {
            expect(config.report).to.exist;
            expect(config.report.dir).to.endWith("report");
            expect(config.report.clear).to.be.true;
            expect(config.report.errorsNow).to.be.false;
            expect(config.report.failedTestsPath).to.endWith("failed-tests.json");
            expect(config.report.failedTestsPath).to.startWith(config.report.dir);
        });

        chunk("custom dir", () => {
            U.config.args.reportDir = "my-report";
            config = rewire(CONFIG_PATH);
            expect(config.report.dir).to.endWith("my-report");
        });

        chunk("disabled clear", () => {
            U.config.args.dontClearReport = true;
            config = rewire(CONFIG_PATH);
            expect(config.report.clear).to.be.false;
        });

        chunk("enabled errorsNow", () => {
            U.config.args.errorsNow = true;
            config = rewire(CONFIG_PATH);
            expect(config.report.errorsNow).to.be.true;
        });

        chunk("custom failedTestsPath", () => {
            U.config.args.failedTestsPath = "my-failures";
            config = rewire(CONFIG_PATH);
            expect(config.report.failedTestsPath).to.endWith("my-failures.json");
        });
    });

    test("filter", () => {

        chunk("default values", () => {
            expect(config.filter).to.exist;
            expect(config.filter.grep).to.be.undefined;
            expect(config.filter.precise).to.be.false;
            expect(config.filter.include).to.be.undefined;
            expect(config.filter.exclude).to.be.undefined;
        });

        chunk("custom grep", () => {
            U.config.args.g = "my test";
            config = rewire(CONFIG_PATH);
            expect(config.filter.grep).to.be.equal("my test");
            delete U.config.args.g;
            U.config.args.grep = "my another test";
            config = rewire(CONFIG_PATH);
            expect(config.filter.grep).to.be.equal("my another test");
        });

        chunk("custom precise", () => {
            U.config.args.preciseMatch = true;
            config = rewire(CONFIG_PATH);
            expect(config.filter.precise).to.be.true;
        });

        chunk("custom include", () => {
            const tmpPath = save_tmp_filter();
            U.config.args.include = tmpPath;
            config = rewire(CONFIG_PATH);
            expect(config.filter.include).to.be.eql([{ id: "1_1" }]);
            expect(config.filter.precise).to.be.true;
            U.config.args.include = "test #1 | test #2";
            config = rewire(CONFIG_PATH);
            expect(config.filter.include).to.be.eql([{ id: "test #1" }, { id: "test #2" }]);
            expect(config.filter.precise).to.be.false;
        });

        chunk("custom exclude", () => {
            const tmpPath = save_tmp_filter();
            U.config.args.exclude = tmpPath;
            config = rewire(CONFIG_PATH);
            expect(config.filter.exclude).to.be.eql([{ id: "1_1" }]);
            expect(config.filter.precise).to.be.true;
            U.config.args.exclude = "test #1 | test #2";
            config = rewire(CONFIG_PATH);
            expect(config.filter.exclude).to.be.eql([{ id: "test #1" }, { id: "test #2" }]);
            expect(config.filter.precise).to.be.false;
        });
    });

    test("xunit", () => {

        chunk("default values", () => {
            expect(config.xunit).to.exist;
            expect(config.xunit.use).to.be.false;
            expect(config.xunit.path).to.endWith("xunit.xml");
            expect(config.xunit.suiteName).to.be.equal(config.session.name);
        });

        chunk("enabled use", () => {
            U.config.args.xunit = true;
            config = rewire(CONFIG_PATH);
            expect(config.xunit.use).to.be.true;
        });

        chunk("custom path", () => {
            U.config.args.xunitPath = "my-xunit.xml";
            config = rewire(CONFIG_PATH);
            expect(config.xunit.path).to.endWith("my-xunit.xml");
        });

        chunk("custom suite name", () => {
            U.config.args.xunitSuiteName = "my suite";
            config = rewire(CONFIG_PATH);
            expect(config.xunit.suiteName).to.be.equal("my suite");
        });
    });

    test("allure", () => {

        chunk("default values", () => {
            expect(config.allure).to.exist;
            expect(config.allure.use).to.be.false;
            expect(config.allure.dir).to.endWith("allure");
            expect(config.allure.suiteName).to.be.equal(config.session.name);
        });

        chunk("enabled use", () => {
            U.config.args.allure = true;
            config = rewire(CONFIG_PATH);
            expect(config.allure.use).to.be.true;
        });

        chunk("custom dir", () => {
            U.config.args.allureDir = "my-allure";
            config = rewire(CONFIG_PATH);
            expect(config.allure.dir).to.endWith("my-allure");
        });

        chunk("custom suiteName", () => {
            U.config.args.allureSuiteName = "my-suite";
            config = rewire(CONFIG_PATH);
            expect(config.allure.suiteName).to.be.equal("my-suite");
        });
    });

    test("testrail", () => {

        chunk("default values", () => {
            expect(config.testrail).to.exist;
            expect(config.testrail.use).to.be.false;
            expect(config.testrail.host).to.be.null;
            expect(config.testrail.user).to.be.null;
            expect(config.testrail.token).to.be.null;
            expect(config.testrail.projectId).to.be.null;
            expect(config.testrail.suiteId).to.be.null;
            expect(config.testrail.runName).to.be.null;
            expect(config.testrail.runDescription).to.be.null;
        });

        chunk("enabled use", () => {
            U.config.args.testrail = true;
            config = rewire(CONFIG_PATH);
            expect(config.testrail.use).to.be.true;
        });

        chunk("custom host", () => {
            U.config.args.testrailHost = "http://localhost";
            config = rewire(CONFIG_PATH);
            expect(config.testrail.host).to.be.equal("http://localhost");
        });

        chunk("custom user", () => {
            U.config.args.testrailUser = "guest";
            config = rewire(CONFIG_PATH);
            expect(config.testrail.user).to.be.equal("guest");
        });

        chunk("custom token", () => {
            U.config.args.testrailToken = "qwerty1234";
            config = rewire(CONFIG_PATH);
            expect(config.testrail.token).to.be.equal("qwerty1234");
        });

        chunk("custom projectId", () => {
            U.config.args.testrailProjectId = "1234";
            config = rewire(CONFIG_PATH);
            expect(config.testrail.projectId).to.be.equal("1234");
        });

        chunk("custom suiteId", () => {
            U.config.args.testrailSuiteId = "1234";
            config = rewire(CONFIG_PATH);
            expect(config.testrail.suiteId).to.be.equal("1234");
        });

        chunk("custom runName", () => {
            U.config.args.testrailRunName = "my run";
            config = rewire(CONFIG_PATH);
            expect(config.testrail.runName).to.be.equal("my run");
        });

        chunk("custom runDescription", () => {
            U.config.args.testrailRunDesc = "just a run";
            config = rewire(CONFIG_PATH);
            expect(config.testrail.runDescription).to.be.equal("just a run");
        });
    });

    test("plugins", () => {

        chunk("default values", () => {
            expect(config.plugins).to.exist;
            expect(config.plugins.dir).to.be.undefined;
            expect(config.plugins.disableDefault).to.be.false;
        });

        chunk("custom dir", () => {
            U.config.args.pluginsDir = "my-plugins";
            config = rewire(CONFIG_PATH);
            expect(config.plugins.dir).to.endWith("my-plugins");
        });

        chunk("enabled disableDefault", () => {
            U.config.args.disableDefaultPlugins = true;
            config = rewire(CONFIG_PATH);
            expect(config.plugins.disableDefault).to.be.true;
        });
    });

    test("tools", () => {

        chunk("default values", () => {
            expect(config.tools).to.exist;
            expect(config.tools.stepsList).to.be.false;
            expect(config.tools.stepsFilter).to.be.null;
            expect(config.tools.testsList).to.be.false;
            expect(config.tools.testsFilter).to.be.null;
            expect(config.tools.fixturesList).to.be.false;
            expect(config.tools.fixturesFilter).to.be.null;
            expect(config.tools.pluginsList).to.be.false;
            expect(config.tools.checkTestrail).to.be.false;
        });

        chunk("enabled stepsList", () => {
            U.config.args.listSteps = true;
            config = rewire(CONFIG_PATH);
            expect(config.tools.stepsList).to.be.true;
            expect(config.tools.stepsFilter).to.be.null;
        });

        chunk("custom stepsFilter", () => {
            U.config.args.listSteps = "disable proxy";
            config = rewire(CONFIG_PATH);
            expect(config.tools.stepsList).to.be.true;
            expect(config.tools.stepsFilter).to.be.equal("disable proxy");
        });

        chunk("enabled testsList", () => {
            U.config.args.listTests = true;
            config = rewire(CONFIG_PATH);
            expect(config.tools.testsList).to.be.true;
            expect(config.tools.testsFilter).to.be.null;
        });

        chunk("custom testsFilter", () => {
            U.config.args.listTests = "disable proxy";
            config = rewire(CONFIG_PATH);
            expect(config.tools.testsList).to.be.true;
            expect(config.tools.testsFilter).to.be.equal("disable proxy");
        });

        chunk("enabled fixturesList", () => {
            U.config.args.listFixtures = true;
            config = rewire(CONFIG_PATH);
            expect(config.tools.fixturesList).to.be.true;
            expect(config.tools.fixturesFilter).to.be.null;
        });

        chunk("custom fixturesFilter", () => {
            U.config.args.listFixtures = "disable proxy";
            config = rewire(CONFIG_PATH);
            expect(config.tools.fixturesList).to.be.true;
            expect(config.tools.fixturesFilter).to.be.equal("disable proxy");
        });

        chunk("enabled pluginsList", () => {
            U.config.args.listPlugins = true;
            config = rewire(CONFIG_PATH);
            expect(config.tools.pluginsList).to.be.true;
        });

        chunk("enabled checkTestrail", () => {
            U.config.args.testrailCheck = true;
            config = rewire(CONFIG_PATH);
            expect(config.tools.checkTestrail).to.be.true;
        });
    });

    test("activate plugin configs", () => {

        beforeChunk(() => {
            sandbox.stub(plugins, "getModules");
        });

        chunk(() => {
            config = rewire(CONFIG_PATH);
            expect(plugins.getModules).to.be.calledOnce;
            expect(plugins.getModules.args[0][0]).to.be.equal("config");
        });
    });

    test("merge user config", () => {
        chunk(() => {
            U.config.args.userConfig = save_user_config();
            config = rewire(CONFIG_PATH);
            expect(config.custom).to.be.equal("my field");
        });
    });

    test("interactive mode changes config", () => {

        beforeChunk(() => {
            U.config.args.i = true;
            U.config.args.g = "test";
            U.config.args.include = "test";
            U.config.args.exclude = "test";
            U.config.args.xunit = true;
            U.config.args.allure = true;
            U.config.args.testrail = true;
        });

        chunk(() => {
            config = rewire(CONFIG_PATH);
            expect(config.test.dirs).has.length(1);
            expect(fs.readFileSync(config.test.dirs[0]).toString()).to.include("await $.debug()");
            expect(config.chunk.timeout).to.be.equal(Infinity);
            expect(config.filter.grep).to.be.null;
            expect(config.filter.include).to.be.null;
            expect(config.filter.exclude).to.be.null;
            expect(config.xunit.use).to.be.false;
            expect(config.allure.use).to.be.false;
            expect(config.testrail.use).to.be.false;
        });
    });
});

const save_tmp_filter = () => {
    const tempPath = temp.path({ prefix: "test", suffix: ".json" });
    const tempData = JSON.stringify([{ id: "1_1" }]);
    fs.writeFileSync(tempPath, tempData);
    return tempPath;
};

const save_user_config = () => {
    const tempPath = temp.path({ prefix: "test", suffix: ".js" });
    const tempData = "module.exports = { custom: 'my field', };";
    fs.writeFileSync(tempPath, tempData);
    return tempPath;
};
