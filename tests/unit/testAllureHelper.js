"use strict";

const Step = require("allure-js-commons/beans/step");

suite("allure helper", () => {
    let allure,
        sandbox = sinon.createSandbox();

    afterChunk(() => {
        sandbox.restore();
        allure.__reset__();
    });

    scope("fake", () => {

        before(() => {
            CONF.allure.use = false;
            allure = rewire("../../lib/allure");
        });

        test("proxy instance", () => {
            chunk(() => {
                for (const m of ["hasSteps",
                                 "step",
                                 "pass",
                                 "story",
                                 "feature",
                                 "attach",
                                 "attachJson",
                                 "attachImage",
                                 "attachVideo",
                                 "attachText",
                                 "attachHtml",
                                 "addEnvironment",
                                 "addDescription",
                                 "isTestStarted"]) {
                    expect(allure[m]()).to.be.undefined;
                }
            });
        });
    });
    
    scope("real", () => {

        before(() => {
            CONF.allure.use = true;
            allure = rewire("../../lib/allure");
        });

        after(() => {
            CONF.allure.use = false;
        });

        beforeChunk(() => {
            sandbox.stub(allure, "isTestStarted");
            sandbox.stub(allure, "attach");
            sandbox.stub(allure.__get__("fs"), "readFileSync").returns("file content");
        });

        test("instance", () => {
            chunk(() => {
                expect(allure.options.targetDir).to.be.equal(CONF.allure.dir);
            });
        });

        test(".hasSteps()", () => {

            chunk("is true", () => {
                sandbox.stub(allure, "getCurrentSuite").returns({ currentStep: new Step() });

                expect(allure.hasSteps()).to.be.true;
            });

            chunk("is false", () => {
                sandbox.stub(allure, "getCurrentSuite").returns({});
                expect(allure.hasSteps()).to.be.false;
            });
        });

        test(".isTestStarted()", () => {

            beforeChunk(() => {
                allure.isTestStarted.restore();
            });

            chunk("is true", () => {
                sandbox.stub(allure, "getCurrentSuite").returns({});
                sandbox.stub(allure, "getCurrentTest").returns({});
                expect(allure.isTestStarted()).to.be.true;
            });

            chunk("is false if no current suite", () => {
                sandbox.stub(allure, "getCurrentSuite");
                sandbox.stub(allure, "getCurrentTest").returns({});
                expect(allure.isTestStarted()).to.be.false;
            });

            chunk("is false if no current test", () => {
                sandbox.stub(allure, "getCurrentSuite").returns({});
                sandbox.stub(allure, "getCurrentTest");
                expect(allure.isTestStarted()).to.be.false;
            });

            chunk("is false if test status is set", () => {
                sandbox.stub(allure, "getCurrentSuite").returns({});
                sandbox.stub(allure, "getCurrentTest").returns({ status: "passed" });
                expect(allure.isTestStarted()).to.be.false;
            });
        });

        test(".step()", () => {

            beforeChunk(() => {
                sandbox.stub(allure, "startStep");
            });

            chunk("starts step", () => {
                allure.isTestStarted.returns(true);
                allure.step("my step");
                expect(allure.startStep).to.be.calledOnce;
                expect(allure.startStep.args[0][0]).to.be.equal("my step");
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.step("my step");
                expect(allure.startStep).to.not.be.called;
            });
        });

        test(".pass()", () => {

            beforeChunk(() => {
                sandbox.stub(allure, "endStep");
            });

            chunk("passes step", () => {
                allure.isTestStarted.returns(true);
                allure.pass();
                expect(allure.endStep).to.be.calledOnce;
                expect(allure.endStep.args[0][0]).to.be.equal(allure.PASSED);
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.pass();
                expect(allure.endStep).to.not.be.called;
            });
        });

        test(".story()", () => {
            let addLabel;

            beforeChunk(() => {
                addLabel = sinon.stub();
                sandbox.stub(allure, "getCurrentTest").returns({ addLabel });
            });

            chunk("adds story", () => {
                allure.isTestStarted.returns(true);
                allure.story("my story");
                expect(addLabel).to.be.calledOnce;
                expect(addLabel.args[0][0]).to.be.equal("story");
                expect(addLabel.args[0][1]).to.be.equal("my story");
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.story("my story");
                expect(addLabel).to.not.be.called;
            });
        });

        test(".feature()", () => {
            let addLabel;

            beforeChunk(() => {
                addLabel = sinon.stub();
                sandbox.stub(allure, "getCurrentTest").returns({ addLabel });
            });

            chunk("adds feature", () => {
                allure.isTestStarted.returns(true);
                allure.feature("my feature");
                expect(addLabel).to.be.calledOnce;
                expect(addLabel.args[0][0]).to.be.equal("feature");
                expect(addLabel.args[0][1]).to.be.equal("my feature");
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.feature("my feature");
                expect(addLabel).to.not.be.called;
            });
        });

        test(".addEnvironment()", () => {
            let addParameter;

            beforeChunk(() => {
                addParameter = sinon.stub();
                sandbox.stub(allure, "getCurrentTest").returns({ addParameter });
            });

            chunk("adds environment value", () => {
                allure.isTestStarted.returns(true);
                allure.addEnvironment("a", "b");
                expect(addParameter).to.be.calledOnce;
                expect(addParameter.args[0][0]).to.be.equal("environment-variable");
                expect(addParameter.args[0][1]).to.be.equal("a");
                expect(addParameter.args[0][2]).to.be.equal("b");
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.addEnvironment("a", "b");
                expect(addParameter).to.not.be.called;
            });
        });

        test(".addDescription()", () => {
            let setDescription;

            beforeChunk(() => {
                setDescription = sinon.stub();
                sandbox.stub(allure, "getCurrentTest").returns({ setDescription });
            });

            chunk("adds description", () => {
                allure.isTestStarted.returns(true);
                allure.addDescription("hello", "text/plain");
                expect(setDescription).to.be.calledOnce;
                expect(setDescription.args[0][0]).to.be.equal("hello");
                expect(setDescription.args[0][1]).to.be.equal("text/plain");
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.addDescription("hello");
                expect(setDescription).to.not.be.called;
            });
        });

        test(".attach()", () => {

            beforeChunk(() => {
                allure.attach.restore();
                sandbox.stub(allure, "addAttachment");
            });

            chunk("attaches content", () => {
                allure.isTestStarted.returns(true);
                allure.attach("a", "b", "c");
                expect(allure.addAttachment).to.be.calledOnce;
                expect(allure.addAttachment.args[0]).to.be.eql(["a", Buffer.from("b"), "c"]);
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.attach("a", "b", "c");
                expect(allure.addAttachment).to.not.be.called;
            });
        });

        test(".attachJson()", () => {

            chunk("attaches json", () => {
                allure.isTestStarted.returns(true);
                allure.attachJson("my json", { a: 1 });
                expect(allure.attach).to.be.calledOnce;
                expect(allure.attach.args[0])
                    .to.be.eql(["my json", JSON.stringify({ a: 1 }, null, "  "), "application/json"]);
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.attachJson("my json", { a: 1 });
                expect(allure.attach).to.not.be.called;
            });
        });

        test(".attachImage()", () => {

            chunk("attaches image", () => {
                allure.isTestStarted.returns(true);
                allure.attachImage("my image", "/path/to/my/image");
                expect(allure.attach).to.be.calledOnce;
                expect(allure.attach.args[0])
                    .to.be.eql(["my image", "file content", "image/png"]);
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.attachImage("my image", "/path/to/my/image");
                expect(allure.attach).to.not.be.called;
            });
        });

        test(".attachVideo()", () => {

            chunk("attaches video", () => {
                allure.isTestStarted.returns(true);
                allure.attachVideo("my video", "/path/to/my/video");
                expect(allure.attach).to.be.calledOnce;
                expect(allure.attach.args[0])
                    .to.be.eql(["my video", "file content", "video/mp4"]);
            });

            chunk("does nothing", () => {
                allure.isTestStarted.returns(false);
                allure.attachVideo("my video", "/path/to/my/video");
                expect(allure.attach).to.not.be.called;
            });
        });

        test("attachText", () => {
            chunk(() => {
                allure.attachText("my text", "hello world");
                expect(allure.attach).to.be.calledOnce;
                expect(allure.attach.args[0])
                    .to.be.eql(["my text", "hello world", "text/plain"]);
            });
        });

        test("attachHtml", () => {
            chunk(() => {
                allure.attachHtml("my html", "hello world")
                expect(allure.attach).to.be.calledOnce;
                expect(allure.attach.args[0])
                    .to.be.eql(["my html", "hello world", "application/html"]);
            });
        });
    });
});
