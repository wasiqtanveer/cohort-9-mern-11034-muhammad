const pool = require("../config/db");

//root level hook, mocha runs this once after every test file is done
exports.mochaGlobalTeardown = async function () {
    await pool.end();
};