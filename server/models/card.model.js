const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  suit: String,
  value: String,
  number: Number,
});

module.exports = mongoose.model("Card", CardSchema);
