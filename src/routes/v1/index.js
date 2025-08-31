const expres = require("express");
const { BookingController } = require("../../controllers");
const router = expres.Router();

router.post("/bookings", BookingController.create);
module.exports = router;
