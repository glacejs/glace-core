"use strict";

test("chai as promised", () => {

    chunk("checks fulfilled promise", async () => {
        await expect(Promise.resolve()).to.be.fulfilled;
    });

    chunk("checks rejected promise", async () => {
        await expect(Promise.reject()).to.be.rejected;
    });
});

test("global sinon", () => {
    chunk("exists", () => {
        expect(sinon).to.exist;
    });
});
