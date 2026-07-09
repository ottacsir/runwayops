const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createShow,
  getShows,
  getShowById,
  updateShowStatus,
  deleteShow
} = require("../controllers/showController");

router.get("/", protect, getShows);
router.get("/:id", protect, getShowById);
router.post("/", protect, createShow);
router.patch("/:id/status", protect, updateShowStatus);
router.delete("/:id", protect, allowRoles("organizer", "admin"), deleteShow);

module.exports = router;