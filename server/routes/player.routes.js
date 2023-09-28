const PlayerController = require("../controllers/player.controller");

module.exports = (app) => {
  app.post("/api/player/register", PlayerController.register);
  app.post("/api/player/login", PlayerController.login);
  app.post("/api/player/logout", PlayerController.logout);
  app.patch("/api/player/update/:id", PlayerController.updateChips);
  app.get("/api/players/getAllPlayers", PlayerController.getAllPlayers);
  app.delete("/api/players/delete/:id", PlayerController.deletePlayer);
  app.get("/api/players/leaders", PlayerController.getLeaders);
};
