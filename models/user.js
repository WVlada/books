const mongoose = require("mongoose");

const Schema = mongoose.Schema;

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
  current_company_years: [
    {
      type: String,
      required: false
    }
  ]
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
  this.current_company_years.push(company.year[0]);
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
