// This middleware sends a clean JSON response when something goes wrong.
const errorMiddleware = (
    err,
    req,
    res,
    next
) => {

    return res.status(
        err.status || 500
    ).json({
        success: false,
        message:
            err.message ||
            "Internal Server Error",
    });

};

module.exports = errorMiddleware;