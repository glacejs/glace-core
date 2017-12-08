"use strict";

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
