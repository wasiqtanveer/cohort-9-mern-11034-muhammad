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
                message: err.message || "Internal sever Error",


                stack: process.env.NODE_ENV === "production" ? undefined : err.stack,//this line basically say if we ar ein production dont shpw error details if we are in development thenn show
            }
        )
    }

module.exports = {notFound, errorHandler};