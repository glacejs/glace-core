"use strict";

test("Test 1 should be excluded", () => {
    chunk(() => {});
});

test("Test 2 should be excluded", () => {
    chunk(() => {});
});

test("Test 3 should be launched", () => {
    chunk(() => {});
});
