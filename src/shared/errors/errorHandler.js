const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate record already exists";
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    res.status(statusCode).json({
        success: false,
        message:
            process.env.NODE_ENV === "production" &&
                statusCode === 500
                ? "Internal Server Error"
                : message,
        ...(process.env.NODE_ENV !== "production" && {
            stack: err.stack,
        }),
    });
};

export default errorHandler;