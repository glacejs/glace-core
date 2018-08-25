"use strict";

suite("matcher", () => {

    test(".waitFor()", () => {
        let now;

        before(() => {
            now = new Date().getTime();
        });

        chunk("passed", async () => {
            let i = 0;
            await expect(() => i++).to.waitFor({ "to be equal": 5 });
            expect(new Date().getTime() - now).to.be.gte(500).and.below(1100);
        });

        chunk("passed for async predicate", async () => {
            const p = () => new Promise(resolve => setTimeout(() => resolve(5), 500));
            await expect(p).to.waitFor({ "to be equal": 5 });
            expect(new Date().getTime() - now).to.be.gte(500).and.below(1100);
        });

        chunk("failed", async () => {
            await expect(expect(() => 0).to.waitFor({ "to be equal": 5 }))
                .to.be.rejectedWith("expected 0 to equal 5");
            expect(new Date().getTime() - now).to.be.gte(1000);
        });
    });

    test(".correspond()", () => {

        chunk("passes custom message", () => {
            expect(() => expect(1).to.correspond({ "to be equal": 2 }, "wrong values")).to.throw("wrong values");
        });

        chunk("should contain only one key-value pair", () => {
            expect(() => expect(1).to.correspond({ "to be equal": 1, "to be gte": 0 })).to.throw("only one key-value");
        });

        chunk("should be string or object only", () => {
            expect(() => expect(1).to.correspond(1)).to.throw("string or object only");
        });
    });
});
