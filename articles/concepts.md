[test](global.html#test) - test case. Wrapper on mochajs [describe](https://mochajs.org/#getting-started). Should have readable and unique name per suite.

```javascript
test("my test", () => {
    chunk(() => {
        // payload
    });
});
```

[chunk](global.html#chunk) - a set of actions in test. Wrapper on mochajs [it](https://mochajs.org/#getting-started). Test should contain as minimum one chunk. Chunks are executed independently inside a test. Chunk may have name or be anonymous.

```javascript
/* anonymous chunk */
test("my test", () => {
    chunk(() => {
        // payload
    });
});

/* named chunks */
test("my test", () => {
    chunk("#1", () => {
        // payload
    });
    chunk("#2", () => {
        // payload
    });
});
```

[scope](global.html#scope) - the scope of tests or chunks, which is used for grouping. Wrapper on mochajs [describe](https://mochajs.org/#getting-started). If you have more than one file with tests, it will be a good style to wrap all tests inside file under one scope for visual grouping in stdout report.

```javascript
/* scope of tests */
scope("Auth", () => {
    test("is passed", () => {
        // test case
    });
    test("is failed", () => {
        // test case
    });
});

/* scope of chunks */
test("Auth", () => {
    scope("is passed", () => {
        chunk("for user", () => {
            // payload
        });
        chunk("for admin", () => {
            // payload
        });
    });
});
```

[before](https://mochajs.org/#hooks) - mochajs before.

[after](https://mochajs.org/#hooks) - mochajs after.

[beforeChunk](global.html#beforeChunk) - wrapper on mochajs [beforeEach](https://mochajs.org/#hooks).

[afterChunk](global.html#afterChunk) - wrapper on mochajs [afterEach](https://mochajs.org/#hooks).
