const User = require("../models/user");
const Company = require("../models/company");
const Nalog = require("../models/nalog");
const Stav = require("../models/stav");
const Konto = require("../models/konto");
const Komitent = require("../models/komitent");
const komitenttype = require("../models/komitenttype");
const accounting = require("accounting-js");
const Okvir = require("../models/okvir");
const ObjectId = require("mongoose").Types.ObjectId;

const { validationResult } = require("express-validator");

exports.getCompany = (req, res, next) => {
  console.log(req.body);
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company_years = req.current_company_years;
  console.log("/show_company");
  console.log(user);
  console.log(current_company_id);
  console.log(current_company_year);
  console.log(current_company_years);
  console.log("/show_company");
  Company.find({ user: user._id })
    .then(result => {
      if (result.length === 0) {
        res.redirect("/new_company");
      } else {
        let current_company;
        let companies = result;
        // filter mi ne radi iz nekog razloga....
        result.map(elem => {
          elem["_id"].toString() == current_company_id.toString()
            ? (current_company = elem)
            : next;
        });
        return res.render("company/show_company", {
          user: user,
          companies: companies,
          current_company: current_company,
          years: current_company_years,
          current_company_year: current_company_year,
          pageTitle: `Company: ${current_company.name}`,
          path: "/tok_dokumentacije",
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
  const user = req.user;
  let name = "";
  let mb = "";
  let pib = "";
  let email = "";
  let adress = "";
  let telephone = "";
  if (user.fromLinkedIn) {
    name = "Evolve Finance ltd.";
    mb = "12345678";
    pib = "123456789";
    email = "office@evolve-finance.com";
    adress = "Bulevar Mihajla Pupina 120";
    telephone = "064555555";
  }
  res.render("company/new_company", {
    pageTitle: "New company",
    path: "/new_company",
    infoMessage: "Please enter data about the company",
    oldInput: {
      name: name,
      mb: mb,
      pib: pib,
      email: email,
      adress: adress,
      telephone: telephone
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
  const checkbox = req.body.checkbox_hidden;

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
        const company = new Company({
          name: name,
          year: year,
          mb: mb,
          pib: pib,
          adress: adress,
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
          .then(async result => {
            if (checkbox) {
              console.log("checkbox true");
              await company.createDefaultTransactions(user);
              await user.createMoreCompanies(company);
              return res.redirect("/company");
            }
          });
      }
    })
    .catch();
};
// AJAX
const NALOGS_PER_PAGE = 22;
exports.getDnevnikNaloga = (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company_years = req.current_company_years;
  let page = +req.query.page || 1; //page=1 +ga pretvara u broj || ako nije def, onda stavi 1
  console.log("/get_dnevnik");
  console.log(user);
  console.log(current_company_id);
  console.log(current_company_year);
  console.log(current_company_years);
  console.log(req.query.page);
  console.log(page);
  console.log("/get_dnevnik");
  let totalNalogs;
  Nalog.find({ company: current_company_id, year: current_company_year })
    .countDocuments()
    .then(numOfNalogs => {
      totalNalogs = numOfNalogs;
      if (page > Math.ceil(totalNalogs / NALOGS_PER_PAGE)) {
        if (totalNalogs != 0) {
          page = Math.ceil(totalNalogs / NALOGS_PER_PAGE);
        }
      }
      return Nalog.find({
        company: current_company_id,
        year: current_company_year
      })
        .skip((page - 1) * NALOGS_PER_PAGE) //paginacija
        .limit(NALOGS_PER_PAGE); //paginacija
    })
    .then(result => {
      nalozi = result;
    })
    .then(result => {
      Company.find({ user: user._id })
        .then(result => {
          companies = result;
        })
        .then(com => {
          //current_company = user.current_company;
        })
        .then(result => {
          return res.status(200).render("includes/dashboard/dnevnik", {
            pageTitle: "",
            accounting: accounting,
            path: "/dnevnik",
            hasError: false,
            user: user,
            //current_company: current_company,
            current_company_year: current_company_year,
            years: current_company_years,
            companies: companies,
            nalozi: nalozi,
            currentPage: page,
            hasNextPage: NALOGS_PER_PAGE * page < totalNalogs,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalNalogs / NALOGS_PER_PAGE),
            successMessage: null,
            infoMessage: null,
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
};

exports.changeCompany = async (req, res, next) => {
  console.log("change company");
  console.log(req.query);
  console.log("change company");
  const user = req.user;
  const new_company_id = req.query.company_id;
  const year = req.query.year_broj;
  const new_company = await Company.findOne({ _id: new_company_id });
  const user_model = await User.findOne({ _id: user._id });
  user_model.current_company = new_company;
  user_model.current_company_year = year;
  user_model.save();
  res.redirect("/");
};
exports.changeYear = async (req, res, next) => {
  console.log("change year");
  console.log(req.query);
  console.log("change year");
  const user = req.user;
  const new_year = req.query.year_broj;
  const user_model = await User.findOne({ _id: user._id });
  user_model.current_company_year = new_year;
  user_model.save();
  res.redirect("/");
};

const KONTNI_PLAN_PER_PAGE = 22;
exports.getKontniPlan = async (req, res, next) => {
  const user = req.user;
  const companies = await Company.find({ user: user });
  const current_company = await Company.findOne({
    _id: req.current_company_id
  });
  const page = +req.page || 1;
  let totalKontos;
  const kontos = await Konto.find({
    company: current_company
  }); //
  //.countDocuments()
  //.then(numberOfKontos => {
  //  totalKontos = numberOfKontos;
  //  return Konto.find({ company: current_company })
  //    .skip((page - 1) * KONTNI_PLAN_PER_PAGE) //paginacija
  //    .limit(KONTNI_PLAN_PER_PAGE); //paginacija;
  //});
  const okvir = await Okvir.find({
    company: current_company
  }).sort({ number: 1 });
  const sva_konta = await Konto.find({ company: current_company }).sort({
    number: 1
  });
  const sva_konta_i_okvir = [];

  for (let i = 0; i <= okvir.length - 1; i++) {
    sva_konta_i_okvir.push(okvir[i]);
    if (okvir[i].number.length == 2) {
      let num = okvir[i].number;
      let regex = new RegExp("^" + num);
      sva_konta.map(konto => {
        if (konto.number.match(regex)) {
          sva_konta_i_okvir.push(konto);
        }
      });
    }
  }

  //for (let i = 0; i <= okvir.length-1; i++){
  //  sva_konta_i_okvir.push(okvir[i])
  //  if (okvir[i].number.length == 2) {
  //    let num = okvir[i].number;
  //    let pripadajuca_konta = await Konto.find({ company: current_company, number: {$regex: "^" + num + ""}}).sort({number: 1})
  //    for (let j = 0; j <= pripadajuca_konta.length - 1; j++){
  //      sva_konta_i_okvir.push(pripadajuca_konta[j])
  //    }
  //  }
  //}
  const current_company_year = req.current_company_year;
  const years = req.current_company_years;
  return res.status(200).render("includes/dashboard/kontni_plan", {
    pageTitle: "",
    path: "/kontni_plan",
    hasError: false,
    sva_konta_i_okvir: sva_konta_i_okvir,
    user: user,
    current_company: current_company,
    current_company_year: current_company_year,
    companies: companies,
    years: years,
    successMessage: null,
    infoMessage: null,
    validationErrors: [] //,
    //currentPage: page,
    //hasNextPage: KONTNI_PLAN_PER_PAGE * page < totalKontos,
    //hasPreviousPage: page > 1,
    //nextPage: page + 1,
    //previousPage: page - 1,
    //lastPage: Math.ceil(totalKontos / KONTNI_PLAN_PER_PAGE)
  });
};
exports.getShowKonto = async (req, res, next) => {
  const user = req.user;
  const current_company_year = req.current_company_year;
  const years = req.current_company_years;
  const current_company = await Company.findOne({
    _id: req.current_company_id
  });
  const companies = await Company.find({ user: user });

  const konto_id = req.query.konto_id;
  const konto = await Konto.findById(konto_id);
  const svi_stavovi = await Stav.find({
    company: current_company,
    konto: konto
  })
    .populate({ path: "nalog", model: Nalog })
    .sort({ date: "asc" });
  console.log(req.query);
  console.log("****");
  console.log(svi_stavovi);
  console.log("****");
  return res.status(200).render("includes/dashboard/show_konto", {
    pageTitle: "",
    path: "/show_konto",
    hasError: false,
    svi_stavovi: svi_stavovi,
    accounting: accounting,
    user: user,
    current_company: current_company,
    current_company_year: current_company_year,
    companies: companies,
    broj_konta: konto.number,
    naziv_konta: konto.name,
    years: years,
    successMessage: null,
    infoMessage: null,
    validationErrors: [] //,
    //currentPage: page,
    //hasNextPage: KONTNI_PLAN_PER_PAGE * page < totalKontos,
    //hasPreviousPage: page > 1,
    //nextPage: page + 1,
    //previousPage: page - 1,
    //lastPage: Math.ceil(totalKontos / KONTNI_PLAN_PER_PAGE)
  });
};
exports.getTokDokumentacije = (req, res, next) => {
  console.log("tok_dokumentacije");
  return res.status(200).render("includes/dashboard/tok_dokumentacije", {
    pageTitle: "",
    path: "/tok_dokumentacije",
    hasError: false,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.getNotImplemented = (req, res, next) => {
  console.log("***not implemented*****");
  return res.status(200).render("includes/dashboard/tok_dokumentacije", {
    pageTitle: "",
    path: "/tok_dokumentacije",
    hasError: false,
    successMessage: null,
    infoMessage: "Functionality not implemented in this software version.",
    validationErrors: []
  });
};
