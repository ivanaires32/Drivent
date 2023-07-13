import { notFoundError } from "../../errors"
import { paymentRequired } from "../../errors/payment-required"
import { hotelsRepository } from "../../repositories/hotels-repository"

async function getHotels(userId: number) {
    const user = await hotelsRepository.getUser(userId)
    const ticket = await hotelsRepository.getTicket(userId)
    if (!user || !ticket) throw notFoundError()
    if (ticket.status === "RESERVED"
        || ticket.TicketType.includesHotel === false
        || ticket.TicketType.isRemote === true) throw paymentRequired()

    const hotels = await hotelsRepository.getHotels()
    return hotels
}

async function getRooms(userId: number, idHotel: number) {
    const user = await hotelsRepository.getUser(userId)
    const ticket = await hotelsRepository.getTicket(userId)
    const hotel = await hotelsRepository.getHotel(idHotel)
    if (!user || !ticket || !hotel) throw notFoundError()
    if (ticket.status === "RESERVED"
        || ticket.TicketType.includesHotel === false
        || ticket.TicketType.isRemote === true) throw paymentRequired()

    const rooms = await hotelsRepository.getRooms(idHotel)
    return rooms
}

export const hotelsService = {
    getHotels,
    getRooms
}