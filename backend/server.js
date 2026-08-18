require("dotenv").config(); //reads .env file and inject every process.ev
const express = require("express");
const pinoHttp = require('pino-http');
const pool = require("./config/db")
const {notFound, errorHandler} = require("./middleware/errorHandler")

const app = express();
app.disable("x-powered-by");//dont tell attackers we are running express
const PORT = process.env.PORT || 5000; // here || means if process.env.PORT is not defined, then use 5000 as the default port


//pino logs request headers by default, so hide the ones that carry tokens
app.use(pinoHttp({
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

app.use(notFound);
app.use(errorHandler);

app.listen(PORT,()=>
{
    console.log(`server is running on port ${PORT}`)
})