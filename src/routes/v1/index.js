const expres = require("express");
const { BookingController } = require("../../controllers");

// const { createChannel } = require("../../utils/messageQueues");
// const channel = await createChannel();

const bookingController = new BookingController();

const router = expres.Router();

router.post("/bookings", bookingController.create);
router.post("/publish", bookingController.sendMessageToQueue);

module.exports = router;
