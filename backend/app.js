require("dotenv").config();
const express = require("express");
const pinoHttp = require('pino-http');
const logger = require("./config/logger");
const {notFound, errorHandler} = require("./middleware/errorHandler")
const authRoutes = require("./routes/authRoutes")
const notesRoutes = require("./routes/notesRoutes")
const cors = require("cors");


//crash on startup with a clear message instead of 500ing on every login
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in .env");
}

const app = express();
app.disable("x-powered-by");//dont tell attackers we are running express

//logs every http request and response, and gives each request a req.log child
//logger that the controllers use for activity lines. level and redaction both
//live on the shared instance in config/logger.js
app.use(pinoHttp({logger}));

app.use(express.json());//parses jason requestion body into req.body

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.get('/', (req,res) =>{
    res.send('API is running')
})

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;//export the app so tests can use it without starting a server