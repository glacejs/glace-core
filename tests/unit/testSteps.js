"use strict";

var Steps = require("../../lib").Steps;

var obj1 = {
    method1: function () {},
};

var obj2 = {
    method2: function () {},
};

test("Steps class", () => {

    var steps;

    before(() => {
        steps = new Steps();
    });

    beforeChunk(() => {
        steps.stopTimer();
    });

    chunk(".register() should register steps", () => {
        Steps.register(obj1, obj2);
        expect(Steps.prototype.method1).to.be.a("function");
        expect(Steps.prototype.method2).to.be.a("function");
    });

    chunk(".startTimer() should start timer", () => {
        steps.startTimer();
        expect(steps._timer).to.exist.and.be.lte(new Date);
    });

    chunk(".stopTimer() should stop timer", () => {
        steps.startTimer();
        steps.stopTimer();
        expect(steps._timer).to.not.exist;
    });

    chunk(".checkTimer() throws error if timer isn't started", () => {
        expect(steps.checkTimer).to.throw();
    });

    chunk(".checkTimer() matches condition", () => {
        steps.startTimer();
        steps.checkTimer({ lte: 1 });
    });

    chunk(".checkTimer() throws error if it doesn't match condition", () => {
        steps.startTimer();
        expect(() => steps.checkTimer({ gte: 1000 })).to.throw();
    });

    chunk(".pause() sleeps", async () => {
        steps.startTimer();
        await steps.pause(0.1, "sleep");
        steps.checkTimer({ gte: 0.1 });
    });

    chunk(".pause() throws error if message isn't specified", async () => {
        await expect(steps.pause(0.1)).to.be.rejected;
    });
});
