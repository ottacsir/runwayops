const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createApplication,
  getMyApplications,
  getApplicationsByShow,
  updateApplicationStatus,
} = require("../controllers/applicationController");

router.post("/", protect, allowRoles("model", "admin"), createApplication);
router.get("/mine", protect, allowRoles("model", "admin"), getMyApplications);
router.get("/show/:showId", protect, allowRoles("organizer", "admin"), getApplicationsByShow);
router.patch("/:id/status", protect, allowRoles("organizer", "admin"), updateApplicationStatus);

module.exports = router;