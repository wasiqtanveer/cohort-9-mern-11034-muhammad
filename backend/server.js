require("dotenv").config(); //reads .env file and inject every process.ev
const express = require("express");
const pinoHttp = require('pino-http');

const app = express();
const PORT = process.env.PORT || 5000; // here || means if process.env.PORT is not defined, then use 5000 as the default port


app.use(pinoHttp());

app.get('/', (req,res) =>{
    res.send('API is running')
})

app.listen(PORT,()=>
{
    console.log(`server is running on port ${PORT}`)
})``