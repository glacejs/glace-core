"use strict";
/**
 * Contains functions to execute tests via command line interface.
 *
 * @module
 */

var run = require("./run");
/* allow plugins registration in runner before help call */
require("./help")();
/**
 * Runs `GlaceJS` in CLI.
 *
 * @function
 */
module.exports.run = () => run(process.exit);
