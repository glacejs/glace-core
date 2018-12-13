"use strict";

const Steps = rewire("../../lib/steps");

const obj1 = {
    method1: function () {},
};

const obj2 = {
    method2: function () {},
};

suite("Steps", () => {
    let steps;

    before(() => {
        steps = new Steps();
    });

    beforeChunk(() => {
        steps.stopTimer();
    });

    afterChunk(() => {
        Steps.__reset__();
    });

    test(".register()", () => {

        chunk("should register steps", () => {
            Steps.register(obj1, obj2);
            expect(Steps.prototype.method1).to.be.a("function");
            expect(Steps.prototype.method2).to.be.a("function");
        });
    });

    test(".getInstance() returns object which", () => {
        let cls, conf, console_;

        beforeChunk(() => {
            cls = function () {
                this.prop = 1;
            };
            cls.prototype.debug = sinon.spy();
            cls.prototype.method = sinon.stub().returns(1);

            conf = {
                session: {
                    debugOnFail: true,
                },
            };

            console_ = {
                log: sinon.spy(),
            };

            Steps.__set__("CONF", conf);
            Steps.__set__("console", console_);
        });

        chunk("has non-modified properties", () => {
            expect(Steps.getInstance(cls).prop).to.be.equal(new cls().prop);
            Steps.__set__("Steps", function () { this.prop = 1; });
            expect(Steps.getInstance().prop).to.be.equal(1);
        });

        chunk("has non-modified 'debug' method", () => {
            expect(Steps.getInstance(cls).debug).to.be.equal(new cls().debug);
        });

        chunk("has non-modified methods if debug mode is disabled", () => {
            conf.session.debugOnFail = false;
            expect(Steps.getInstance(cls).method).to.be.equal(new cls().method);
        });

        chunk("has wrapped methods if debug mode is enabled", async () => {
            expect(Steps.getInstance(cls).method).to.not.be.equal(new cls().method);
            expect(await Steps.getInstance(cls).method()).to.be.equal(new cls().method());
        });

        chunk("has wrapped methods which launch 'debug' method on exception", async () => {
            cls.prototype.method.throws(Error("BOOM!"));
            await expect(Steps.getInstance(cls).method()).to.be.rejectedWith("BOOM!");
            expect(cls.prototype.debug).to.be.calledOnce;
            expect(console_.log).to.be.calledOnce;
            expect(console_.log.args[0][0]).to.include("BOOM!");
        });
    });

    test(".resetCtx()", () => {

        chunk(() => {
            steps.ctx = { a: 1 };
            steps.resetCtx();
            expect(steps.ctx).to.be.eql({});
        });
    });

    test(".isTestFailed()", () => {
        let conf;

        beforeChunk(() => {
            conf = {
                test: {},
            };

            Steps.__set__("CONF", conf);
        });

        chunk("returns undefined if no test case", () => {
            expect(steps.isTestFailed()).to.be.undefined;
        });

        chunk("returns false if no test errors", () => {
            conf.test.curCase = { errors: [] };
            expect(steps.isTestFailed()).to.be.false;
        });

        chunk("returns true if there are test errors", () => {
            conf.test.curCase = { errors: ["BOOM!"] };
            expect(steps.isTestFailed()).to.be.true;
        });
    });

    test(".listSteps()", () => {
        let tools;

        beforeChunk(() => {
            tools = {
                printSteps: sinon.spy(),
            };

            Steps.__set__("tools", tools);
        });

        chunk(() => {
            steps.listSteps("hello", "world");
            expect(tools.printSteps).to.be.calledOnce;
            expect(tools.printSteps.args[0][0]).to.be.equal("hello");
            expect(tools.printSteps.args[0][1]).to.be.equal("world");
        });
    });

    test(".debug()", () => {
        let U, setupDebug, conf;

        beforeChunk(() => {
            U = {
                debug: sinon.spy(),
            };

            setupDebug = sinon.stub().returns("help message");

            conf = {
                session: { debugOnFail: true },
            };

            Steps.__set__("CONF", conf);
            Steps.__set__("U", U);
            Steps.__set__("setupDebug", setupDebug);
        });

        chunk(async () => {
            await steps.debug();
            expect(conf.session.debugOnFail).to.be.true;
            expect(U.debug).to.be.calledOnce;
            expect(U.debug.args[0][0]).to.be.equal("help message");
            expect(setupDebug).to.be.calledOnce;
        });
    });

    test(".startTimer()", () => {

        chunk("should start timer", () => {
            steps.startTimer();
            expect(steps._timer).to.exist.and.be.lte(new Date);
        });
    });

    test(".stopTimer()", () => {

        chunk("should stop timer", () => {
            steps.startTimer();
            steps.stopTimer();
            expect(steps._timer).to.not.exist;
        });
    });

    test(".checkTimer()", () => {

        chunk("throws error if timer isn't started", () => {
            expect(steps.checkTimer).to.throw();
        });
    
        chunk("matches condition", () => {
            steps.startTimer();
            steps.checkTimer("to exist");
            steps.checkTimer({ lte: 1 });
        });
    
        chunk("throws error if it doesn't match condition", () => {
            steps.startTimer();
            expect(() => steps.checkTimer({ gte: 1000 })).to.throw();
        });
    });

    test(".pause()", () => {

        chunk("sleeps", async () => {
            steps.startTimer();
            await steps.pause(0.1, "sleep");
            steps.checkTimer({ gte: 0.1 });
        });
    
        chunk("throws error if message isn't specified", async () => {
            await expect(steps.pause(0.1)).to.be.rejected;
        });
    });

    test("setupDebug()", () => {
        let setupDebug, global_;

        beforeChunk(() => {
            setupDebug = Steps.__get__("setupDebug");

            global_ = {};
            Steps.__set__("global", global_);

            Steps.__set__("$", {
                listSteps: function () { return "list of steps"; },
            });
        });

        chunk(() => {
            expect(setupDebug()).to.include("- search");
            expect(global_.search()).to.be.equal("list of steps");
            global_.doc((() => {}));
            global_.doc(() => {
                /**
                 * My func.
                 */
            });
            expect(global_.doc).to.be.a("function");
        });
    });
});
