import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
    return await prisma.hotel.create({
        data: {
            image: faker.image.abstract(),
            name: faker.company.companyName(),
            Rooms: {
                createMany: {
                    data: [
                        {
                            capacity: faker.datatype.number(),
                            name: faker.name.jobArea()
                        },
                        {
                            capacity: faker.datatype.number(),
                            name: faker.name.jobArea()
                        },
                        {
                            capacity: faker.datatype.number(),
                            name: faker.name.jobArea()
                        },
                        {
                            capacity: faker.datatype.number(),
                            name: faker.name.jobArea()
                        }
                    ]
                }
            }
        }
    })
}

export async function createTicketHotel() {
    return await prisma.ticketType.create({
        data: {
            name: faker.name.findName(),
            price: faker.datatype.number(),
            isRemote: false,
            includesHotel: true,
        },
    });
}