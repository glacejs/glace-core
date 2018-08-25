"use string";

const error = rewire("../../lib/error");

suite("error", () => {

    test("ConfigError", () => {
        chunk(() => {
            expect(() => {
                throw new error.ConfigError("BOOM!");
            }).to.throw("BOOM!");
        });
    });

    test("StepError", () => {
        chunk(() => {
            expect(() => {
                throw new error.StepError("BOOM!");
            }).to.throw("BOOM!");
        });
    });
});
