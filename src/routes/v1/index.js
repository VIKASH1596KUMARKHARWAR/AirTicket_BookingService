// const expres = require("express");
// const { BookingController } = require("../../controllers");

// // const { createChannel } = require("../../utils/messageQueues");
// // const channel = await createChannel();

// const bookingController = new BookingController();

// const router = expres.Router();

// router.post("/bookings", bookingController.create);
// router.post("/publish", bookingController.sendMessageToQueue);

// module.exports = router;

const expres = require("express");
const { BookingController } = require("../../controllers");

const bookingController = new BookingController();
const router = expres.Router();

router.get("/info", (req, res) => {
  return res.json({ message: "Response from the routes" });
});

// Wrap methods to preserve `this` context
router.post("/bookings", (req, res) => bookingController.create(req, res));
router.post("/publish", (req, res) =>
  bookingController.sendMessageToQueue(req, res)
);

// OR using bind
// router.post("/bookings", bookingController.create.bind(bookingController));
// router.post("/publish", bookingController.sendMessageToQueue.bind(bookingController));

module.exports = router;
