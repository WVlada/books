const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const stavSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  nalog: {
    type: Schema.Types.ObjectId,
    ref: "Nalog"
  },
  duguje: {
    type: Number,
    default: 0
  },
  potrazuje: {
    type: Number,
    default: 0
  },
  nalog_date: {
    type: Date,
    required: true
  },
  konto: {
    type: Schema.Types.ObjectId,
    ref: "Racun"
  },
  opis: {
    type: String,
    default: "no description"
  },
  pozivnabroj: {
    type: String
  },
  sifra_komitenta: {
    type: Schema.Types.ObjectId,
    ref: "Komitent",
    required: false
  },
  valuta: {
    type: Date
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
