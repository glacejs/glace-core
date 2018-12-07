"use strict";

const utils = rewire("../../lib/utils");

suite("utils", () => {

    afterChunk(() => {
        utils.__reset__();
    });

    test(".setLog()", () => {
        let log, conf;

        beforeChunk(() => {
            log = {
                setFile: sinon.stub(),
            };
            utils.__set__("LOG", log);

            conf = {
                report: {
                    dir: "/path/to/report",
                    testDir: "/path/to/report/tests/my-test",
                },
            };
            utils.__set__("CONF", conf);
        });

        chunk("record logs to test dir", () => {
            utils.setLog();
            expect(log.setFile).to.be.calledOnce;
            expect(log.setFile.args[0][0]).to.be.equal("/path/to/report/tests/my-test/logs/test.log");
        });

        chunk("record logs to common dir", () => {
            delete conf.report.testDir;
            utils.setLog();
            expect(log.setFile).to.be.calledOnce;
            expect(log.setFile.args[0][0]).to.be.equal("/path/to/report/logs/test.log");
        });
    });

    test(".accountError()", () => {
        let conf;

        beforeChunk(() => {
            conf = {
                test: {},
                session: {
                    errors: [],
                },
            };
            utils.__set__("CONF", conf);
        });

        chunk("logs session error if no tests are run", () => {
            utils.accountError(null, {
                message: "error message",
                stack: "error stack",
                seleniumStack: { "selenium": "error" },
            });

            expect(conf.session.errors).to.have.length(1);

            const errMsg = conf.session.errors[0];
            expect(errMsg).to.startWith("message: error message");
            expect(errMsg).to.include("error stack");
            expect(errMsg).to.include("selenium");
        });

        chunk("logs test error if tests are present", () => {
            conf.test.curCase = {
                addError: sinon.spy(),
                testParams: { lang: "ru" },
            };

            utils.accountError("my chunk", {
                message: "error message",
                stack: "error stack",
                seleniumStack: { "selenium": "error" },
            });

            expect(conf.test.curCase.addError).to.be.calledOnce;

            const errMsg = conf.test.curCase.addError.args[0][0];
            expect(errMsg).to.startWith("my chunk");
            expect(errMsg).to.include("lang");
            expect(errMsg).to.include("message: error message");
            expect(errMsg).to.include("error stack");
            expect(errMsg).to.include("selenium");
        });
    });

    test("getDoc()", () => {

        chunk("when doc is", () => {
            const func = function () {
                /**
                 * Hello world!
                 */
                return;
            };
            expect(utils.getDoc(func)).to.be.equal("  /**\n   * Hello world!\n   */");
        });

        chunk("when no doc", () => {
            expect(utils.getDoc(() => {})).to.be.empty;
        });

        chunk("when doc is empty", () => {
            const func = function () {
                /** */
                return;
            };
            expect(utils.getDoc(func)).to.be.empty;
        });
    });
});
