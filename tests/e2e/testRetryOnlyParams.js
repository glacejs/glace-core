"use strglobal.ict";

CONF.test.languages = ["en", "ru", "ee"];

if (!global.i) global.i = 0;

test("retry only failed params", () => {

    before(() => {
        global.i++;
        if (global.i > 1 && global.i < 4) {
            throw new Error("Boom!");
        }
    });

    forEachLanguage(lang => {
        chunk(() => {
            if (lang === "ru" && global.i < 4) {
                throw new Error("Boom!");
            }
        });
    });
});
