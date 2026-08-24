const pino = require("pino");

//one shared instance. pino-http uses it for request/response logs and hangs a child
//logger off every request as req.log, so controller activity lines carry the same
//request id and land in the same stream with the same redaction rules
const logger = pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),

    //otherwise every test run buries its output in log lines
    enabled: process.env.NODE_ENV !== "test",

    //pino serialises whole objects, so anything that could carry a secret is masked
    //before it is written. passwords are never passed to the logger in the first
    //place, this is the second line of defence
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "password",
            "password_hash",
            "token",
            "*.password",
            "*.password_hash",
            "*.token",
        ],
        censor: "[redacted]",
    },
});

module.exports = logger;
