const Player = require("../models/player.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  register: (req, res) => {
    Player.create(req.body)
      .then((player) => res.json(player))
      .catch((err) => res.status(400).json(err));
  },

  login: (req, res) => {
    Player.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.status(400).json({ message: "Invalid Credentials" });
        }

        bcrypt
          .compare(req.body.password, user.password)
          .then((isMatch) => {
            if (!isMatch) {
              return res.status(400).json({ message: "Invalid Credentials" });
            }

            const userToken = jwt.sign(
              {
                id: user._id,
              },
              process.env.SECRET_KEY
            );

            res.cookie("usertoken", userToken, { httpOnly: true }).json({
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              chips: user.chips,
              token: userToken,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Something went wrong" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Something went wrong" });
      });
  },

  logout: (req, res) => {
    res.clearCookie("usertoken");
    res.sendStatus(200);
  },

  getAllPlayers: (req, res) => {
    Player.find()
      .then((allPlayers) => {
        res.json(allPlayers);
      })
      .catch((err) =>
        res.json({ message: "Something went wrong!", error: err })
      );
  },

  updateChips: (req, res) => {
    const playerId = req.body.id;

    if (req.user.id !== playerId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const newChips = req.body.chips;

    Player.findByIdAndUpdate(playerId, { chips: newChips }, { new: true })
      .then((updatedPlayer) => {
        if (!updatedPlayer) {
          return res.status(404).json({ message: "Player not found" });
        }
        res.json(updatedPlayer);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
      });
  },

  deletePlayer: (req, res) => {
    Player.findByIdAndDelete(req.params.id)
      .then((res) => res.json(res))
      .catch((err) =>
        res.json({ message: "Something went wrong!", error: err })
      );
  },

  getLeaders: (req, res) => {
    Player.find()
      .sort({ chips: -1 })
      .limit(10)
      .exec()
      .then((leaders) => {
        res.json(leaders);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      });
  },
};
