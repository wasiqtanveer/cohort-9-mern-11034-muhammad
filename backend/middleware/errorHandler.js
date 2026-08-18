//this function runs when no routeabove it mathces the request url

function notFound(req,res,next)
{
    const err = new Error(`Not Found - ${req.originalUrl}`);
    err.status = 404;
    next(err); // passing an error the the next( ) make the code jump to next error handler
}
    
    function errorHandler(err,req,res,next)
    {
        const status = err.status || 500;

        req.log.error({err}, "Request failed");

        res.status(status).json(
            {
                //500s can carry database details like table names so send something generic instead
                message: status >= 500 ? "Internal Server Error" : err.message,

                stack: process.env.NODE_ENV === "development" ? err.stack : undefined,//only show the stack in development, anything else stays hidden
            }
        )
    }

module.exports = {notFound, errorHandler};