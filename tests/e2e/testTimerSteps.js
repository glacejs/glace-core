"use strict";

test("It should sleep 1 sec", () => {
    chunk(async () => {
        await SS.pause(1, "sleep 1 sec");
    });
});

test("It should pass timer check", () => {
    chunk(async () => {
        await SS.startTimer();
        await SS.pause(1, "sleep");
        await SS.checkTimer({ "to be above": 1 });
    });
});

test("It should fail timer check", () => {
    chunk(async () => {
        await SS.startTimer();
        await SS.pause(1, "sleep");
        await SS.checkTimer({ "to be below": 1 });
    });
});

test("It should fail because timer isn't started", () => {
    chunk(async () => {
        await SS.startTimer();
        await SS.pause(1, "sleep");
        await SS.stopTimer();
        await SS.checkTimer({ "to be equal": 1 });
    });
});
