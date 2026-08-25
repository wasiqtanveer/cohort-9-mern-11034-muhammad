const app = require("./app");
const logger = require("./config/logger");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(
        {
            event: "server_started",
            port: PORT,
            env: process.env.NODE_ENV || "development"
        },
        "server started"
    );
});

// Log unexpected promise errors insteed of lettin Node print them separaitely.
process.on("unhandledRejection", (reason) => {
    logger.error(
        { event: "unhandled_rejection", err: reason },
        "unhandled promise rejection"
    );
});

// An uncaught error can leave the app in a bad posiotn, so shut the server down.
process.on("uncaughtException", (err) => {
    logger.fatal(
        { event: "uncaught_exception", err },
        "uncaught exception, shutting down"
    );

    server.close(() => process.exit(1));
});

// Handle Ctrl+C and container shutdowns
function shutdown(signal) {
    logger.info({ event: "server_stopping", signal }, "shutting down");

    server.close(async () => {
        try {
            await pool.end();

            logger.info(
                { event: "server_stopped" },
                "shutdown complete"
            );

            process.exit(0);
        } catch (err) {
            logger.error(
                { event: "shutdown_failed", err },
                "failed to close the database pool"
            );

            process.exit(1);
        }
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));