"use strict";

global.i = global.i || 0,
global.j = global.j || 0;

suite("retry", () => {

    test("It should be passed one time", () => {
        chunk(() => {});
    });

    test("It should be passed after one retry", () => {
        chunk(() => {});
        chunk(() => {
            if (i < 1) {
                i++;
                throw new Error("BOOM!");
            };
        });
    });

    test ("it should be passed after two retries", () => {
        chunk(() => {});
        chunk(() => {
            if (j < 2) {
                j++;
                throw new Error("BOOM!");
            };
        });
    });
});
