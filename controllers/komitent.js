const User = require("../models/user");
const Company = require("../models/company");
const Komitent = require("../models/komitent");
const komitenttype = require("../models/komitenttype");
const Stav = require("../models/stav");
const Konto = require("../models/konto");
const accounting = require("accounting-js");

const KOMITENTS_PER_PAGE = 22;
exports.getKomitentIndex = async (req, res, next) => {
  const user = req.user;
  const companies = await Company.find({ user: user });
  const current_company = await Company.findOne({
    _id: req.current_company_id
  });
  let page = +req.query.page || 1;
  let totalKomitents;
  const komitenti = await Komitent.find({
    company: current_company
  })
    .countDocuments()
    .then(numberOfKomitents => {
      totalKomitents = numberOfKomitents;
      if (page > Math.ceil(totalKomitents / KOMITENTS_PER_PAGE)) {
        page = Math.ceil(totalKomitents / KOMITENTS_PER_PAGE);
      }
      return Komitent.find({ company: current_company })
        .populate({ path: "type", model: komitenttype })
        .skip((page - 1) * KOMITENTS_PER_PAGE) //paginacija
        .limit(KOMITENTS_PER_PAGE); //paginacija;
    });

  const current_company_year = req.current_company_year;
  const years = req.current_company_years;
  console.log("pregled komitenata");
  console.log(`Page: ${page}`);
  console.log(req.query);
  console.log("pregled komitenata");
  return res.status(200).render("includes/dashboard/komitent_index", {
    pageTitle: "",
    path: "/pregled_komitenata",
    hasError: false,
    komitenti: komitenti,
    user: user,
    current_company: current_company,
    current_company_year: current_company_year,
    companies: companies,
    years: years,
    successMessage: null,
    infoMessage: null,
    validationErrors: [],
    currentPage: page,
    hasNextPage: KOMITENTS_PER_PAGE * page < totalKomitents,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalKomitents / KOMITENTS_PER_PAGE)
  });
};

exports.getKomitent = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company_years = req.current_company_years;
  const current_company = await Company.findOne({ _id: current_company_id });
  const page = req.query.page;
  const komitent_id = req.query.komitent_id;
  const komitent = await Komitent.findById(komitent_id).populate({
    path: "type",
    model: komitenttype
  });
  const svi_stavovi = await Stav.find({
    sifra_komitenta: komitent_id
  })
    .populate({ path: "konto", model: Konto })
    .populate({
      path: "sifra_komitenta",
      model: Komitent
    });
  let suma_duguje = 0;
  let suma_potrazuje = 0;
  for (let i = 0; i <= svi_stavovi.length - 1; i++) {
    suma_duguje += svi_stavovi[i]["duguje"];
    suma_potrazuje += svi_stavovi[i]["potrazuje"];
  }
  console.log("**");
  console.log(svi_stavovi);

  console.log("**");
  return res.status(200).render("includes/dashboard/komitent_show", {
    pageTitle: "",
    path: "/komitent_show",
    hasError: false,
    komitent: komitent,
    svi_stavovi: svi_stavovi,
    accounting: accounting,
    suma_duguje: suma_duguje,
    suma_potrazuje: suma_potrazuje,
    user: user,
    current_company: current_company,
    successMessage: null,
    infoMessage: null,
    validationErrors: [],
    page: page
  });
};
