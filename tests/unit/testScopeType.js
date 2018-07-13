"use strict";

const ScopeType = rewire("../../lib/testing").ScopeType;

test("ScopeType", () => {
    let scopeType;

    beforeChunk(() => {
        scopeType = new ScopeType("my scope");
    });

    chunk("instance", () => {
        expect(scopeType).to.be.instanceof(String);
        expect(scopeType.toString()).to.be.equal("my scope");
        expect(scopeType.type).to.not.exist;
    });

    chunk(".setType()", () => {
        scopeType.setType("scope");
        expect(scopeType.type).to.be.equal("scope");
    });
});
