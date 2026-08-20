require("dotenv").config();
const express = require("express");
const pinoHttp = require('pino-http');
const pool = require("./config/db")
const {notFound, errorHandler} = require("./middleware/errorHandler")
const authRoutes = require("./routes/authRoutes")

//crash on startup with a clear message instead of 500ing on every login
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
}

const app = express();
app.disable("x-powered-by");//dont tell attackers we are running express

//pino logs request headers by default, so hide the ones that carry tokens
app.use(pinoHttp({
    enabled: process.env.NODE_ENV !== "test",
    redact: ["req.headers.authorization", "req.headers.cookie"],
}));

app.use(express.json());//parses jason requestion body into req.body

app.get('/api/db-test',async(req,res) =>
{
    const result = await pool.query('SELECT NOW()')
    res.json(result.rows[0])
})

app.get('/', (req,res) =>{
    res.send('API is running')
})

app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;//export the app so tests can use it without starting a server