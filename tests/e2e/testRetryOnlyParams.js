"use strict";

CONF.languages = ["en", "ru", "ee"];

var i = 0;

test("retry only failed params", ctx => {

    before(() => {
        i++;
        if (i > 1 && i < 4) {
            throw new Error("Boom!");
        }
    });

    forEachLanguage(ctx, lang => {
        chunk(() => {
            if (lang === "ru" && i < 4) {
                throw new Error("Boom!");
            }
        });
    });
});
