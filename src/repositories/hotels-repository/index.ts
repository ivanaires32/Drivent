import { prisma } from "@/config";

async function getUser(userId: number) {
    const user = await prisma.enrollment.findFirst({
        where: {
            userId
        }
    })

    return user
}

async function getTicket(userId: number) {
    const ticket = await prisma.ticket.findFirst({
        where: {
            Enrollment: {
                userId
            }
        }, include: {
            TicketType: true
        }
    })

    return ticket
}

async function getHotels() {
    const hotels = await prisma.hotel.findMany()
    return hotels
}

export const hotelsRepository = {
    getHotels,
    getTicket,
    getUser
}