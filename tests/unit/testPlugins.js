"use strict";

var plugins = require("../../lib").plugins;

test("plugins module", () => {

    chunk(".get() should be empty", () => {
        expect(plugins.get()).to.be.empty;
    });

    chunk(".clearCache() should work", () => {
        expect(plugins.clearCache()).to.not.exist;
    });

    chunk(".get() should be empty after .clearCache()", () => {
        plugins.clearCache();
        expect(plugins.get()).to.be.empty;
    });
});
