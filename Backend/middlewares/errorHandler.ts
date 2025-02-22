import { CustomError } from '../utils/customError';
import { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            message: err.message,
        });
    } else {
        console.error(`Unexpected error: ${err}`);
        res.status(500).json({
            message: "Internal Server Error. Please try again later.",
        });
    }
}