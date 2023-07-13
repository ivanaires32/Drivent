import { Router } from "express";
import { authenticateToken } from "../middlewares";
import { getHotels, getRoomsHotels } from "../controllers/hotels-controllers";

const hotelRouter = Router()

hotelRouter
    .all('/*', authenticateToken)
    .get('/', getHotels)
    .get('/:id', getRoomsHotels)

export { hotelRouter }