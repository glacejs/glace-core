"use strict";

const TESTRAIL_PATH = "../../lib/reporter/testrail";

suite("reporter/testrail", () => {

    test("import", () => {

        chunk("throws exception if no testrail host", () => {
            CONF.testrail.host = null;
            expect(() => rewire(TESTRAIL_PATH)).to.throw("'host' isn't specified");
        });

        chunk("throws exception if no testrail user", () => {
            CONF.testrail.host = "http://testrail";
            CONF.testrail.user = null;
            expect(() => rewire(TESTRAIL_PATH)).to.throw("'user' isn't specified");
        });
    });
});
