const {Pool} = require('pg')
require('dotenv').config()

const pool = new Pool(
    {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        connectionTimeoutMillis: 5000, //dont wait forever if postgres is down, give up after 5 sec
    }
)

//pool is an event emitter, if an idle client errors and nobody is listening node kills the whole process
pool.on("error", (err) => {
    console.error("Unexpected error on idle postgres client", err);
})

module.exports = pool