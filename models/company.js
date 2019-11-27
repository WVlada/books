const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const companySchema = new Schema({
  mb: {
    type: String,
    required: true
  },
  pib: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  year: [
    {
    type: Number,
    required: true
  }
],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  vrste_naloga: [{vrsta: "R", type: String}, { vrsta: "N", type: String},{ vrsta: "Z", type: String}, { vrsta: "I", type: String}]
});

module.exports = mongoose.model("Company", companySchema);
