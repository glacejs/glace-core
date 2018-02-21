"use strict";

var run = rewire("../../lib/run");

scope("run", () => {
    var fake;
    var sandbox = sinon.createSandbox();

    afterChunk(() => {
        sandbox.restore();
        run.__reset__();
    });

    test(".run()", () => {
        var hacking, _run;

        beforeChunk(() => {
            fake = {
                resetReport: sinon.spy(),
                _run: sinon.spy((_, cb) => cb()),
            };
        });

        beforeChunk(() => {
            run.__set__("resetReport", fake.resetReport);
            run.__set__("_run", fake._run);
            hacking = run.__get__("hacking");
            sandbox.stub(hacking, "suppressMochaUncaught");
        });

        chunk("with cb", done => {
            var cb = sinon.spy(done);
            run(cb);
            expect(fake.resetReport).to.be.calledOnce;
            expect(hacking.suppressMochaUncaught).to.be.calledOnce;
            expect(fake._run).to.be.calledOnce;
            expect(cb).to.be.calledOnce;
        });

        chunk("without cb", async () => {
            CONF.uncaught = "mocha";
            await run();
            expect(fake.resetReport).to.be.calledOnce;
            expect(hacking.suppressMochaUncaught).to.not.be.called;
            expect(fake._run).to.be.calledOnce;
        });
    });

    test("._run()", () => {
        var _run, mocha, fin, code;

        beforeChunk(() => {
            _run = run.__get__("_run");
            mocha = { run: sinon.spy(cb => cb(1)) };
            fin = sinon.spy(exitCode => code = exitCode);
        });

        chunk("returns passed code", () => {
            CONF.isRunPassed = true;
            _run(mocha, fin);
            expect(code).to.be.equal(0);
            expect(mocha.run).to.be.calledOnce;
            expect(fin).to.be.calledOnce;
        });

        chunk("returns failed code", () => {
            CONF.isRunPassed = false;
            _run(mocha, fin);
            expect(code).to.be.equal(1);
            expect(mocha.run).to.be.calledOnce;
            expect(fin).to.be.calledOnce;
        });
    });

    test(".resetReport()", () => {
        var fs, fse, resetReport;

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
