const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services/index");

const bookingService = new BookingService();

const create = async (req, res) => {
  try {
    const response = await bookingService.createBooking(req.body);
    console.log("from controller : ", response);

    return res.status(StatusCodes.OK).json({
      message: "Successfully completed booking",
      success: true,
      err: {},
      data: response,
    });
  } catch (error) {
    console.error("Booking creation error:", {
      message: error.message,
      explaination: error.explaination,
      statusCode: error.statusCode,
      //   stack: error.stack,
      requestBody: req.body,
    });

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        // Top-level message shows the detailed explanation
        message:
          error.explaination || error.message || "Not able to get the flight",
        success: false,
        // Keep the short title inside err.message
        err: { message: error.message || "Error" },
        data: {},
      });
  }
};

module.exports = {
  create,
};
