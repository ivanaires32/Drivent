import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares";
import httpStatus from "http-status";
import { hotelsService } from "../services/hotels-service";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req
    try {
        const hotels = await hotelsService.getHotels(userId)
        res.status(httpStatus.OK).send(hotels)
    } catch (err) {
        if (err.name === 'NotFoundError') {
            return res.sendStatus(httpStatus.NOT_FOUND)
        } else if (err.name === 'Payment Required') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED)
        }
        res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
    }
}