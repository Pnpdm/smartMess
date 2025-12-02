const express = require("express");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/student/dashboard
router.get("/dashboard", auth(["student"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");
    // simple static weekly menu
    const weeklyMenu = [
      ["Mon", "Paneer Butter Masala"],
      ["Tue", "Chole Bhature"],
      ["Wed", "Idli Sambhar"],
      ["Thu", "Fried Rice & Manchurian"],
      ["Fri", "Special Biryani"],
    ];
    res.json({ user, weeklyMenu });
  } catch (err) {
    console.error("Student dashboard error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/student/attendance
router.post("/attendance", auth(["student"]), async (req, res) => {
  try {
    const { date, meals } = req.body;
    if (!date || !Array.isArray(meals)) {
      return res.status(400).json({ message: "Date and meals required" });
    }
    const filtered = meals.map((m) => ({
      mealType: m.mealType,
      status: m.status === "attending" ? "attending" : "skipped",
    }));
    const doc = await Attendance.findOneAndUpdate(
      { user: req.user.id, date },
      { meals: filtered },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: "Attendance saved", attendance: doc });
  } catch (err) {
    console.error("Attendance error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
