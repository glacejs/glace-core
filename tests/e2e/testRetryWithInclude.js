"use strict";

CONF.test.languages = ["en", "ru", "ee"];

var i = 0;

test("retry only include params", () => {

    before(() => {
        i++;
        if (i === 1) {
            throw new Error("Boom!");
        }
    });

    forEachLanguage(() => {
        chunk(() => {});
    });
});
