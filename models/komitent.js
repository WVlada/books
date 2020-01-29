const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const komitentSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  adress: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  pib: {
    type: String,
    required: true
  },
  sifra: {
    type: String,
    required: true
  },
  type: {
    type: Schema.Types.ObjectId,
    ref: "komitenttype",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true
  }
});

module.exports = mongoose.model("Komitent", komitentSchema);
