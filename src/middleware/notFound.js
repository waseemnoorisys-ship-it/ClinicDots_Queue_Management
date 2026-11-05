import AppError from "../shared/errors/AppError.js";

const notFound = (req, res, next) => {
    next(
        new AppError(
            `Route not found: ${req.originalUrl}`,
            404
        )
    );
};

export default notFound;