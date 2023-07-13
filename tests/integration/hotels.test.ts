import supertest from "supertest";
import app, { init } from "@/app";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken"
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser, generateCreditCardData } from "../factories";
import { prisma } from "@/config";
import { cleanDb, generateValidToken } from "../helpers";
import { createHotel } from "../factories/hotels-factory";
import { TicketStatus } from "@prisma/client";

const server = supertest(app)

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb()
});

describe("GET /hotels authorization", () => {
    it("should respond with status 401 if no token is given", async () => {
        const result = await server.get("/hotels")

        expect(result.status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    })

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    })
})

describe("when token is valid", () => {

    it("Any error", async () => {
        const token = await generateValidToken()
        const result = await server.get("hotels").set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(httpStatus.BAD_REQUEST)
    })

    it("returns 404 when subscription does not exist", async () => {
        const result = await server.get("/hotels")
        expect(result.status).toBe(httpStatus.NOT_FOUND)
    })

    it("returns 404 when ticket does not exist", async () => {
        const user = await createUser()
        const token = generateValidToken(user)
        await createEnrollmentWithAddress(user)

        const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(httpStatus.NOT_FOUND)
    })

    it("returns 404 when hotel does not exist", async () => {
        const user = await createUser()
        const token = generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketType()
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)

        const result = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(httpStatus.NOT_FOUND)
    })

    it("returns 402 when user has not paid the ticket", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketType()
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

        const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })

    it("returns 402 when the event is online", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await prisma.ticketType.create({
            data: {
                name: faker.name.findName(),
                price: faker.datatype.number(),
                isRemote: true,
                includesHotel: faker.datatype.boolean(),
            }
        })
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)

        const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })

    it("returns 402 when event does not include hotel", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await prisma.ticketType.create({
            data: {
                name: faker.name.findName(),
                price: faker.datatype.number(),
                isRemote: faker.datatype.boolean(),
                includesHotel: false
            }
        })
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)

        const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })

    it("returns 200 to list all hotels", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await prisma.ticketType.create({
            data: {
                name: faker.name.findName(),
                price: faker.datatype.number(),
                isRemote: false,
                includesHotel: true,
            },
        });
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        await createHotel()
        await createHotel()

        const result = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(httpStatus.OK)
        expect(result.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    image: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                })
            ])
        )

    })

    it("returns 200 to fetch hotel rooms", async () => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketType()
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        const hotel = await createHotel()

        const result = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`)

        expect(result.status).toBe(httpStatus.OK)
        expect(result.body).toMatchObject(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    capacity: expect.any(Number),
                    hotelId: hotel.id
                })
            ])
        )
    })

})