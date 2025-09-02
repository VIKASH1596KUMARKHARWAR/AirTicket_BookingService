// const { StatusCodes } = require("http-status-codes");
// const { BookingService } = require("../services/index");
// const { createChannel, publisherMessage } = require("../utils/messageQueues");
// const { REMAINDER_BINDING_KEY } = require("../config/serverConfig");

// const bookingService = new BookingService();
// class BookingController {
//   constructor() {}

//   async sendMessageToQueue(req, res) {
//     const channel = await createChannel();
//     const payload = {
//       data: {
//         subject: "This is a noti from queue",
//         content: "Some queue will subscribe this",
//         recipientEmail: "vikashg1596@gmail.com",
//         notificationTime: "2025-09-01T08:37:34.192Z",
//       },
//       service: "CREATE_TICKET",
//     };
//     publisherMessage(channel, REMAINDER_BINDING_KEY, JSON.stringify(payload));
//     return res.status(200).json({
//       message: "Successfully published the event",
//     });
//   }

//   async create(req, res) {
//     try {
//       const response = await bookingService.createBooking(req.body);
//       console.log("from controller : ", response);

//       return res.status(StatusCodes.OK).json({
//         message: "Successfully completed booking",
//         success: true,
//         err: {},
//         data: response,
//       });
//     } catch (error) {
//       console.error("Booking creation error:", {
//         message: error.message,
//         explaination: error.explaination,
//         statusCode: error.statusCode,
//         //   stack: error.stack,
//         requestBody: req.body,
//       });

//       return res
//         .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
//         .json({
//           // Top-level message shows the detailed explanation
//           message:
//             error.explaination || error.message || "Not able to get the flight",
//           success: false,
//           // Keep the short title inside err.message
//           err: { message: error.message || "Error" },
//           data: {},
//         });
//     }
//   }
// }

// // const create = async (req, res) => {
// //   try {
// //     const response = await bookingService.createBooking(req.body);
// //     console.log("from controller : ", response);

// //     return res.status(StatusCodes.OK).json({
// //       message: "Successfully completed booking",
// //       success: true,
// //       err: {},
// //       data: response,
// //     });
// //   } catch (error) {
// //     console.error("Booking creation error:", {
// //       message: error.message,
// //       explaination: error.explaination,
// //       statusCode: error.statusCode,
// //       //   stack: error.stack,
// //       requestBody: req.body,
// //     });

// //     return res
// //       .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
// //       .json({
// //         // Top-level message shows the detailed explanation
// //         message:
// //           error.explaination || error.message || "Not able to get the flight",
// //         success: false,
// //         // Keep the short title inside err.message
// //         err: { message: error.message || "Error" },
// //         data: {},
// //       });
// //   }
// // };

// module.exports = BookingController;

// controllers/BookingController.js
const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services/index");

const bookingService = new BookingService();

class BookingController {
  async create(req, res) {
    try {
      const booking = await bookingService.createBooking(req.body);

      return res.status(StatusCodes.OK).json({
        message: "Booking created successfully and messages published",
        success: true,
        err: {},
        data: booking,
      });
    } catch (error) {
      console.error("Booking creation error:", error);

      return res
        .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: error.explaination || error.message || "Booking failed",
          success: false,
          err: { message: error.message },
          data: {},
        });
    }
  }
}

module.exports = BookingController;
