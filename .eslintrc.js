module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "globals": {
        "SS": true,
        "before": true,
        "after": true,
        "beforeChunk": true,
        "afterChunk": true,
        "beforeEach": true,
        "afterEach": true,
        "scope": true,
        "test": true,
        "describe": true,
        "it": true,
        "forEachLanguage": true,
        "session": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "rules": {
        "no-console": 0,
        "no-extra-semi": 0,
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};