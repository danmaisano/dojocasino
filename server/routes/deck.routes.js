const DeckController = require("../controllers/deck.controller");

module.exports = (app) => {
  app.post("/api/deck", DeckController.createDeck);
  app.get("/api/deck", DeckController.getDeck);
  app.delete("/api/deck/:id", DeckController.deleteDeck);
};
