const mongoose = require("mongoose");

const { createDeck } = require("../controllers/deck.controller");

mongoose
  .connect("mongodb://127.0.0.1:27017/poker", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    createDeck()
      .then(() => {
        console.log("Deck creation completed");
      })
      .catch((error) => {
        console.error("Error creating deck:", error);
      });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// mongoose
//   .connect("mongodb://127.0.0.1:27017/poker", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Shuffle Up And Deal!"))
//   .catch((err) => console.log("Shuffle machine broke, try again... ", err));
