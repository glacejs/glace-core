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
});
