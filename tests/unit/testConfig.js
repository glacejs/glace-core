"use strict";

const fs = require("fs");
const path = require("path");

const _ = require("lodash");
const temp = require("temp").track();
const U = require("glace-utils");

const plugins = require("../../lib/plugins");

const CONFIG_PATH = "../../lib/config";

const configMock = {};
const OPTS = {
    "glace-utils": _.assign(_.clone(U), { config: configMock }),
};

const sandbox = sinon.createSandbox();
let log, exit, config;

suite("config", () => {

    beforeChunk(() => {
        Object.keys(configMock).forEach(k => delete configMock[k]);
        configMock.args = {};
        log = console.log;
        exit = process.exit;
        config = rehire(CONFIG_PATH, OPTS);
    });

    afterChunk(() => {
        console.log = log;
        process.exit = exit;
        sandbox.restore();
    });

    test("cluster", () => {

        chunk("default values", () => {
            expect(config.cluster).to.exist;
            expect(config.cluster.slavesNum).to.be.equal(0);
            expect(config.cluster.slaveId).to.be.null;
            expect(config.cluster.isSlave).to.be.false;
            expect(config.cluster.isMaster).to.be.false;
        });

        chunk("with auto number slaves", () => {
            configMock.args.slaves = "auto";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.cluster.slavesNum).to.be.a("number");
            expect(config.cluster.slavesNum).to.be.above(0);
        });
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
            configMock.args.sessionName = "hello world";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.session.name).to.be.equal("hello world");
        });

        chunk("enabled interactive", () => {
            configMock.args.i = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.session.interactive).to.be.true;
            delete configMock.args.i;
            configMock.args.interactive = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.session.interactive).to.be.true;
        });

        chunk("enabled debugOnFail", () => {
            configMock.args.debugOnFail = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.session.debugOnFail).to.be.true;
        });

        chunk("enabled exitOnFail", () => {
            configMock.args.exitOnFail = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.session.exitOnFail).to.be.true;
        });

        chunk("custom uncaughtException", () => {
            configMock.args.uncaught = "FAIL";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.session.uncaughtException).to.be.equal("fail");
            configMock.args.uncaught = "MOCHA";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.session.uncaughtException).to.be.equal("mocha");
            configMock.args.uncaught = "invalid";
            expect(() => rehire(CONFIG_PATH, OPTS)).to.throw("Invalid `--uncaught`");
        });

        chunk("custom rootConftest", () => {
            configMock.args.rootConftest = "conftest";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.session.rootConftest).to.endWith("conftest");
        });

        chunk("custom killProcs", () => {
            configMock.args.killProcs = "java, chrome";
            config = rehire(CONFIG_PATH, OPTS);
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
            configMock.args.languages = "ee, ru, en";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.test.languages).to.be.eql(["ee", "ru", "en"]);
        });

        chunk("custom dirs", () => {
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.test.dirs).to.have.length(1);
            expect(config.test.dirs[0]).to.endWith("tests");
            delete configMock.args.targets;
            configMock.args._ = ["mytests"];
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.test.dirs).to.have.length(1);
            expect(config.test.dirs[0]).to.endWith("mytests");
            delete configMock.args._;
            configMock.args.targets = "mytests";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.test.dirs).to.have.length(1);
            expect(config.test.dirs[0]).to.endWith("mytests");
        });

        chunk("disabled checkNames", () => {
            configMock.args.dontCheckNames = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.test.checkNames).to.be.false;
        });

        chunk("custom retries", () => {
            configMock.args.retry = 1;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.test.retries).to.be.equal(1);

            configMock.args.retry = -1;
            config = rehire(CONFIG_PATH, OPTS);
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
            configMock.args.chunkRetry = 1;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.chunk.retries).to.be.equal(1);

            configMock.args.chunkRetry = -1;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.chunk.retries).to.be.equal(0);
        });

        chunk("custom timeout", () => {
            configMock.args.chunkTimeout = 10;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.chunk.timeout).to.be.equal(10000);
        });

        chunk("disabled timeout", () => {
            configMock.args.chunkTimeout = "no";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.chunk.timeout).to.be.equal(Infinity);
        });
    });

    test("report", () => {

        chunk("default values", () => {
            expect(config.report).to.exist;
            expect(config.report.dots).to.be.false;
            expect(config.report.dir).to.endWith("report");
            expect(config.report.clear).to.be.true;
            expect(config.report.errorsNow).to.be.false;
            expect(config.report.failedTestsPath).to.endWith("failed-tests.json");
            expect(config.report.failedTestsPath).to.startWith(config.report.dir);
        });

        chunk("dots reporter", () => {
            configMock.args.dots = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.report.dots).to.be.true;
        });

        chunk("custom dir", () => {
            configMock.args.reportDir = "my-report";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.report.dir).to.endWith("my-report");
        });

        chunk("master dir", () => {
            configMock.args.slaves = 1;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.report.dir).to.endWith(path.join("report", "master"));
        });

        chunk("slave dir", () => {
            configMock.args.slaves = 1;
            process.env.GLACE_SLAVE_ID = 1;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.report.dir).to.endWith(path.join("report", "slave-1"));
        });

        chunk("disabled clear", () => {
            configMock.args.dontClearReport = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.report.clear).to.be.false;
        });

        chunk("enabled errorsNow", () => {
            configMock.args.errorsNow = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.report.errorsNow).to.be.true;
        });

        chunk("custom failedTestsPath", () => {
            configMock.args.failedTestsPath = "my-failures";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.report.failedTestsPath).to.endWith("my-failures.json");
        });
    });

    test("filter", () => {

        chunk("default values", () => {
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter).to.exist;
            expect(config.filter.grep).to.be.undefined;
            expect(config.filter.precise).to.be.false;
            expect(config.filter.include).to.be.undefined;
            expect(config.filter.exclude).to.be.undefined;
        });

        chunk("custom grep", () => {
            configMock.args.g = "my test";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter.grep).to.be.equal("my test");
            delete configMock.args.g;
            configMock.args.grep = "my another test";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter.grep).to.be.equal("my another test");
        });

        chunk("custom precise", () => {
            configMock.args.preciseMatch = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter.precise).to.be.true;
        });

        chunk("custom include", () => {
            const tmpPath = save_tmp_filter();
            configMock.args.include = tmpPath;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter.include).to.be.eql([{ id: "1_1" }]);
            expect(config.filter.precise).to.be.true;
            configMock.args.include = "test #1 | test #2";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter.include).to.be.eql([{ id: "test #1" }, { id: "test #2" }]);
            expect(config.filter.precise).to.be.false;
        });

        chunk("custom include from files", () => {
            const tmpPath = save_tmp_filter([
                {
                    id: "1_1",
                    passed_chunk_ids: [1, 2],
                },
                {
                    id: "2_1",
                },
                {
                    id: "2_2",
                    passed_chunk_ids: [3, 4],
                },
            ]);
            configMock.args.include = tmpPath;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.chunk.passedIds).to.be.eql([1, 2, 3, 4]);
        });

        chunk("custom exclude", () => {
            const tmpPath = save_tmp_filter();
            configMock.args.exclude = tmpPath;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter.exclude).to.be.eql([{ id: "1_1" }]);
            expect(config.filter.precise).to.be.true;
            configMock.args.exclude = "test #1 | test #2";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter.exclude).to.be.eql([{ id: "test #1" }, { id: "test #2" }]);
            expect(config.filter.precise).to.be.false;
        });

        chunk("filtered test ids", () => {
            process.env.GLACE_TEST_IDS = "1, 2";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.filter.testIds).to.be.eql([1, 2]);
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
            configMock.args.xunit = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.xunit.use).to.be.true;
        });

        chunk("custom path", () => {
            configMock.args.xunitPath = "my-xunit.xml";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.xunit.path).to.endWith("my-xunit.xml");
        });

        chunk("custom suite name", () => {
            configMock.args.xunitSuiteName = "my suite";
            config = rehire(CONFIG_PATH, OPTS);
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
            configMock.args.allure = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.allure.use).to.be.true;
        });

        chunk("custom dir", () => {
            configMock.args.allureDir = "my-allure";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.allure.dir).to.endWith("my-allure");
        });

        chunk("custom suiteName", () => {
            configMock.args.allureSuiteName = "my-suite";
            config = rehire(CONFIG_PATH, OPTS);
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
            configMock.args.testrail = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.testrail.use).to.be.true;
        });

        chunk("custom host", () => {
            configMock.args.testrailHost = "http://localhost";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.testrail.host).to.be.equal("http://localhost");
        });

        chunk("custom user", () => {
            configMock.args.testrailUser = "guest";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.testrail.user).to.be.equal("guest");
        });

        chunk("custom token", () => {
            configMock.args.testrailToken = "qwerty1234";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.testrail.token).to.be.equal("qwerty1234");
        });

        chunk("custom projectId", () => {
            configMock.args.testrailProjectId = "1234";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.testrail.projectId).to.be.equal("1234");
        });

        chunk("custom suiteId", () => {
            configMock.args.testrailSuiteId = "1234";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.testrail.suiteId).to.be.equal("1234");
        });

        chunk("custom runName", () => {
            configMock.args.testrailRunName = "my run";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.testrail.runName).to.be.equal("my run");
        });

        chunk("custom runDescription", () => {
            configMock.args.testrailRunDesc = "just a run";
            config = rehire(CONFIG_PATH, OPTS);
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
            configMock.args.pluginsDir = "my-plugins";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.plugins.dir).to.endWith("my-plugins");
        });

        chunk("enabled disableDefault", () => {
            configMock.args.disableDefaultPlugins = true;
            config = rehire(CONFIG_PATH, OPTS);
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
            configMock.args.listSteps = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.tools.stepsList).to.be.true;
            expect(config.tools.stepsFilter).to.be.null;
        });

        chunk("custom stepsFilter", () => {
            configMock.args.listSteps = "disable proxy";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.tools.stepsList).to.be.true;
            expect(config.tools.stepsFilter).to.be.equal("disable proxy");
        });

        chunk("enabled testsList", () => {
            configMock.args.listTests = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.tools.testsList).to.be.true;
            expect(config.tools.testsFilter).to.be.null;
        });

        chunk("custom testsFilter", () => {
            configMock.args.listTests = "disable proxy";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.tools.testsList).to.be.true;
            expect(config.tools.testsFilter).to.be.equal("disable proxy");
        });

        chunk("enabled fixturesList", () => {
            configMock.args.listFixtures = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.tools.fixturesList).to.be.true;
            expect(config.tools.fixturesFilter).to.be.null;
        });

        chunk("custom fixturesFilter", () => {
            configMock.args.listFixtures = "disable proxy";
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.tools.fixturesList).to.be.true;
            expect(config.tools.fixturesFilter).to.be.equal("disable proxy");
        });

        chunk("enabled pluginsList", () => {
            configMock.args.listPlugins = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.tools.pluginsList).to.be.true;
        });

        chunk("enabled checkTestrail", () => {
            configMock.args.testrailCheck = true;
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.tools.checkTestrail).to.be.true;
        });
    });

    test("activate plugin configs", () => {

        beforeChunk(() => {
            sandbox.stub(plugins, "getModules");
        });

        chunk(() => {
            config = rehire(CONFIG_PATH, OPTS);
            expect(plugins.getModules).to.be.calledOnce;
            expect(plugins.getModules.args[0][0]).to.be.equal("config");
        });
    });

    test("merge user config", () => {
        chunk(() => {
            configMock.args.userConfig = save_user_config();
            config = rehire(CONFIG_PATH, OPTS);
            expect(config.custom).to.be.equal("my field");
        });
    });

    test("interactive mode changes config", () => {

        beforeChunk(() => {
            configMock.args.i = true;
            configMock.args.g = "test";
            configMock.args.include = "test";
            configMock.args.exclude = "test";
            configMock.args.xunit = true;
            configMock.args.allure = true;
            configMock.args.testrail = true;
        });

        chunk(() => {
            config = rehire(CONFIG_PATH, OPTS);
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

const save_tmp_filter = data => {
    data = data || [{ id: "1_1" }];
    const tempPath = temp.path({ prefix: "test", suffix: ".json" });
    const tempData = JSON.stringify(data);
    fs.writeFileSync(tempPath, tempData);
    return tempPath;
};

const save_user_config = () => {
    const tempPath = temp.path({ prefix: "test", suffix: ".js" });
    const tempData = "module.exports = { custom: 'my field', };";
    fs.writeFileSync(tempPath, tempData);
    return tempPath;
};
