const express = require("express");
const Attendance = require("../models/Attendance");
const Leftover = require("../models/Leftover");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/admin/overview
router.get("/overview", auth(["admin"]), async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const docs = await Attendance.find({ date: today });
    let total = 0;
    let confirmed = 0;
    docs.forEach((d) => {
      d.meals.forEach((m) => {
        total += 1;
        if (m.status === "attending") confirmed += 1;
      });
    });
    res.json({
      total,
      confirmed,
      text: `Today there are ${confirmed} confirmed meals out of ${total} recorded (all meals combined).`,
    });
  } catch (err) {
    console.error("Admin overview error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/leftover
router.post("/leftover", auth(["admin"]), async (req, res) => {
  try {
    const { hostel, preparedMeals, servedMeals, pickupTime } = req.body;
    if (!hostel || preparedMeals == null || servedMeals == null || !pickupTime) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const leftoverCount = Math.max(preparedMeals - servedMeals, 0);
    const status =
      leftoverCount === 0 ? "Assigned" : leftoverCount > 20 ? "Expiring" : "Available";
    const ticket = await Leftover.create({
      hostel,
      preparedMeals,
      servedMeals,
      pickupTime,
      status,
    });
    res.status(201).json({
      message: `Donation ticket created with ~${leftoverCount} extra meals.`,
      ticket,
    });
  } catch (err) {
    console.error("Leftover create error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
