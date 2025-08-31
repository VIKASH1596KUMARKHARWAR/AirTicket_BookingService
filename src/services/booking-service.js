const { BookingRepository } = require("../repository");
const axios = require("axios");
const { FLIGHT_SERVICE_PATH } = require("../config/serverConfig");
const { ServiceError } = require("../utils/errors/index");

class BookingService {
  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  async createBooking(data) {
    try {
      const flightId = data.flightId;
      const flightUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;

      // Fetching flight from flight service
      const flightResponse = await axios.get(flightUrl);
      const flightData = flightResponse.data.data;

      // Checking seat availability
      if (data.noOfSeats > flightData.totalSeats) {
        throw new ServiceError(
          "Insufficient seats",
          `Requested ${data.noOfSeats} seats but only ${flightData.totalSeats} available`
        );
      }
      let priceOfTheFlight = flightData.price;
      const totalCost = priceOfTheFlight * data.noOfSeats;
      console.log("Flight price:", flightData.price);
      console.log("total cost:", totalCost);
      console.log(`Requested ${data.noOfSeats} seats total Cost ${totalCost} `);

      const bookingPayload = { ...data, totalCost };
      console.log(bookingPayload);

      const booking = await this.bookingRepository.create(bookingPayload);

      const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;

      await axios.patch(updateFlightRequestURL, {
        totalSeats: flightData.totalSeats - booking.noOfSeats,
      });

      const finalBooking = await this.bookingRepository.update(booking.id, {
        status: "Booked",
      });
      return finalBooking;
    } catch (error) {
      // Flight service returned a valid response with error (like 404)
      if (error.response) {
        const msg = error.response.data.err?.message || "Flight does not exist";
        const status = error.response.status || 404;
        throw new ServiceError(msg, "Flight service error", status);
      }

      // Already a ServiceError (like insufficient seats)
      if (error instanceof ServiceError) {
        throw error;
      }

      throw new ServiceError(
        "Unable to fetch flight details",
        error.message,
        500
      );
    }
  }
}

module.exports = BookingService;
