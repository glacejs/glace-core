"use strict";

const run = rewire("../../lib/run");

suite("run", () => {
    let fake;
    const sandbox = sinon.createSandbox();

    afterChunk(() => {
        sandbox.restore();
        run.__reset__();
    });

    test(".run()", () => {
        let hacking, utils, conf, tools, cluster;

        beforeChunk(() => {
            fake = {
                resetReport: sinon.spy(),
                _run: sinon.spy((_, cb) => cb()),
            };

            utils = {
                setLog: sinon.stub(),
            };
            run.__set__("utils", utils);

            conf = {
                session: {},
                chunk: {},
                test: {},
                tools: {},
                cluster: {},
                filter: {},
            };
            run.__set__("CONF", conf);

            tools = {
                printSteps: sinon.stub(),
                printFixtures: sinon.stub(),
                printTests: sinon.stub(),
                printPlugins: sinon.stub(),
                checkTestrail: sinon.stub(),
            };
            run.__set__("tools", tools);

            cluster = {
                launch: sinon.stub(),
            };
            run.__set__("cluster", cluster);
        });

        beforeChunk(() => {
            run.__set__("resetReport", fake.resetReport);
            run.__set__("_run", fake._run);
            hacking = run.__get__("hacking");
            sandbox.stub(hacking, "suppressMochaUncaught");
        });

        chunk("with cb", done => {
            const cb = sinon.spy(done);
            run(cb);
            expect(fake.resetReport).to.be.calledOnce;
            expect(hacking.suppressMochaUncaught).to.be.calledOnce;
            expect(fake._run).to.be.calledOnce;
            expect(cb).to.be.calledOnce;
        });

        chunk("without cb", async () => {
            conf.session = { uncaughtException: "mocha" };
            await run();
            expect(fake.resetReport).to.be.calledOnce;
            expect(hacking.suppressMochaUncaught).to.not.be.called;
            expect(fake._run).to.be.calledOnce;
        });

        chunk("prints steps", () => {
            conf.tools = { stepsList: true, stepsFilter: "my steps" };
            run(() => {});
            expect(tools.printSteps).to.be.calledOnce;
            expect(tools.printSteps.args[0][0]).to.be.equal("my steps");
        });

        chunk("prints fixtures", () => {
            conf.tools = { fixturesList: true, fixturesFilter: "my fixtures" };
            run(() => {});
            expect(tools.printFixtures).to.be.calledOnce;
            expect(tools.printFixtures.args[0][0]).to.be.equal("my fixtures");
        });

        chunk("prints tests", () => {
            conf.tools = { testsList: true, testsFilter: "my tests" };
            run(() => {});
            expect(tools.printTests).to.be.calledOnce;
            expect(tools.printTests.args[0][0]).to.be.equal("my tests");
        });

        chunk("checks testrail consistency", () => {
            conf.tools = { checkTestrail: true };
            const cb = () => {};
            run(cb);
            expect(tools.checkTestrail).to.be.calledOnce;
            expect(tools.checkTestrail.args[0][0]).to.be.equal(cb);
        });

        chunk("prints plugins", () => {
            conf.tools = { pluginsList: true };
            const cb = () => {};
            run(cb);
            expect(tools.printPlugins).to.be.calledOnce;
            expect(tools.printPlugins.args[0][0]).to.be.equal(cb);
        });

        chunk("launches cluster", () => {
            conf.cluster = { isMaster: true };
            const cb = () => {};
            run(cb);
            expect(cluster.launch).to.be.calledOnce;
            expect(cluster.launch.args[0][0]).to.be.equal(cb);
        });
    });

    test("._run()", () => {
        let _run, mocha, fin, code;

        beforeChunk(() => {
            _run = run.__get__("_run");
            mocha = { run: sinon.spy(cb => cb(1)) };
            fin = sinon.spy(exitCode => code = exitCode);
        });

        chunk("returns passed code", () => {
            CONF.session.isPassed = true;
            _run(mocha, fin);
            expect(code).to.be.equal(0);
            expect(mocha.run).to.be.calledOnce;
            expect(fin).to.be.calledOnce;
        });

        chunk("returns failed code", () => {
            CONF.session.isPassed = false;
            _run(mocha, fin);
            expect(code).to.be.equal(1);
            expect(mocha.run).to.be.calledOnce;
            expect(fin).to.be.calledOnce;
        });

        chunk("return forced failed code", () => {
            mocha.run = sinon.spy(cb => cb(0));
            CONF.session.isPassed = false;
            _run(mocha, fin);
            expect(code).to.be.equal(1);
            expect(mocha.run).to.be.calledOnce;
            expect(fin).to.be.calledOnce;
        });
    });

    test(".resetReport()", () => {
        let fs, fse, resetReport;

        beforeChunk(() => {
            resetReport = run.__get__("resetReport");
            fs = run.__get__("fs");
            fse = run.__get__("fse");
            sandbox.stub(fs, "existsSync").returns(true);
            sandbox.stub(fse, "removeSync");
            sandbox.stub(fse, "mkdirsSync");
        });

        chunk("removes report dir", () => {
            resetReport();
            expect(fs.existsSync).to.be.calledOnce;
            expect(fse.removeSync).to.be.calledOnce;
            expect(fse.mkdirsSync).to.be.calledOnce;
        });

        chunk("doesn't remove report dir", () => {
            fs.existsSync.returns(false);
            resetReport();
            expect(fs.existsSync).to.be.calledOnce;
            expect(fse.removeSync).to.not.be.called;
            expect(fse.mkdirsSync).to.be.calledOnce;
        });
    });
});
