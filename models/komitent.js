const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const komitentSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  name: {
    type: Number,
    required: true
  },
  adress: {
    type: Number,
    required: true
  },
  pib: {
    type: Number,
    required: true
  },
  sifra: {
    type: Number,
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
