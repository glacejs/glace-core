"use strict";

const glace_core = require("../../lib");

test("Glace core lazy import", () => {

    chunk("empty by default", () => {
        expect(glace_core).to.be.empty;
    });

    chunk("has allure", () => {
        expect(glace_core.allure).to.exist;
    });

    chunk("has config", () => {
        expect(glace_core.config).to.exist;
    });

    chunk("has error", () => {
        expect(glace_core.error).to.exist;
    });

    chunk("has help", () => {
        expect(glace_core.help).to.exist;
    });

    chunk("has plugins", () => {
        expect(glace_core.plugins).to.exist;
    });

    chunk("has reporter", () => {
        expect(glace_core.reporter).to.exist;
    });

    chunk("has run", () => {
        expect(glace_core.run).to.exist;
    });

    chunk("has steps", () => {
        expect(glace_core.Steps).to.exist;
    });
});
