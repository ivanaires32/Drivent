import { Router } from "express";
import { authenticateToken } from "../middlewares";
import { getHotels } from "../controllers/hotels-controllers";

const hotelRouter = Router()

hotelRouter
    .all('/*', authenticateToken)
    .get('/', getHotels)

export { hotelRouter }