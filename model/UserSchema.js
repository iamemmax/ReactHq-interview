const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  acct_No: {
    type: Number,
    required: true,
  },

  course: {
    type: String,
    required: true,
  },
  how_you_hear_abt_us: {
    type: String,
    required: true,
  },
  new_to_mint_act: {
    type: String,
  },
});

module.exports = mongoose.model("users", userSchema);
