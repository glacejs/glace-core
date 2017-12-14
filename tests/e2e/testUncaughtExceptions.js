"use strict";

var sleep = timeout => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`It was sleeping ${timeout} ms`);
            resolve();
        }, timeout);
    });
};

var error = timeout => {
    setTimeout(() => {
        throw new Error("BOOM!");
    }, timeout);
};

test("It raises uncaught exceptions", () => {

    chunk("#1", async () => {
        error(500);
        await sleep(500);
    });

    chunk("#2", async () => {
        await sleep(500);
    });

    chunk("#3", async () => {
        error(500);
        await sleep(500);
    });

    chunk("#4", async () => {
        await sleep(500);
    });

    chunk("#6", async () => {
        await sleep(500);
    });

    chunk("#6", async () => {
        await sleep(500);
    });
});
