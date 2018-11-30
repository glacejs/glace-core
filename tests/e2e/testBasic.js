"use strict";

suite("basic", () => {

    scope("chunk management", () => {

        test("my test", () => {
            chunk(() => {
                expect(1).to.be.equal(1);
            });
        });
    
        test("with skipped chunk", () => {
            chunk(() => false);
        });
    
        test("with chunk retry", () => {
            let i;
            chunk({ retry: 1 }, () => {
                if (i) return;
                i = 1;
                throw Error("BOOM!");
            });
        });
    
        test("with chunk timeout", () => {
            chunk({ timeout: 1 }, () => {});
        });
    
        test("with two chunks", () => {
            chunk("first", () => {});
            chunk("second", () => {});
        });
    });

    scope("test management", () => {

        test("with chunk retry option", { chunkRetry: 1 }, () => {
            let i;
            chunk(() => {
                if (i) return;
                i = 1;
                throw Error("BOOM!");
            });
        });

        test("skipped", { skip: true }, () => {
            chunk(() => {});
        });

        test("skipped with reason", { skip: "Bug http://bugs.io/123" }, () => {
            chunk(() => {});
        });

        test("with fixture", [fxMyFixture], () => {
            chunk(() => {});
        });

        test("with retry", { retry: 1 }, () => {
            chunk(() => {
                if (global.i) return;
                global.i = 1;
                throw Error("BOOM!");
            });
        });
    });

    scope("steps management", () => {

        test("is passed with timer check", () => {
            chunk(async () => {
                await $.startTimer();
                await $.pause(0.1, "sleep");
                await $.checkTimer({ "to be above": 0.1 });
            });
        });
    });
});
