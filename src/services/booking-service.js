const { BookingRepository } = require("../repository");
const axios = require("axios");

const {
  FLIGHT_SERVICE_PATH,
  REMAINDER_BINDING_KEY,
} = require("../config/serverConfig");

const { ServiceError } = require("../utils/errors/index");

const { createChannel, publisherMessage } = require("../utils/messageQueues");

class BookingService {
  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async createBooking(data) {
    try {
      const flightId = data.flightId;
      const flightUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;

      console.log("Fetching flight info from:", flightUrl);
      const flightResponse = await axios.get(flightUrl);
      const flightData = flightResponse.data.data;
      console.log("Flight data received:", flightData);

      if (data.noOfSeats > flightData.totalSeats) {
        throw new ServiceError(
          "Insufficient seats",
          `Requested ${data.noOfSeats} seats but only ${flightData.totalSeats} available`
        );
      }

      const totalCost = flightData.price * data.noOfSeats;
      const bookingPayload = { ...data, totalCost };
      console.log("Creating booking with payload:", bookingPayload);

      const booking = await this.bookingRepository.create(bookingPayload);
      console.log("✅ Booking created:", booking);

      // Update flight seats
      const updatedSeats = flightData.totalSeats - booking.noOfSeats;
      console.log(`Updating flight ${flightId} seats to:`, updatedSeats);

      const flightUpdateResponse = await axios.patch(
        `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`,
        { totalSeats: updatedSeats }
      );
      console.log("✅ Flight seats updated:", flightUpdateResponse.data);

      // Update booking status
      const finalBooking = await this.bookingRepository.update(booking.id, {
        status: "Booked",
      });
      console.log("✅ Booking status updated:", finalBooking);

      // Publish CREATE_TICKET message
      const channel = await createChannel();
      const hardcodedEmail = "vikashg1596@gmail.com";

      const ticketPayload = {
        data: {
          subject: `Booking Confirmed - Flight ${booking.flightId}`,
          content: `Your booking for ${booking.noOfSeats} seats has been confirmed.`,
          recipientEmail: hardcodedEmail,
          notificationTime: new Date().toISOString(),
        },
        service: "CREATE_TICKET",
      };
      await publisherMessage(channel, REMAINDER_BINDING_KEY, ticketPayload);
      console.log("✅ Published CREATE_TICKET message:", ticketPayload);

      // Publish email notification
      const mailPayload = {
        data: {
          to: hardcodedEmail,
          subject: `Booking Confirmation`,
          body: `Hello, your booking for flight ${booking.flightId} is confirmed.`,
        },
        service: "SEND_BASIC_MAIL",
      };
      await publisherMessage(channel, REMAINDER_BINDING_KEY, mailPayload);
      console.log("✅ Published SEND_BASIC_MAIL message:", mailPayload);

      return finalBooking;
    } catch (error) {
      console.error("❌ Error in createBooking:", error);
      if (error.response) {
        const msg = error.response.data.err?.message || "Flight does not exist";
        const status = error.response.status || 404;
        throw new ServiceError(msg, "Flight service error", status);
      }
      if (error instanceof ServiceError) throw error;

      throw new ServiceError(
        "Unable to fetch flight details",
        error.message,
        500
      );
    }
  }
}

module.exports = BookingService;
