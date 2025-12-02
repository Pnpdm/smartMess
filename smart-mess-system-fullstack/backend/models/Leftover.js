const mongoose = require("mongoose");

const leftoverSchema = new mongoose.Schema(
  {
    hostel: { type: String, required: true },
    preparedMeals: { type: Number, required: true },
    servedMeals: { type: Number, required: true },
    pickupTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "Assigned", "Expiring"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leftover", leftoverSchema);
