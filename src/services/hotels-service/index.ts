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

export const hotelsService = {
    getHotels
}