If you need to provide some `before` and/or `after` hooks in tests or group of
tests, in order to avoid copy-paste you may develop and reuse fixtures.

```javascript
var myFixture = func => {

    before(() => {
        console.log("called before");
    });

    func();

    after(() => {
        console.log("called after");
    });
};

test("My test", /* options */ null, [myFixture], () => {
    chunk(() => {});
});

scope("My tests", /* options */ null, [myFixture], () => {

    test("#1", () => {
        chunk(() => {});
    });

    test("#2", () => {
        chunk(() => {});
    });
});
```
