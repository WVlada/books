const mongoose = require("mongoose");

const seedNalogs = require("./seeds/new_company_nalogs_seed");
const seedOStaliNalozi = require("./seeds/ostali_nalozi");
const seedOkvir = require("./seeds/seed_okvir");

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


companySchema.methods.createDefaultTransactions = async function(user) {
  await seedNalogs(this, user);
  await seedOStaliNalozi(this, user);
  await seedOkvir(this);
};

module.exports = mongoose.model("Company", companySchema);

