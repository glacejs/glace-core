"use strict";

suite("loader", () => {
    let loader,
        preloads,
        mainConftests,
        sessFunc,
        loadTests,
        fs,
        _require,
        _session = global.session,
        configMock = { session: { preloads: [] }, test: { dirs: [] }},
        sandbox = sinon.createSandbox();

    before(() => {
        global.session = sinon.stub();
        loader = rehire("../../lib/loader", {
            "./config": configMock, "./globals": null,
        });
        preloads = loader.__get__("preloads");
        mainConftests = loader.__get__("mainConftests");
        sessFunc = loader.__get__("sessFunc");
        loadTests = loader.__get__("loadTests");
        fs = loader.__get__("fs");
    });

    beforeChunk(() => {
        Object.keys(configMock).forEach(k => delete configMock[k]);
        configMock["session"] = { preloads: [] };
        configMock["test"] = { dirs: [] };
        _require = sinon.spy();
        _require.cache = {};
        loader.__set__("require", _require);
    });

    afterChunk(() => {
        configMock.session.preloads = [];
        configMock.session.rootConftest = null;
        configMock.session.killProcs = null;
        sandbox.restore();
        loader.__reset__();
    });

    test("import", () => {

        chunk("starts session", () => {
            expect(global.session).to.be.calledOnce;
            expect(global.session.args[0][0]).to.be.equal(sessFunc);
        });

        afterChunk(() => {
            global.session = _session;
        });
    });

    test("preloads()", () => {

        beforeChunk(() => {
            sandbox.stub(fs, "existsSync").returns(true);
            sandbox.stub(fs, "statSync").returns({ isFile: () => true });
            configMock.session.preloads = ["/path/to/my/preload"];
        });

        chunk("loads preloads", () => {
            preloads();
            expect(_require).to.be.calledOnce;
            expect(_require.args[0][0]).to.be.equal("/path/to/my/preload");
        });

        chunk("loads root conftest after preloads", () => {
            configMock.session.rootConftest = "/path/to/my/root/conftest";
            preloads();
            expect(_require).to.be.calledTwice;
            expect(_require.args[1][0]).to.be.equal("/path/to/my/root/conftest");
        });

        chunk("throws error if preload doesn't exist", () => {
            fs.existsSync.returns(false);
            expect(preloads).to.throw("isn't a file or doesn't exist");
        });

        chunk("throws error if preload isn't a file", () => {
            fs.statSync.returns({ isFile: () => false });
            expect(preloads).to.throw("isn't a file or doesn't exist");
        });
    });

    test("mainConftests()", () => {

        beforeChunk(() => {
            configMock.test.dirs = ["/path/to/test/dir"];
            sandbox.stub(fs, "existsSync").returns(true);
        });

        chunk("does nothing if no test targets", () => {
            configMock.test.dirs = [];
            mainConftests();
            expect(_require).to.not.be.called;
        });

        chunk("throws error if test target doesn't exist", () => {
            fs.existsSync.returns(false);
            expect(mainConftests).to.throw("doesn't exist");
        });

        chunk("does nothing if main conftest doesn't exist", () => {
            fs.existsSync.onCall(1).returns(false);
            mainConftests();
            expect(_require).to.not.be.called;
        });

        chunk("loads main conftest if it exists", () => {
            mainConftests();
            expect(_require).to.be.calledOnce;
            expect(_require.args[0][0]).to.be.equal("/path/to/test/conftest.js");
        });
    });

    test("sessFunc()", () => {
        let load_tests;

        beforeChunk(() => {
            configMock.test.dirs = ["/path/to/test/target"];
            configMock.session.killProcs = null;
            sandbox.stub(fs, "statSync").returns({ isDirectory: () => false });
            load_tests = sinon.stub();
            loader.__set__("loadTests", load_tests);
        });

        chunk("loads file", () => {
            sessFunc();
            expect(_require).to.be.calledOnce;
            expect(load_tests).to.not.be.called;
        });

        chunk("loads dir", () => {
            fs.statSync.returns({ isDirectory: () => true });
            sessFunc();
            expect(_require).to.not.be.called;
            expect(load_tests).to.be.calledOnce;
        });

        chunk("kill procs", async () => {
            configMock.session.killProcs = ["selenium"];
            const _before = sinon.spy();
            loader.__set__("before", _before);
            const U = loader.__get__("U");
            sandbox.stub(U, "killProcs");

            sessFunc();
            await _before.args[0][0]();
            expect(U.killProcs).to.be.calledOnce;
            expect(U.killProcs.args[0][0]).to.be.equal("selenium");
        });
    });

    test("loadTests()", () => {

        beforeChunk(() => {
            sandbox.stub(fs, "statSync").returns({
                isDirectory: () => false, isFile: () => true });
            sandbox.stub(fs, "readdirSync").returns(["item"]);
        });

        chunk("loads dir", () => {
            fs.statSync.returns({ isDirectory: () => true, isFile: () => false });
            const load_tests = sinon.spy();
            loader.__set__("loadTests", load_tests);

            loadTests("/path/to/dir");

            expect(load_tests).to.be.calledOnce;
            expect(load_tests.args[0][0]).to.be.equal("/path/to/dir/item");
            expect(_require).to.not.be.called;
        });

        chunk("loads test file", () => {
            fs.readdirSync.returns(["test.js"]);
            loadTests("/path/to/dir");
            expect(_require).to.be.calledOnce;
            expect(_require.args[0][0]).to.be.equal("/path/to/dir/test.js");
        });

        chunk("loads conftest", () => {
            fs.readdirSync.returns(["conftest.js"]);
            loadTests("/path/to/dir");
            expect(_require).to.be.calledOnce;
            expect(_require.args[0][0]).to.be.equal("/path/to/dir/conftest.js");
        });
    });

    test("reload()", () => {
        let reload;

        beforeChunk(() => {
            reload = loader.__get__("reload");
        });

        chunk("forcibly reloads module", () => {
            _require.cache = { "/my/path": null };
            reload("/my/path");
            expect(_require.cache).to.be.empty;
            expect(_require).to.be.calledOnce;
        });
    });
});
