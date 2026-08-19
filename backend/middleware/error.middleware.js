// This middleware sends a clean JSON response when something goes wrong.
const errorMiddleware = (
    err,
    req,
    res,
    next
) => {

    const status = err.status ||
        (err.name === "ValidationError" || err.name === "CastError" ? 400 :
            err.code === 11000 ? 409 :
                err.name === "MulterError" ? 400 : 500);

    if (status >= 500) {
        console.error("Unhandled request error:", err);
    }

    return res.status(status).json({
        success: false,
        message: status >= 500 && process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : err.message || "Internal Server Error",
    });

};

module.exports = errorMiddleware;