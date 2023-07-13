import { prisma } from "@/config";


async function getHotels() {
    const hotels = await prisma.hotel.findMany()
    return hotels
}

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

async function getHotel(idHotel: number) {
    return await prisma.hotel.findFirst({
        where: {
            id: idHotel
        }
    })
}

async function getRooms(idHotel: number) {
    return await prisma.room.findMany({
        where: {
            hotelId: idHotel
        }
    })
}


export const hotelsRepository = {
    getHotels,
    getTicket,
    getUser,
    getHotel,
    getRooms
}