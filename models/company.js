const mongoose = require("mongoose");
const Nalog = require("./nalog");

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
  vrste_naloga: [
    { vrsta: "R", type: String },
    { vrsta: "N", type: String },
    { vrsta: "Z", type: String },
    { vrsta: "I", type: String }
  ]
});

companySchema.methods.createDefaultTransactions = function(user) {
  console.log("****");
  Nalog.create({
    company: this._id,
    user: user,
    locked: false,
    number: 1,
    duguje: 10000,
    potrazuje: 10000,
    opis: "Otvaranje knjiga",
    date: new Date(this.current_company_year, 0, 1),
    type: "R",
    year: this.current_company_year
  }).then(result => {
    console.log("****");
    return;
  });
};
module.exports = mongoose.model("Company", companySchema);
