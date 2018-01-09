"use strict";

test("chai matcher .waitFor()", () => {
    var now;

    before(() => {
        now = new Date().getTime();
    });

    chunk("passed", async () => {
        var i = 0;
        await expect(() => i++).to.waitFor({ "to be equal": 5 });
        expect(new Date().getTime() - now).to.be.gte(500).and.below(1000);
    });

    chunk("failed", async () => {
        await expect(expect(() => 0).to.waitFor({ "to be equal": 5 }))
            .to.be.rejectedWith("expected 0 to equal 5");
        expect(new Date().getTime() - now).to.be.gte(1000);
    }); 
});
