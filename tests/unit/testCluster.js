"use strict";

const cluster = rewire("../../lib/cluster");

suite("cluster", () => {

    afterChunk(() => {
        cluster.__reset__();
    });

    test(".launch()", () => {
        let resetArtifactsDir, killProcs, conf, fs, u,
            printArtifactsDir, calcExitCode, launchSlave;

        beforeChunk(() => {
            resetArtifactsDir = sinon.stub();
            cluster.__set__("resetArtifactsDir", resetArtifactsDir);

            killProcs = sinon.stub();
            cluster.__set__("killProcs", killProcs);

            cluster.__set__("process", { argv: ["./bin/glace", "/path/to/my/test"] });
            cluster.__set__("getTestIds", () => [1, 2, 3]);

            conf = {
                cluster: { slavesNum: 1 },
                report: { dir: "/path/to/report" },
            };
            cluster.__set__("CONF", conf);

            fs = {
                existsSync: sinon.stub().returns(true),
            };
            cluster.__set__("fs", fs);

            u = {
                clearEmptyFolders: sinon.stub(),
            };
            cluster.__set__("U", u);

            printArtifactsDir = sinon.stub();
            cluster.__set__("printArtifactsDir", printArtifactsDir);

            calcExitCode = sinon.stub().returns(1);
            cluster.__set__("calcExitCode", calcExitCode);

            launchSlave = sinon.stub().returns(resolve => resolve());
            cluster.__set__("launchSlave", launchSlave);
        });

        chunk("calls callback", async () => {
            const cb = sinon.stub();

            await cluster.launch(cb);
            expect(cb).to.be.calledOnce;
            expect(cb.args[0][0]).to.be.equal(1);

            expect(resetArtifactsDir).to.be.calledOnce;
            expect(killProcs).to.be.calledOnce;

            expect(launchSlave).to.be.calledOnce;
            expect(launchSlave.args[0][0]).to.be.equal(1);
            expect(launchSlave.args[0][1]).to.be.equal("./bin/glace");
            expect(launchSlave.args[0][2]).to.be.eql(["/path/to/my/test"]);
            expect(launchSlave.args[0][3]).to.be.eql([1, 2, 3]);

            expect(u.clearEmptyFolders).to.be.calledOnce;
            expect(u.clearEmptyFolders.args[0][0]).to.be.equal(conf.report.dir);

            expect(printArtifactsDir).to.be.calledOnce;
        });

        chunk("returns exit code", async () => {
            expect(await cluster.launch()).to.be.equal(1);

            expect(resetArtifactsDir).to.be.calledOnce;
            expect(killProcs).to.be.calledOnce;

            expect(launchSlave).to.be.calledOnce;
            expect(launchSlave.args[0][0]).to.be.equal(1);
            expect(launchSlave.args[0][1]).to.be.equal("./bin/glace");
            expect(launchSlave.args[0][2]).to.be.eql(["/path/to/my/test"]);
            expect(launchSlave.args[0][3]).to.be.eql([1, 2, 3]);

            expect(u.clearEmptyFolders).to.be.calledOnce;
            expect(u.clearEmptyFolders.args[0][0]).to.be.equal(conf.report.dir);

            expect(printArtifactsDir).to.be.calledOnce;
        });
    });

    test("killProcs()", () => {
        let killProcs, u, conf;

        beforeChunk(() => {
            killProcs = cluster.__get__("killProcs");

            u = {
                killProcs: sinon.stub(),
            };
            cluster.__set__("U", u);

            conf = {
                session: { killProcs: ["chrome"] },
            };
            cluster.__set__("CONF", conf);
        });

        chunk("kills required processes", async () => {
            await killProcs();
            expect(u.killProcs).to.be.calledOnce;
            expect(u.killProcs.args[0][0]).to.be.equal("chrome");
        });

        chunk("does nothing if no processes to kill", async () => {
            conf.session.killProcs = null;
            await killProcs();
            expect(u.killProcs).to.not.be.called;
        });
    });

    test("resetArtifactsDir()", () => {
        let resetArtifactsDir, conf, fs, fse;

        beforeChunk(() => {
            resetArtifactsDir = cluster.__get__("resetArtifactsDir");

            conf = {
                report: { clear: true },
                cluster: { artifactsDir: "/path/to/artifacts" },
            };
            cluster.__set__("CONF", conf);

            fs = {
                existsSync: sinon.stub(),
            };
            cluster.__set__("fs", fs);

            fse = {
                removeSync: sinon.stub(),
                mkdirsSync: sinon.stub(),
            };
            cluster.__set__("fse", fse);
        });

        chunk("doesn't remove artifacts dir if it is absent", () => {
            fs.existsSync.returns(false);
            conf.report.clear = true;
            resetArtifactsDir();
            expect(fse.removeSync).to.not.be.called;
            expect(fse.mkdirsSync).to.be.calledOnce;
            expect(fse.mkdirsSync.args[0][0]).to.be.equal("/path/to/artifacts");
        });

        chunk("doesn't remove artifacts dir if no config option", () => {
            fs.existsSync.returns(true);
            conf.report.clear = false;
            resetArtifactsDir();
            expect(fse.removeSync).to.not.be.called;
            expect(fse.mkdirsSync).to.be.calledOnce;
            expect(fse.mkdirsSync.args[0][0]).to.be.equal("/path/to/artifacts");
        });

        chunk("removes artifacts dir if it's required", () => {
            fs.existsSync.returns(true);
            conf.report.clear = true;
            resetArtifactsDir();
            expect(fse.removeSync).to.be.calledOnce;
            expect(fse.removeSync.args[0][0]).to.be.equal("/path/to/artifacts");
            expect(fse.mkdirsSync).to.be.calledOnce;
            expect(fse.mkdirsSync.args[0][0]).to.be.equal("/path/to/artifacts");
        });
    });

    test("printArtifactsDir()", () => {
        let printArtifactsDir, console_, conf;

        beforeChunk(() => {
            printArtifactsDir = cluster.__get__("printArtifactsDir");
            
            console_ = {
                log: sinon.stub(),
            };
            cluster.__set__("console", console_);

            conf = {
                cluster: { artifactsDir: "/path/to/artifacts" },
            };
            cluster.__set__("CONF", conf);
        });

        chunk(() => {
            printArtifactsDir();
            expect(console_.log).to.be.calledThrice;
            expect(console_.log.args[2][0]).to.include("Artifacts are in /path/to/artifacts");
        });
    });

    test("calcExitCode()", () => {
        let calcExitCode;

        beforeChunk(() => {
            calcExitCode = cluster.__get__("calcExitCode");
        });

        chunk("returns 0", () => {
            expect(calcExitCode([0, 0, 0])).to.be.equal(0);
        });

        chunk("returns sum of slave codes", () => {
            expect(calcExitCode([1, 2])).to.be.equal(3);
        });

        chunk("returns 255", () => {
            expect(calcExitCode([200, 220])).to.be.equal(255);
        });
    });

    test("getTestIds()", () => {
        let getTestIds, tools, conf;

        beforeChunk(() => {
            getTestIds = cluster.__get__("getTestIds");

            tools = {
                fakeLoad: sinon.stub(),
            };
            cluster.__set__("tools", tools);

            conf = {
                test: { cases: [{ id: 1 }, { id: 1 }, { id: 1 }] },
                cluster: { slavesNum: 2 },
            };
            cluster.__set__("CONF", conf);
        });

        chunk(() => {
            expect(getTestIds()).to.be.eql([[1, 1], [1]]);
            expect(tools.fakeLoad).to.be.calledOnce;
        });
    });

    test("launchSlave", () => {
        let launchSlave, fs, conf, spawn, endSlave, proc;

        beforeChunk(() => {
            launchSlave = cluster.__get__("launchSlave");

            cluster.__set__("process", { env: {} });

            fs = {
                createWriteStream: sinon.stub().returns("stream"),
            };
            cluster.__set__("fs", fs);

            conf = {
                cluster: { artifactsDir: "/path/to/artifacts" },
            };
            cluster.__set__("CONF", conf);

            proc = {
                stdout: { pipe: sinon.stub() },
                stderr: { pipe: sinon.stub() },
                on: sinon.stub(),
            };

            spawn = sinon.stub().returns(proc);
            cluster.__set__("spawn", spawn);

            endSlave = sinon.stub();
            cluster.__set__("endSlave", endSlave);
        });

        chunk(() => {
            const resolve = () => {};
            launchSlave(1, "./bin/glace", "/path/to/tests", [1, 2, 3])(resolve);

            expect(fs.createWriteStream).to.be.calledOnce;
            expect(fs.createWriteStream.args[0][0]).to.be.equal("/path/to/artifacts/slave-1.stdout");

            expect(proc.stdout.pipe).to.be.calledOnce;
            expect(proc.stdout.pipe.args[0][0]).to.be.equal("stream");

            expect(proc.stderr.pipe).to.be.calledOnce;
            expect(proc.stderr.pipe.args[0][0]).to.be.equal("stream");

            expect(proc.on).to.be.calledOnce;
            expect(proc.on.args[0]).to.have.length(2);
            expect(proc.on.args[0][0]).to.be.equal("close");

            expect(endSlave).to.be.calledOnce;
            expect(endSlave.args[0]).to.eql([resolve, 1]);
        });
    });

    test("endSlave()", () => {
        let endSlave, resolve, console_;

        beforeChunk(() => {
            endSlave = cluster.__get__("endSlave");

            resolve = sinon.stub();

            console_ = {
                log: sinon.stub(),
            };
            cluster.__set__("console", console_);
        });

        chunk("with succeeded exit code", () => {
            endSlave(resolve, 1)(0);
            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("Slave #1 is succeeded");

            expect(resolve).to.be.calledOnce;
            expect(resolve.args[0][0]).to.be.equal(0);
        });

        chunk("with failed exit code", () => {
            endSlave(resolve, 1)(1);
            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("Slave #1 is failed with code 1");

            expect(resolve).to.be.calledOnce;
            expect(resolve.args[0][0]).to.be.equal(1);
        });
    });
});
