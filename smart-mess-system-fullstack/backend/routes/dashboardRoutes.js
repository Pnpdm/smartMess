const express = require("express");
const Attendance = require("../models/Attendance");
const Leftover = require("../models/Leftover");

const router = express.Router();

// Public dashboard summarising data for landing page
router.get("/home", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const docs = await Attendance.find({ date: today });
    let total = 0;
    let confirmedMeals = 0;
    docs.forEach((d) => {
      d.meals.forEach((m) => {
        total += 1;
        if (m.status === "attending") confirmedMeals += 1;
      });
    });

    const leftovers = await Leftover.find().sort({ createdAt: -1 }).limit(3);
    const ngoTickets = leftovers.map((t) => ({
      hostel: t.hostel,
      meals: Math.max(t.preparedMeals - t.servedMeals, 0),
      pickupTime: t.pickupTime,
      status: t.status,
    }));

    const summary = {
      total,
      confirmed: confirmedMeals,
      skipped: Math.max(total - confirmedMeals, 0),
      extraMeals: ngoTickets.reduce((sum, t) => sum + t.meals, 0),
      messLoad: total ? Math.round((confirmedMeals / total) * 100) : 0,
    };

    res.json({ summary, ngoTickets });
  } catch (err) {
    console.error("Dashboard home error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
