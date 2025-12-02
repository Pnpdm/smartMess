const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true },
    status: { type: String, enum: ["attending", "skipped"], default: "skipped" },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    meals: [mealSchema],
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
