const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { createAssignment, getShowScript } = require("../controllers/assignmentController");

router.get("/show/:showId/script", protect, getShowScript);
router.post("/", protect, allowRoles("organizer", "admin"), createAssignment);

module.exports = router;