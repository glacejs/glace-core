"use strict";

var i = 0,
    j = 0;

test("It should be passed one time", () => {
    chunk(() => {});
});

test("It should be passed after one chunk retry", () => {
    chunk(() => {
        if (i < 1) {
            i++;
            throw new Error("BOOM!");
        };
    });
});

test ("it should be passed after two chunk retries", () => {
    chunk(() => {
        if (j < 2) {
            j++;
            throw new Error("BOOM!");
        };
    });
});
