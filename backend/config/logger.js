const pino =  require("pino");

const logger = pino({
    level:  process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),


     enabled: process.env.NODE_ENV !== "test",

    redact: {
        //this tells pino to hide any sensitive infor  iam logging
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
             "password",
            "password_hash" ,
            "token",
            "*.password",
             "*.password_hash",
            "*.token" ,
        ],

        censor:  "[redacted]",
   
    },
});

module.exports = logger;