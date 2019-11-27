const User = require("../models/user");
const Company = require("../models/company");

const { validationResult } = require("express-validator/check");

exports.getCompany = (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  console.log("**********");
  console.log("Show company controller");
  console.log("**********");
  Company.find({ user: user._id })
    .then(result => {
      if (result.length === 0) {
        res.redirect("/new_company");
      } else {
        let current_company;
        // filter mi ne radi iz nekog razloga....
        result.map(elem => {
          elem["_id"].toString() == current_company_id.toString()
            ? (current_company = elem)
            : next;
        });
        return res.render("company/show_company", {
          user: user,
          companies: result,
          current_company: current_company,
          years: current_company.year,
          current_company_year: current_company_year,
          pageTitle: `Company: ${current_company.name}`,
          path: "/show_company",
          infoMessage: null,
          validationErrors: [],
          successMessage: null
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getNewCompanyRoot = (req, res, next) => {
  res.render("company/new_company", {
    pageTitle: "New company",
    path: "/new_company",
    infoMessage: "Please enter data about the company",
    oldInput: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    successMessage: null,
    validationErrors: []
  });
};
exports.postNewCompanyRoot = (req, res, next) => {
  const name = req.body.name;
  const year = req.body.year;
  const mb = req.body.mb;
  const pib = req.body.pib;
  const adress = req.body.adress;
  const email = req.body.email;
  const telephone = req.body.telephone;
  const user = req.user;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("company/new_company", {
      pageTitle: "New company",
      path: "/new_company",
      hasError: true,
      oldInput: {
        name: name,
        year: year,
        mb: mb,
        pib: pib,
        adress: adress,
        email: email,
        telephone: telephone
      },
      successMessage: null,
      infoMessage: null,
      validationErrors: errors.array()
    });
  }
  Company.findOne({ pib: pib })
    // findOne vraca null ako ne postoji
    // find vraca prazan array ako ne postoji
    .then(result => {
      if (result) {
        return res.status(422).render("company/new_company", {
          pageTitle: "New company",
          path: "/new_company",
          hasError: true,
          oldInput: {
            name: name,
            year: year,
            mb: mb,
            pib: pib,
            adress: adress,
            email: email,
            telephone: telephone
          },
          successMessage: null,
          infoMessage:
            "Company with same pib and year already exists. To be added as a user to existing company, contact FinBooks! administrators.",
          validationErrors: []
        });
      } else {
      }
    })
    .catch();
  const company = new Company({
    name: name,
    year: year,
    mb: mb,
    pib: pib,
    adress: adress,
    email: email,
    telephone: telephone,
    user: user,
    vrste_naloga: ["R", "N", "I", "Z"]
  });
  company
    .save()
    .then(result => {
      user.addCompany(company).then(result => {
        user.setActiveCompany(company);
      });
    })
    .then(result => {
      return res.redirect("/company");
    });
};

exports.getDnevnikNaloga = (req, res, next) => {
  const company_id = req.query.current_company;
  const current_company_year = req.query.current_year;
  console.log(req.query);
  //const user = req.user;
  //const company_id = req.current_company_id;
  //let companies;
  //let company;
  //Company.find({ user: user._id })
  //  .then(result => {
  //    companies = result;
  //    return companies;
  //  })
  //  .then(result => {
  //    Company.findById({ _id: company_id }).then(result => {
  //      company = result;
  return res.render("includes/dashboard/dnevnik_naloga", {
    path: "/includes/dashboard/dnevnik_naloga"
    //user: user,
    //company: company,
    //companies: companies
    //      });
    //    });
  });
};
exports.getNalog = (req, res, next) => {
  const user = req.user;
  const company_id = req.query.current_company;
  const current_company_year = req.query.current_year;
  Company.findOne({ _id: company_id })
    .then(result => {
      const current_company = result;
      return res.render("company/new_nalog", {
        path: "/new_nalog",
        user: user,
        current_company: current_company,
        current_company_year: current_company_year,
        vrste_naloga: current_company.vrste_naloga,
        successMessage: null,
        infoMessage: null,
        validationErrors: []
        });
    })
  //  .then(result => {
  //    Company.findById({ _id: company_id }).then(result => {
  //      company = result;
  
  //    });
  //  });
};
