const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { getAllUsers } = require("../controllers/userController");

router.get("/", protect, allowRoles("organizer", "admin"), getAllUsers);

module.exports = router;