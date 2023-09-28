const mongoose = require("mongoose");

const DeckSchema = new mongoose.Schema({
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
});

module.exports = mongoose.model("Deck", DeckSchema);
