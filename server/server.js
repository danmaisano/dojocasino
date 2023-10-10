const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");

require("./config/mongoose.config");
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json(), express.urlencoded({ extended: true }));
app.use(cookieParser());
require("dotenv").config();
require("./routes/deck.routes")(app);
require("./routes/player.routes")(app);

app.listen(8000, () => console.log("Server is up, Let's GOOOOOOO"));
