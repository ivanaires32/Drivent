import { ApplicationError } from "../protocols";

export function paymentRequired(): ApplicationError {
    return {
        name: 'Payment Required',
        message: 'Pay the ticket first'
    }
}