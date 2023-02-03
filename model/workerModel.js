const mongoose = require("mongoose");

const workerSchema = mongoose.Schema({
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
  status: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  profileImage: {
    data: Buffer,
    contentType: String,
  },
  verified: {
    type: String,
    required: true,
  },
  stripeId: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Worker", workerSchema);
