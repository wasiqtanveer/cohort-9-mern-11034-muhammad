const app = require("./app");
const logger = require("./config/logger");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info({event: "server_started", port: PORT, env: process.env.NODE_ENV || "development"}, "server started");
});

//a crash that goes through pino lands in the same log as everything else,
//instead of node printing a bare stack trace to stderr and exiting silently
process.on("unhandledRejection", (reason) => {
    logger.error({event: "unhandled_rejection", err: reason}, "unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
    logger.fatal({event: "uncaught_exception", err}, "uncaught exception, shutting down");
    //an uncaught exception leaves the process in an unknown state, so do not keep serving
    server.close(() => process.exit(1));
});

//ctrl+c and container stop both send these. close the http server and the pg pool
//so in flight requests finish and postgres is not left holding connections
function shutdown(signal) {
    logger.info({event: "server_stopping", signal}, "shutting down");

    server.close(async () => {
        //an unhandled rejection here would skip the exit entirely and hang the process
        try {
            await pool.end();
            logger.info({event: "server_stopped"}, "shutdown complete");
            process.exit(0);
        } catch (err) {
            logger.error({event: "shutdown_failed", err}, "failed to close the database pool");
            process.exit(1);
        }
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
