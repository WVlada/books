const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const stavSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  type: {
    type: Schema.Types.ObjectId,
    ref: "nalogtype",
    required: true
  },
  duguje: {
    type: Number,
    required: true
  },
  potrazuje: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  opis: {
    type: String,
    required: true
  },
  pozivnabroj: {
    type: String
  },
  sifrakomitenta: {
    type: Schema.Types.ObjectId,
    ref: "Komitent"
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

module.exports = mongoose.model("Stav", stavSchema);
