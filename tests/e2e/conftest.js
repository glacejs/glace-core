"use strict";

const U = require("glace-utils");

global.fxMyFixture = U.makeFixture({ before: () => () => {}, after: () => () => {} });
