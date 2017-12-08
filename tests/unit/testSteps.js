"use strict";

var Steps = require("../../lib").Steps;

var obj1 = {
    method1: function () {},
};

var obj2 = {
    method2: function () {},
};

test("Steps class", () => {

    chunk(".register() should work", () => {
        Steps.register(obj1, obj2);
        expect(Steps.prototype.method1).to.be.a("function");
        expect(Steps.prototype.method2).to.be.a("function");
    });
});
