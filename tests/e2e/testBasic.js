"use strict";

var sinon = require("sinon");

test("It should be passed", () => {
    chunk("My chunk", () => {});
});

test("It should be failed", () => {
    chunk("My chunk", () => {
        throw new Error("BOOM!");
    });
});

test("It shouldn't have chunk name", () => {
    chunk(() => {});
});

test("It should have two passed chunks", () => {
    chunk("My chunk #1", () => {});
    chunk("My chunk #2", () => {});
});

test("It should have one failed & one passed chunk", () => {
    chunk("My chunk #1", () => {
        throw new Error("BOOM!");
    });
    chunk("My chunk #2", () => {});
});

test("It should iterate tested languages", ctx => {
    forEachLanguage(ctx, { languages: [ "ru", "ee", "en" ] }, lang => {
        chunk(() => {
            expect(CONF.curTestCase.testParams.language).to.be.equal(lang);
        });
    });
});

var spy = sinon.spy();
var myFixture = func => {
    before(spy);
    func();
};

test("It should involve fixture", null /* options */, [myFixture], () => {
    chunk(() => {
        expect(spy.calledOnce).to.be.true;
    });
});

test("It should involve fixture in iterator", ctx => {

    var languages = ["ru", "ee", "en"];
    var spy = sinon.spy();
    var myFixture = func => {
        before(spy);
        func();
    };

    forEachLanguage(ctx, { languages: languages }, [myFixture], () => {
        chunk(() => {});
    });

    after(() => {
        expect(spy.callCount).to.be.equal(languages.length);
    });
});

test("It should be skipped with reason",
     { skip: true,
       skipReason: "bug https://bug.tracker.io/BUG-1001" }, () => {
    chunk(() => {});
});

test("It should be skipped without reason", { skip: true }, () => {
    chunk(() => {});
});

var i = 0;
var retry = 3;
test(`It should be retried ${retry} times`, { retry: retry }, () => {
    chunk(() => {
        if (i < retry) {
            i++;
            throw new Error("BOOM!");
        };
    });
});
