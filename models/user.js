const mongoose = require("mongoose");
const Company = require("./company");
const Nalog = require("./nalog");
const Stav = require("./stav");
const Konto = require("./konto");
const Komitent = require("./komitent");
const Komitenttype = require("./komitenttype");
const Okvir = require("./okvir");
const Schema = mongoose.Schema;
const seedOkvir = require("./seeds/seed_okvir");
const seedZaDruguITrecu = require("./seeds/seed_za_drugu_i_trecu");

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  emailConfirmed: Boolean,
  confirmToken: String,
  confirmTokenExpiration: Date,
  company: [
    {
      companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: false
      }
    }
  ],
  program_preference: {
    tutorialtip: Boolean,
    autosave: Boolean,
    permissions: Boolean
  },
  current_company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: false
  },
  current_company_year: {
    type: String,
    required: false
  },
  fromLinkedIn: {
    type: Boolean
  },
  permisions: {
    type: Boolean
  },
  autosave: {
    type: Boolean
  },
  tutorial_tips: {
    type: Boolean
  }
});

userSchema.methods.addCompany = function(company) {
  let counter = 0;
  this.company.map(com => {
    if (company._id === com._id) {
      counter++;
    }
  });
  if (counter === 0) {
    this.company.push(company);
  }
  return this.save();
};

userSchema.methods.setActiveCompany = function(company) {
  this.current_company = company;
  this.current_company_year = company.year[0];
  return this.save();
};
userSchema.methods.createMoreCompanies = async function(company) {
  // ne moze da se nalazi u seed_ostali nalozi jer u trenutku kad pozivam jos nije exportovan Company Model
  const company2 = await Company.create({
    year: [company.year[0], company.year[0] + 1, company.year[0] + 2],
    vrste_naloga: ["R", "N", "I", "Z"],
    name: "Software Inc.",
    mb: "12332112",
    pib: "123321123",//this breaks unique field restriction
    user: this
  });
  this.company.push({ _id: company2._id });

  const company3 = await Company.create({
    year: [company.year[0], company.year[0] + 1, company.year[0] + 2],
    vrste_naloga: ["R", "N", "I", "Z"],
    name: "Software Commerce Inc.",
    mb: "23123121",
    pib: "789987789",
    user: this
  });
  this.company.push({ _id: company3._id });
  await this.save();
  // company

  await seedOkvir(company2);
  await seedOkvir(company3);

  await seedZaDruguITrecu(this, company2);
  await seedZaDruguITrecu(this, company3);
};

userSchema.methods.deleteAllConnectedRecords = async function() {
  let companies = [];
  await Company.find({ user: this }).then(resArray => {
    if (resArray.length > 0) {
      for (let i = 0; i <= resArray.length - 1; i++) {
        companies.push(resArray[i]._id);
      }
    }
  });
  // i have all company _ids
  for (let j = 0; j <= companies.length - 1; j++) {
    await Nalog.deleteMany({ company: companies[j] });
    await Stav.deleteMany({ company: companies[j] });
    await Komitent.deleteMany({ company: companies[j] });
    await Konto.deleteMany({ company: companies[j] });
    await Komitenttype.deleteMany({ company: companies[j] });
    await Company.deleteMany({ _id: companies[j] });
    await Okvir.deleteMany({ company: companies[j] });
  }
  console.log("All LinkedIn stuff deleted.");
};

module.exports = mongoose.model("User", userSchema);
