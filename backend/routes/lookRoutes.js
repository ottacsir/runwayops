const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { createLook, getLooksByCollection } = require("../controllers/lookController");

router.post("/", protect, allowRoles("designer", "admin"), createLook);
router.get("/collection/:collectionId", protect, getLooksByCollection);

module.exports = router;