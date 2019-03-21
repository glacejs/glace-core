"use strict";

const scope_ = rehire("../../lib/globals/scope");

suite("globals/scope", () => {

    afterChunk(() => {
        scope_.__reset__();
    });

    test("scope()", () => {
        let describe, scopeCb;

        beforeChunk(() => {
            describe = sinon.stub();
            scope_.__set__("describe", describe);

            scopeCb = sinon.stub();
            scope_.__set__("scopeCb", scopeCb);
        });

        chunk("with name & callback", () => {
            const cb = () => {};
            scope_("my scope", cb);

            expect(describe).to.be.calledOnce;
            expect(describe.args[0][0]).to.be.equal("my scope");

            expect(scopeCb).to.be.calledOnce;
            expect(scopeCb.args[0][0]).to.be.eql([]);
            expect(scopeCb.args[0][1]).to.be.eql({});
            expect(scopeCb.args[0][2]).to.be.equal(cb);
        });

        chunk("with name, fixtures & callback", () => {
            const cb = () => {};
            scope_("my scope", ["my fixture"], cb);

            expect(describe).to.be.calledOnce;
            expect(describe.args[0][0]).to.be.equal("my scope");

            expect(scopeCb).to.be.calledOnce;
            expect(scopeCb.args[0][0]).to.be.eql(["my fixture"]);
            expect(scopeCb.args[0][1]).to.be.eql({});
            expect(scopeCb.args[0][2]).to.be.equal(cb);
        });

        chunk("with name, options & callback", () => {
            const cb = () => {};
            scope_("my scope", { chunkRetry: 2 }, cb);

            expect(describe).to.be.calledOnce;
            expect(describe.args[0][0]).to.be.equal("my scope");

            expect(scopeCb).to.be.calledOnce;
            expect(scopeCb.args[0][0]).to.be.eql([]);
            expect(scopeCb.args[0][1]).to.be.eql({ chunkRetry: 2 });
            expect(scopeCb.args[0][2]).to.be.equal(cb);
        });

        chunk("with name, fixtures, options & callback", () => {
            const cb = () => {};
            scope_("my scope", ["my fixture"], { chunkRetry: 1 }, cb);

            expect(describe).to.be.calledOnce;
            expect(describe.args[0][0]).to.be.equal("my scope");

            expect(scopeCb).to.be.calledOnce;
            expect(scopeCb.args[0][0]).to.be.eql(["my fixture"]);
            expect(scopeCb.args[0][1]).to.be.eql({ chunkRetry: 1 });
            expect(scopeCb.args[0][2]).to.be.equal(cb);
        });
    });

    test("scopeCb()", () => {
        let scopeCb, u;

        beforeChunk(() => {
            scopeCb = scope_.__get__("scopeCb");

            u = {
                wrap: sinon.stub().returns(() => {}),
            };
            scope_.__set__("U", u);
        });

        chunk("calls callback with fixtures", () => {
            const cb = () => {};
            scopeCb(["my fixture func"], {}, cb)();
            expect(u.wrap).to.be.calledOnce;
            expect(u.wrap.args[0][0]).to.be.eql(["my fixture func"]);
            expect(u.wrap.args[0][1]).to.be.equal(cb);
        });

        chunk("sets chunk retry option", () => {
            const self = {
                retries: sinon.stub(),
            };
            scopeCb([], { chunkRetry: 1 }, () => {}).call(self);
            expect(self.retries).to.be.calledOnce;
            expect(self.retries.args[0][0]).to.be.equal(1);
        });

        chunk("sets chunk timeout option", () => {
            const self = {
                timeout: sinon.stub(),
            };
            scopeCb([], { chunkTimeout: 1 }, () => {}).call(self);
            expect(self.timeout).to.be.calledOnce;
            expect(self.timeout.args[0][0]).to.be.equal(1000);
        });
    });
});
