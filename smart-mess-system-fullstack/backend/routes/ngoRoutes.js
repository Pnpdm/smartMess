const express = require("express");
const Leftover = require("../models/Leftover");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/ngo/dashboard
router.get("/dashboard", auth(["ngo"]), async (req, res) => {
  try {
    const tickets = await Leftover.find().sort({ createdAt: -1 }).limit(20);
    const mapped = tickets.map((t) => ({
      id: t._id,
      hostel: t.hostel,
      meals: Math.max(t.preparedMeals - t.servedMeals, 0),
      pickupTime: t.pickupTime,
      status: t.status,
    }));
    res.json({ tickets: mapped });
  } catch (err) {
    console.error("NGO dashboard error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
