const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const PlayerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least two characters"],
      maxlength: [20, "First name cannot exceed 20 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Last name must be at least two characters"],
      maxlength: [20, "Last name cannot exceed 20 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: (val) => /^([\w-\.]+@([\w-]+\.)+[\w-]+)?$/.test(val),
        message: "Invalid Email",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    chips: {
      type: Number,
      default: 10000,
    },
  },
  { timestamps: true }
);

PlayerSchema.virtual("confirmPassword")
  .get(() => this._confirmPassword)
  .set((value) => (this._confirmPassword = value));

PlayerSchema.pre("validate", function (next) {
  if (this.password !== this.confirmPassword) {
    this.invalidate("confirmPassword", "Passwords must match!");
  }
  next();
});

PlayerSchema.pre("save", function (next) {
  bcrypt.hash(this.password, 10).then((hashedPassword) => {
    this.password = hashedPassword;
    next();
  });
});

module.exports = mongoose.model("Player", PlayerSchema);
