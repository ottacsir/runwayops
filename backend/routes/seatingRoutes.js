const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { createSeating, getSeatingByShow } = require("../controllers/seatingController");

router.post("/", protect, allowRoles("organizer", "admin"), createSeating);
router.get("/show/:showId", protect, getSeatingByShow);

module.exports = router;