"use strict";

suite("Timer steps", () => {

    test("It should sleep 1 sec", () => {
        chunk(async () => {
            await $.pause(1, "sleep 1 sec");
        });
    });

    test("It should pass timer check", () => {
        chunk(async () => {
            await $.startTimer();
            await $.pause(1, "sleep");
            await $.checkTimer({ "to be above": 1 });
        });
    });

    test("It should fail timer check", () => {
        chunk(async () => {
            await $.startTimer();
            await $.pause(1, "sleep");
            await $.checkTimer({ "to be below": 1 });
        });
    });

    test("It should fail because timer isn't started", () => {
        chunk(async () => {
            await $.startTimer();
            await $.pause(1, "sleep");
            await $.stopTimer();
            await $.checkTimer({ "to be equal": 1 });
        });
    });
});
