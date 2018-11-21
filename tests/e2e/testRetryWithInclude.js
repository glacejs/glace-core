"use strict";

CONF.test.languages = ["en", "ru", "ee"];

if (!global.i) global.i = 0;

test("retry only include params", () => {

    before(() => {
        global.i++;
        if (global.i === 1) {
            throw new Error("Boom!");
        }
    });

    forEachLanguage(() => {
        chunk(() => {});
    });
});
