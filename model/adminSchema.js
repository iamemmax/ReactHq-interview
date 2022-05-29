const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    // required: true,
  },
  lastName: {
    type: String,
    // required: true,
  },

  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    // required: true,
  },
  acct_No: {
    type: Number,
    // required: true,
  },
  roles: {
    type: String,
    default: "admin",
    enum: ["member", "admin"],
  },
  profile: [],

  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
});

module.exports = mongoose.model("admins", adminSchema);
