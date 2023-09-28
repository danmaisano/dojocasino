const Deck = require("../models/deck.model");
const Card = require("../models/card.model");

async function createDeck() {
  const suits = ["spades", "hearts", "clubs", "diamonds"];
  const deck = new Deck();

  for (let suit of suits) {
    for (let i = 1; i <= 13; i++) {
      let strVal = "";
      if (i === 1) {
        strVal = "Ace";
      } else if (i === 11) {
        strVal = "Jack";
      } else if (i === 12) {
        strVal = "Queen";
      } else if (i === 13) {
        strVal = "King";
      } else {
        strVal = String(i);
      }

      const card = new Card({
        suit: suit,
        number: i,
        value: strVal,
      });

      await card.save();
      deck.cards.push(card);
    }
  }

  await deck.save();
}

async function getDeck(req, res) {
  try {
    const deck = await Deck.find().populate("cards").exec();
    res.json(deck);
  } catch (error) {
    res.status(500).send("Something went wrong!");
  }
}

function deleteDeck(req, res) {
  Deck.findByIdAndDelete(req.params.id)
    .then((res) => res.json(res))
    .catch((err) => res.json({ message: "Something went wrong!", error: err }));
}

module.exports = {
  createDeck,
  getDeck,
  deleteDeck,
};
