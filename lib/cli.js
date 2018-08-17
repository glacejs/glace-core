"use strict";

/**
 * **Execute tests via command line interface.**
 *
 * @module
 */

require("./config"); // configuration is before all!
require("./help")();
const run = require("./run");

/**
 * Run glace-core in CLI and exit process at the end.
 *
 * @function
 */
exports.run = () => run(process.exit);
