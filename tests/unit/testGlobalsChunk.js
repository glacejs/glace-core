"use strict";

const chunk_ = rewire("../../lib/globals/chunk");

suite("globals/chunk", () => {
    let conf;

    beforeChunk(() => {
        conf = {};
        chunk_.__set__("CONF", conf);
    });

    afterChunk(() => {
        chunk_.__reset__();
    });

    test("chunk()", () => {
        let it, _chunkCb;

        beforeChunk(() => {
            it = sinon.stub();
            chunk_.__set__("it", it);

            _chunkCb = sinon.stub();
            chunk_.__set__("_chunkCb", _chunkCb);

            conf.test = {
                id: 1,
            };
            conf.chunk = {
                id: 0,
                passedIds: [],
            };
            conf.retry = {
                id: 0,
                chunkIds: {},
                curChunkIds: [],
            };
        });

        chunk("with callback only", () => {
            const cb = () => {};
            chunk_(cb);

            expect(conf.retry.curChunkIds).to.be.eql(["1_1"]);

            expect(it).to.be.calledOnce;
            expect(it.args[0][0]).to.be.equal("");

            expect(_chunkCb).to.be.calledOnce;
            expect(_chunkCb.args[0][0]).to.be.equal("");
            expect(_chunkCb.args[0][1]).to.be.equal("1_1");
            expect(_chunkCb.args[0][2]).to.be.eql({});
            expect(_chunkCb.args[0][3]).to.be.equal(cb);
        });

        chunk("with name & callback", () => {
            const cb = () => {};
            chunk_("my chunk", cb);

            expect(it).to.be.calledOnce;
            expect(it.args[0][0]).to.be.equal("my chunk");

            expect(_chunkCb).to.be.calledOnce;
            expect(_chunkCb.args[0][0]).to.be.equal("my chunk");
        });

        chunk("with name, opts & callback", () => {
            const cb = () => {};
            chunk_("my chunk", { timeout: 1 }, cb);

            expect(it).to.be.calledOnce;
            expect(it.args[0][0]).to.be.equal("my chunk");

            expect(_chunkCb).to.be.calledOnce;
            expect(_chunkCb.args[0][2]).to.be.eql({ timeout: 1 });
            expect(_chunkCb.args[0][0]).to.be.equal("my chunk");
        });

        chunk("with opts & callback", () => {
            const cb = () => {};
            chunk_({ timeout: 1 }, cb);

            expect(it).to.be.calledOnce;
            expect(it.args[0][0]).to.be.equal("");

            expect(_chunkCb).to.be.calledOnce;
            expect(_chunkCb.args[0][0]).to.be.equal("");
        });

        chunk("skipped on session retry if chunk is passed already", () => {
            conf.chunk.passedIds.push("1_1");
            const cb = () => {};
            chunk_(cb);

            expect(it).to.not.be.called;
            expect(_chunkCb).to.not.be.called;
        });

        chunk("launched on session retry if not passed in previous session run", () => {
            conf.retry.id = 1;
            conf.retry.chunkIds = { 1: "1_1" };
            chunk_(() => {});
            expect(it).to.be.calledOnce;
        });

        chunk("skipped on session retry if passed in previous session run", () => {
            conf.retry.id = 1;
            chunk_(() => {});
            expect(it).to.not.be.called;
        });
    });

    test("_chunkCb()", () => {
        let _chunkCb;

        beforeChunk(() => {
            _chunkCb = chunk_.__get__("_chunkCb");

            conf.chunk = {
                curId: null,
            };
            conf.test = {
                curCase: {
                    addChunk: sinon.stub(),
                    skipChunk: null,
                },
            };
        });

        chunk("calls sync function", () => {
            expect(_chunkCb("my chunk", "1_1", {}, () => 1)()).to.be.equal(1);

            expect(conf.test.curCase.addChunk).to.be.calledOnce;
            expect(conf.test.curCase.addChunk.args[0][0]).to.be.equal("my chunk");
            expect(conf.test.curCase.skipChunk).to.be.null;
            expect(conf.chunk.curId).to.be.equal("1_1");
        });

        chunk("skips sync function", () => {
            expect(_chunkCb("my chunk", "1_1", {}, () => false)()).to.be.equal(false);

            expect(conf.test.curCase.addChunk).to.be.calledOnce;
            expect(conf.test.curCase.addChunk.args[0][0]).to.be.equal("my chunk");
            expect(conf.test.curCase.skipChunk).to.be.equal("my chunk");
            expect(conf.chunk.curId).to.be.equal("1_1");
        });

        chunk("calls async function", async () => {
            expect(await _chunkCb("my chunk", "1_1", {}, async () => 1)()).to.be.equal(1);

            expect(conf.test.curCase.addChunk).to.be.calledOnce;
            expect(conf.test.curCase.addChunk.args[0][0]).to.be.equal("my chunk");
            expect(conf.test.curCase.skipChunk).to.be.null;
            expect(conf.chunk.curId).to.be.equal("1_1");
        });

        chunk("calls async function", async () => {
            expect(await _chunkCb("my chunk", "1_1", {}, async () => false)()).to.be.equal(false);

            expect(conf.test.curCase.addChunk).to.be.calledOnce;
            expect(conf.test.curCase.addChunk.args[0][0]).to.be.equal("my chunk");
            expect(conf.test.curCase.skipChunk).to.be.equal("my chunk");
            expect(conf.chunk.curId).to.be.equal("1_1");
        });

        chunk("throws error if chunk is not under test", () => {
            conf.test = {};
            expect(_chunkCb("my chunk", "1_1", {}, () => 1)).to.throw();
        });

        chunk("sets execution retry", () => {
            const self = {
                retries: sinon.stub(),
            };
            _chunkCb("my chunk", "1_1", { retry: 1 }, () => 1).call(self);
            expect(self.retries).to.be.calledOnce;
            expect(self.retries.args[0][0]).to.be.equal(1);
        });

        chunk("sets execution timeout", () => {
            const self = {
                timeout: sinon.stub(),
            };
            _chunkCb("my chunk", "1_1", { timeout: 1 }, () => 1).call(self);
            expect(self.timeout).to.be.calledOnce;
            expect(self.timeout.args[0][0]).to.be.equal(1000);
        });
    });
});
