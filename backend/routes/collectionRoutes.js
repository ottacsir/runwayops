const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createCollection,
  getMyCollections,
  getCollectionsByShow,
  updateCollectionStatus,
} = require("../controllers/collectionController");

router.post("/", protect, allowRoles("designer", "admin"), createCollection);
router.get("/mine", protect, allowRoles("designer", "admin"), getMyCollections);
router.get("/show/:showId", protect, getCollectionsByShow);
router.patch("/:id/status", protect, allowRoles("organizer", "admin"), updateCollectionStatus);

module.exports = router;