"use strict";

test("Test 1 should be launched", () => {
    chunk(() => {});
});

test("Test 2 should be launched", () => {
    chunk(() => {});
});

test("Test 3 should be ignored", () => {
    chunk(() => {});
});
