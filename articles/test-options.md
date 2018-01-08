When you develop a test you may pass options to test or chunk, which override config values for concrete test or chunk.

### Test options

#### skip unwanted test

```javascript
test("My test", { skip: true }, () => {
    chunk(() => {
        // payload
    });
});
```

```javascript
test("My test", { skip: true, skipReason: "Opened bug http://tracker.com/bugs/121" }, () => {
    chunk(() => {
        // payload
    });
});
```

#### retry failed test

```javascript
test("My test", { retry: 2 }, () => {
    chunk(() => {
        // payload
    });
})
```

#### retry failed chunks

```javascript
test("My test", { chunkRetry: 2 }, () => {
    chunk(() => {
        // payload
    });
});
```

#### chunks execution timeout

```javascript
test("My test", { chunkTimeout: 1 }, () => {
    chunk(() => {
        // payload
    });
});
```

### Chunk options

#### retry failed chunk

```javascript
test("My test", () => {
    chunk({ retry: 2 }, () => {
        // payload
    });
});
```

#### chunk execution timeout

```javascript
test("My test", () => {
    chunk({ timeout: 1 }, () => {
        // payload
    });
});
```
