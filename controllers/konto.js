const User = require("../models/user");
const Company = require("../models/company");
const Konto = require("../models/konto");
const Okvir = require("../models/okvir");

exports.getEditKonto = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company = await Company.findOne({ _id: current_company_id });
  const oldInput = {};

  return res.status(200).render("includes/dashboard/konto_edit", {
    pageTitle: "",
    path: "/konto_edit",
    hasError: false,
    user: user,
    current_company: current_company,
    successMessage: null,
    infoMessage: null,
    validationErrors: [],
    oldInput: oldInput
  });
};
exports.postEditKonto = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company = await Company.findOne({ _id: current_company_id });
  const name = req.body.name;
  const number = req.body.number;
  const konto_id = req.body.konto_id;
  console.log(req.body);
  if (number.length < 4 || number.length > 5) {
    return res.status(400).json([
      {
        param: "number",
        msg: "Number must be greater then 3 and less then 6 digits."
      }
    ]);
  }
  if (name.length < 4 || name.length > 30) {
    return res.status(400).json([
      {
        param: "name",
        msg: "Name must be greater then 3 and less then 30 characters."
      }
    ]);
  }
  const kont = await Konto.findOne({
    company: current_company_id,
    number: number
  });
  if (kont) {
    return res
      .status(400)
      .json([{ param: "number", msg: "Account already exists." }]);
  }
  const prva_cifra = parseInt(number.charAt(0));
  let type;
  let msg;
  if (prva_cifra > 2) {
    type = "P";
  } else {
    type = "D";
  }
  if (konto_id.length > 2) {
    //konto update
    const kon = await Konto.findOne({ _id: konto_id });
    kon.name = name;
    konto_id.number = number;
    await kon.save();
    msg = "Account has been updated.";
  } else {
    //konto create
    await Konto.create({
      number: number,
      name: name,
      type: type,
      company: current_company_id
    });
    msg = "Account has been created.";
  }
  const oldInput = {};
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
  return res.status(200).render("includes/dashboard/kontni_plan", {
    pageTitle: "",
    path: "/kontni_plan",
    hasError: false,
    user: user,
    current_company: current_company,
    sva_konta_i_okvir: sva_konta_i_okvir,
    successMessage: null,
    infoMessage: msg,
    validationErrors: [],
    oldInput: oldInput
  });
};
exports.getKontoPrometOdabir = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });
  const date = `${current_company_year}-01-01`;

  const broj_konta_array = await Konto.find({ company: current_company_id });
  console.log(broj_konta_array);
  return res.status(200).render("includes/dashboard/konto_promet_odabir", {
    pageTitle: "",
    path: "/konto_promet_odabir",
    hasError: false,
    user: user,
    current_company: current_company,
    date: date,
    broj_konta_array: broj_konta_array,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.postKontoPromet = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });

  return res.status(200).render("includes/dashboard/konto_promet", {
    pageTitle: "",
    path: "/konto_promet",
    hasError: false,
    user: user,
    current_company: current_company,

    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
