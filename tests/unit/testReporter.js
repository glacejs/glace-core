"use strict";

test("reporting system", () => {
    var reporters;
    var testrail = CONF.testrail;
    var xunit = CONF.xunit;

    var cleaner = () => {
        var modules = [
            "../../lib/plugins",
            "../../lib/reporter",
            "../../lib/reporter/base",
        ];
        for (var mod of modules) {
            delete require.cache[require.resolve(mod)];
        };
        CONF.testrail = testrail;
        CONF.xunit = xunit;
    };

    beforeChunk(() => {
        CONF.testrail = { use: false };
        CONF.xunit = { use: false };
        reporters = [];
        require("../../lib/reporter/base").register = r => reporters.push(r);
    });

    before(cleaner);
    afterChunk(cleaner);

    chunk("loads stdout reporter by default", () => {
        require("../../lib/reporter");
        expect(reporters).to.have.lengthOf(1);
    });

    chunk("loads testrail reporter if option is set", () => {
        CONF.testrail = { use: true };

        require("../../lib/reporter");
        expect(reporters).to.have.lengthOf(2);
    });

    chunk("loads xunit reporter if option is set", () => {
        CONF.xunit = { use: true };

        require("../../lib/reporter");
        expect(reporters).to.have.lengthOf(2);
    });

    chunk("loads plugin reporters if there are", () => {
        require("../../lib/plugins").getModules = sinon.stub().returns(["dummy-reporter"]);
        require("../../lib/reporter");

        expect(reporters).to.have.lengthOf(2);
        expect(reporters[1]).to.be.equal("dummy-reporter");
    });
});
