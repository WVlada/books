const User = require("../models/user");
const Nalog = require("../models/nalog");
const Company = require("../models/company");
const Konto = require("../models/konto");
const Okvir = require("../models/okvir");
const Stav = require("../models/stav");
const accounting = require("accounting-js");
var PdfPrinter = require("pdfmake");
var fs = require("fs");
var path = require('path');

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
  if (number.length < 4 || number.length > 6) {
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

  const broj_konta_array = await Konto.find({
    company: current_company_id
  }).sort("number");
  //console.log(broj_konta_array);
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

  const datum_start = req.body.datum_start;
  const datum_end = req.body.datum_end;
  const konto_start_number = req.body.konto_start;
  const konto_end_number = req.body.konto_end;
  console.log(req.body);
  // ovo mi nije neophodno
  const sva_konta = await Konto.find({
    company: current_company_id,
    number: { $gte: konto_start_number, $lte: konto_end_number }
  }).sort("number");
  //.select("-_id number")
  const sva_konta_array_idova = sva_konta.map(e => e._id);
  const sva_konta_array_brojeva = sva_konta.map(e => e.number);
  console.log(sva_konta_array_idova);
  console.log(sva_konta_array_brojeva);
  const stavovi = await Stav.find({
    company: current_company_id,
    konto: sva_konta_array_idova,
    nalog_date: { $gte: datum_start, $lte: datum_end }
  })
    .populate({ path: "konto", model: Konto, select: "number name" })
    .populate({ path: "nalog", model: Nalog, select: "number" });

  if (stavovi.length == 0) {
    return res.status(200).render("includes/dashboard/nothing_to_display", {
      pageTitle: "",
      path: "/nothing_to_display",
      hasError: false,
      successMessage: null,
      infoMessage: "There are no ledger entries that fit selected criteria.",
      validationErrors: []
    });
  }

  console.log("****");
  console.log(stavovi);
  console.log("****");
  // prolazak samo jednom kroz 2 liste
  let sredjeno = new Map();
  //let sredjeno = {};
  for (let m = 0; m <= sva_konta_array_brojeva.length - 1; m++) {
    sredjeno.set(sva_konta_array_brojeva[m], []);
  }

  for (let j = 0; j <= stavovi.length - 1; j++) {
    if (sredjeno.get(String([stavovi[j].konto.number])).length == 0) {
      sredjeno.set(String(stavovi[j].konto.number), [stavovi[j]]);
    } else {
      let temp = sredjeno.get(String([stavovi[j].konto.number]));
      temp.push(stavovi[j]);
      sredjeno.set(String([stavovi[j].konto.number]), temp);
    }
  }
  // prolazak samo jednom kroz 2 liste
  for (let [key, value] of sredjeno) {
    value.sort(function(a, b) {
      return a.nalog_date - b.nalog_date;
    });
  }
  console.log("****");
  console.log(sredjeno);
  console.log("****");
  return res.status(200).render("includes/dashboard/konto_promet", {
    pageTitle: "",
    path: "/konto_promet",
    hasError: false,
    user: user,
    current_company: current_company,
    sredjeno: sredjeno,
    accounting: accounting,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.getZakljucniListOdabir = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });
  const datum_start = `${current_company_year}-01-01`
  console.log(datum_start)
  return res.status(200).render("includes/dashboard/zakljucni_list_odabir", {
    pageTitle: "",
    path: "/zakljucni_list_odabir",
    hasError: false,
    user: user,
    datum_start: datum_start,
    current_company: current_company,
    current_company_year: current_company_year,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.getZakljucniList = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });

  const datum_start = `${current_company_year}-01-01`;
  let datum_end;
  if (req.query.datumend){
    datum_end = req.query.datumend;
  } else {
    datum_end = `${current_company_year}-12-31`;
  }
  
  const sva_konta = await Konto.find({
    company: current_company_id
  }).sort("number");

  const sva_konta_array_idova = sva_konta.map(e => e._id);
  const sva_konta_array_brojeva = sva_konta.map(e => e.number);
  
  const stavovi = await Stav.find({
    company: current_company_id,
    konto: sva_konta_array_idova,
    nalog_date: { $gte: datum_start, $lte: datum_end }
  })
    .populate({ path: "konto", model: Konto, select: "number name" })
    .populate({ path: "nalog", model: Nalog, select: "number" });

  // prolazak samo jednom kroz 2 liste
  let sredjeno = new Map();
  //let sredjeno = {};
  for (let m = 0; m <= sva_konta_array_brojeva.length - 1; m++) {
    sredjeno.set(sva_konta_array_brojeva[m], []);
  }

  for (let j = 0; j <= stavovi.length - 1; j++) {
    if (sredjeno.get(String([stavovi[j].konto.number])).length == 0) {
      sredjeno.set(String(stavovi[j].konto.number), [stavovi[j]]);
    } else {
      let temp = sredjeno.get(String([stavovi[j].konto.number]));
      temp.push(stavovi[j]);
      sredjeno.set(String([stavovi[j].konto.number]), temp);
    }
  }
  // prolazak samo jednom kroz 2 liste

  for (let [key, value] of sredjeno) {
    value.sort(function(a, b) {
      return a.nalog_date - b.nalog_date;
    });
  }

  //console.log("+++++");
  //console.log(sredjeno);
  //console.log("+++++");
  let brojac = 0;
  let array = [];
  let trocifreni_array = [];
  for (let [key, value] of sredjeno) {
    let trocifreni_broj = key.slice(0, 3);
    if (!trocifreni_array.includes(key)) {
      trocifreni_array.push(trocifreni_broj);
    }
    array[brojac] = {};
    array[brojac]["key"] = key;
    let poc_zbir_d = 0;
    let poc_zbir_p = 0;
    let prom_zbir_d = 0;
    let prom_zbir_p = 0;
    let zbir_d = 0;
    let zbir_p = 0;
    for (let j = 0; j <= value.length - 1; j++) {
      if (value[j].type == "R") {
        poc_zbir_d += value[j].duguje;
        poc_zbir_p += value[j].potrazuje;
      } else {
        prom_zbir_d += value[j].duguje;
        prom_zbir_p += value[j].potrazuje;
      }
      zbir_d += value[j].duguje;
      zbir_p += value[j].potrazuje;
    }
    array[brojac]["poc_zbir_d"] = poc_zbir_d;
    array[brojac]["poc_zbir_p"] = poc_zbir_p;
    array[brojac]["prom_zbir_d"] = prom_zbir_d;
    array[brojac]["prom_zbir_p"] = prom_zbir_p;
    array[brojac]["zbir_d"] = zbir_d;
    array[brojac]["zbir_p"] = zbir_p;

    brojac++;
  }
  // [
  //  [ '0201', 10000, 0, 0, 0, 10000, 0 ],
  //  [ '2001', 10000, 0, 0, 0, 10000, 0 ]
  // ]
  ///sredjen_objekat = {}
  ///for (let m=0; m <= array.length -1; m++){
  ///  let trocifreni_broj = array[m][0].slice(0,3)
  ///  if (sredjen_objekat[trocifreni_broj]) {
  ///    let temp = sredjen_objekat[trocifreni_broj]
  ///    console.log(temp)
  ///    //sredjen_objekat[trocifreni_broj].push(array[m])
  ///  } else {
  ///    sredjen_objekat[trocifreni_broj] = m;
  ///  }
  ///}
  //console.log("111111");

  //console.log("111111");
  //console.log("2222222");
  //console.log(trocifreni_array)
  //console.log("2222222");
  let trocifreni_obj = {};
  for (let z = 0; z <= array.length - 1; z++) {
    let tr = array[z].key.slice(0, 3);
    if (trocifreni_obj[tr]) {
      trocifreni_obj[tr]["poc_zbir_d"] += array[z].poc_zbir_d;
      trocifreni_obj[tr]["poc_zbir_p"] += array[z].poc_zbir_p;
      trocifreni_obj[tr]["prom_zbir_d"] += array[z].prom_zbir_d;
      trocifreni_obj[tr]["prom_zbir_p"] += array[z].prom_zbir_p;
      trocifreni_obj[tr]["zbir_d"] += array[z].zbir_d;
      trocifreni_obj[tr]["zbir_p"] += array[z].zbir_p;
    } else {
      trocifreni_obj[tr] = {};
      trocifreni_obj[tr]["poc_zbir_d"] = array[z].poc_zbir_d;
      trocifreni_obj[tr]["poc_zbir_p"] = array[z].poc_zbir_p;
      trocifreni_obj[tr]["prom_zbir_d"] = array[z].prom_zbir_d;
      trocifreni_obj[tr]["prom_zbir_p"] = array[z].prom_zbir_p;
      trocifreni_obj[tr]["zbir_d"] = array[z].zbir_d;
      trocifreni_obj[tr]["zbir_p"] = array[z].zbir_p;
    }
  }
  //console.log(array);
  // [
  //  { key: '0201',
  //  poc_zbir_d: 10000,
  //  poc_zbir_p: 0,
  //  prom_zbir_d: 0,
  //  prom_zbir_p: 0,
  //  zbir_d: 10000,
  //  zbir_p: 0 },
  // { key: '2001',
  //  poc_zbir_d: 10000,
  //  poc_zbir_p: 0,
  //  prom_zbir_d: 0,
  //  prom_zbir_p: 0,
  //  zbir_d: 10000,
  //  zbir_p: 0 }
  //  ]
  //console.log(trocifreni_obj);
  // {
  // '020' : { poc_zbir_d: 10000, poc_zbir_p: 0, prom_zbir_d: 0, prom_zbir_p: 0, zbir_d: 10000, zbir_p: 0 }
  // }

  for (let [key, value] of Object.entries(trocifreni_obj)) {
    value["key"] = key;
  }
  for (let [key, value] of Object.entries(trocifreni_obj)) {
    array.push(value);
  }
  //console.log(array);
  array.sort((a, b) => {
    if (a.key > b.key) {
      return 1;
    }
    if (a.key < b.key) {
      return -1;
    }
    return 0;
  });
  //let jednocifren = 0;
  //let trocifren = 0;
  //let svi_racuni = new Map();
  //for (let [key, value] of sredjeno) {
  //// u listi imam samo 4 i 5 cifrene
  //  let trocifreni_broj = key.slice(0,3)
  //  if (svi_racuni.get(trocifreni_broj)){
  //    let temp = svi_racuni.get(trocifreni_broj)
  //    temp.push(value)
  //    svi_racuni.set(trocifreni_broj, temp)
  //  } else {
  //    svi_racuni.set(trocifreni_broj, [value])
  //  }
  //}
  // pushovanje ide posle
  //let temp = svi_racuni.get(trocifreni_broj)
  //console.log("+++++");
  //console.log(svi_racuni);
  //console.log("+++++");
  // {
  // '020'=> [ [{duguje: 100, potrazuje: 0}, {duguje:0, potrazuje: 100}] ]
  // }
  const aray_konta_name_and_number = await Konto.find({
    _id: sva_konta_array_idova
  }).select(" name number");
  //console.log(aray_konta_name_and_number)
  for (let i = 0; i <= array.length - 1; i++) {
    for (let j = 0; j <= aray_konta_name_and_number.length - 1; j++) {
      if (array[i].key == aray_konta_name_and_number[j].number) {
        array[i].name = aray_konta_name_and_number[j].name;
        array[i]._id = aray_konta_name_and_number[j]._id;
      }
    }
  }
  //console.log(array);
  //console.log("333");
  //console.log(aray_konta_name_and_number);
  //console.log("333");
  return res.status(200).render("includes/dashboard/zakljucni_list", {
    pageTitle: "",
    path: "/zakljucni_list",
    hasError: false,
    user: user,
    array: array,
    datum_end: datum_end,
    trocifreni_obj: trocifreni_obj,
    current_company: current_company,
    accounting: accounting,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.getZakljucniListTrocifrenOdabir = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });
  const datum_start = `${current_company_year}-01-01`
  
  return res.status(200).render("includes/dashboard/zakljucni_list_trocifren_odabir", {
    pageTitle: "",
    path: "/zakljucni_list_trocifren_odabir",
    hasError: false,
    user: user,
    datum_start: datum_start,
    current_company: current_company,
    current_company_year: current_company_year,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.getZakljucniTrocifren = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });
  
  const datum_start = `${current_company_year}-01-01`;
  let datum_end;
  if (req.query.datumend){
    datum_end = req.query.datumend;
  } else {
    datum_end = `${current_company_year}-12-31`;
  }

  const sva_konta = await Konto.find({
    company: current_company_id
  }).sort("number name");

  const sva_konta_array_idova = sva_konta.map(e => e._id);
  const sva_konta_array_brojeva = sva_konta.map(e => e.number);

  const stavovi = await Stav.find({
    company: current_company_id,
    konto: sva_konta_array_idova,
    nalog_date: { $gte: datum_start, $lte: datum_end }
  })
    .populate({ path: "konto", model: Konto, select: "number name" })
    .populate({ path: "nalog", model: Nalog, select: "number" });

  const m = stavovi.reduce(function(rv, elem) {
    //elem je stav
    (rv[elem.konto.number] = rv[elem.konto.number] || []).push(elem);
    return rv;
  }, {});

  let sva_konta_sa_prometom = {};
  let samo_array_trocifrenih = [];
  for (var x in m) {
    let poc_d = 0;
    let poc_p = 0;
    let d = 0;
    let p = 0;
    let ukup_d = 0;
    let ukup_p = 0;
    for (let i = 0; i <= m[x].length - 1; i++) {
      if (m[x][i].type === "R") {
        poc_d += m[x][i].duguje;
        poc_p += m[x][i].potrazuje;
      } else {
        d += m[x][i].duguje;
        p += m[x][i].potrazuje;
      }
    }
    ukup_d = d + poc_d;
    ukup_p = p + poc_p;

    let sliced = x.slice(0, 3);

    if (sva_konta_sa_prometom[sliced]) {
      sva_konta_sa_prometom[sliced].d += d;
      sva_konta_sa_prometom[sliced].p += p;
      sva_konta_sa_prometom[sliced].poc_d += poc_d;
      sva_konta_sa_prometom[sliced].poc_p += poc_p;
      sva_konta_sa_prometom[sliced].ukup_d += ukup_d;
      sva_konta_sa_prometom[sliced].ukup_p += ukup_p;
    } else {
      sva_konta_sa_prometom[sliced] = {};
      sva_konta_sa_prometom[sliced].d = d;
      sva_konta_sa_prometom[sliced].p = p;
      sva_konta_sa_prometom[sliced].poc_d = poc_d;
      sva_konta_sa_prometom[sliced].poc_p = poc_p;
      sva_konta_sa_prometom[sliced].ukup_d = ukup_d;
      sva_konta_sa_prometom[sliced].ukup_p = ukup_p;
      samo_array_trocifrenih.push(sliced);
    }
  }

  //console.log(sva_konta_sa_prometom);
  //console.log(samo_array_trocifrenih);
  let sorted_samo_array_trocifrenih = samo_array_trocifrenih.sort((a, b) => {
    return a > b;
  });
  let full_trocifreni = [];
  //console.log(sorted_samo_array_trocifrenih);

  for (let i = 0; i <= sorted_samo_array_trocifrenih.length - 1; i++) {
    full_trocifreni.push([
      sorted_samo_array_trocifrenih[i],
      sva_konta_sa_prometom[sorted_samo_array_trocifrenih[i]].poc_d,
      sva_konta_sa_prometom[sorted_samo_array_trocifrenih[i]].poc_p,
      sva_konta_sa_prometom[sorted_samo_array_trocifrenih[i]].d,
      sva_konta_sa_prometom[sorted_samo_array_trocifrenih[i]].p,
      sva_konta_sa_prometom[sorted_samo_array_trocifrenih[i]].ukup_d,
      sva_konta_sa_prometom[sorted_samo_array_trocifrenih[i]].ukup_p
    ]);
  }
  
  return res.status(200).render("includes/dashboard/zakljucni_trocifren", {
    pageTitle: "",
    path: "/zakljucni_trocifren",
    hasError: false,
    user: user,
    datum_end: datum_end,
    full_trocifreni: full_trocifreni,
    current_company: current_company,
    accounting: accounting,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.getKontoPrometPDF = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });
  const datum_start = `01-01-${current_company_year}`;
  const datum_end = `12-31-${current_company_year}`;

  const sva_konta = await Konto.find({
    company: current_company_id
  }).sort("number");
  console.log(sva_konta);
  const sva_konta_array_idova = sva_konta.map(e => e._id);
  const sva_konta_array_brojeva = sva_konta.map(e => e.number);

  const stavovi = await Stav.find({
    company: current_company_id,
    konto: sva_konta_array_idova,
    nalog_date: { $gte: datum_start, $lte: datum_end }
  })
    .populate({ path: "konto", model: Konto, select: "number name" })
    .populate({ path: "nalog", model: Nalog, select: "number" });

  const m = stavovi.reduce(function(rv, elem) {
    //elem je stav
    (rv[elem.konto.number] = rv[elem.konto.number] || []).push(elem);
    return rv;
  }, {});
  console.log(m);
  // { '2001':
  //  [ { duguje: 10000,
  //      potrazuje: 0...
  objekat = {
    content: [{ text: "Accounts overview", style: "report_title" }],
    pageMargins: [40, 40, 40, 40]
  };
  for (var x in m) {
    let value_aray = []; //['valu1', 'value2']
    let saldo = 0;
    let ukup_dug = 0;
    let ukup_potr = 0;
    //let column_header_array = [] //['Konto', 'duguje, 'potrazuje']
    for (let i = 0; i <= m[x].length - 1; i++) {
      saldo += m[x][i].duguje - m[x][i].potrazuje;
      ukup_dug += m[x][i].duguje;
      ukup_potr += m[x][i].potrazuje;
      value_aray.push([
        { text: i, style: "cell_redni_broj" },
        { text: m[x][i].opis, style: "cell_description" },
        { text: accounting.formatNumber(m[x][i].duguje), style: "cell_number" },
        {
          text: accounting.formatNumber(m[x][i].potrazuje),
          style: "cell_number"
        },
        { text: accounting.formatNumber(saldo), style: "cell_number" }
      ]);
    }
    value_aray.push([
      { text: "", style: "red_zbir" },
      { text: "Total:", style: "red_zbir" },
      { text: accounting.formatNumber(ukup_dug), style: "red_zbir" },
      { text: accounting.formatNumber(ukup_potr), style: "red_zbir" },
      { text: accounting.formatNumber(saldo), style: "red_zbir" }
    ]);
    objekat.content.push(`\n`); // blanko red
    //objekat.content.push({
    //  text: `${x} - ${m[x][0].konto.name}`,
    //  style: "acc_number_and_name"
    //});
    let column_header_array = [
      { text: `${x}`, style: "table_header" },
      { text: `${m[x][0].konto.name}`, style: "table_header_description" },
      { text: "Owes", style: "table_header" },
      { text: "Claims", style: "table_header" },
      { text: "Saldo", style: "table_header" }
    ];
    objekat.content.push({
      table: {
        widths: [30, "*", 80, 80, 80],
        body: [column_header_array, ...value_aray]
      },
      style: "table_style",
      layout: "lightHorizontalLines"
    });
  }

  objekat.styles = {
    table_header_description: {
      fontSize: 9,
      alignment: "left",
      fillColor: "#b1adbf"
    },
    footer_style: {
      margin: [0, 10, 0, 0],
      alignment: "center"
    },
    report_title: {
      fontSize: 11,
      italics: true,
      bold: true,
      alignment: "center"
    },
    acc_number_and_name: {
      fontSize: 10
    },
    table_style: {
      fontSize: 8,
      bold: false,
      margin: [0, 0, 0, 10] //// margin: [left, top, right, bottom]
    },
    red_zbir: {
      italics: true,
      bold: true,
      fillColor: "#dcd7e6",
      alignment: "center"
    },
    table_header: {
      fontSize: 9,
      alignment: "center",
      fillColor: "#b1adbf"
    },
    page_header_left: {
      color: "grey",
      margin: [15, 15, 0, 0],
      italics: true,
      fontSize: 10
    },
    page_header_right: {
      color: "grey",
      margin: [0, 15, 15, 0],
      italics: true,
      alignment: "right",
      fontSize: 10
    },
    cell_redni_broj: {
      alignment: "center"
    },
    cell_description: {
      alignment: "left"
    },
    cell_number: {
      alignment: "right"
    }
  };

  objekat.header = [
    {
      columns: [
        {
          text: `${current_company.name}, ${current_company_year} `,
          style: "page_header_left"
        },
        {
          text: `Date: ${new Date().getDate()}-${new Date().getMonth() +
            1}-${new Date().getUTCFullYear()} `,
          style: "page_header_right"
        }
      ]
    }
  ];
  // dynamic footers dont work on web workers
  //objekat.footer = function(currentPage, pageCount) {
  //  return [
  //    {
  //      text: `${currentPage.toString()} + " of " + ${pageCount}`,
  //      style: "footer_style"
  //    }
  //  ];
  //};
  console.log(objekat);
  return res.status(200).json(objekat);
};

exports.getZakljucniPDF = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });
  const datum_start = `${current_company_year}-01-01`;
  
  //console.log(req.query)
  let datum_end;
  if (req.query.datumend) {
    datum_end = req.query.datumend
  } else { 
    datum_end = `${current_company_year}-12-31`;
  }
  

  const sva_konta = await Konto.find({
    company: current_company_id
  }).sort("number");
  
  const sva_konta_array_idova = sva_konta.map(e => e._id);
  
  const stavovi = await Stav.find({
    company: current_company_id,
    konto: sva_konta_array_idova,
    nalog_date: { $gte: datum_start, $lte: datum_end }
  })
    .populate({ path: "konto", model: Konto, select: "number name" })
    .populate({ path: "nalog", model: Nalog, select: "number" });

  const m = stavovi.reduce(function(rv, elem) {
    //elem je stav
    (rv[elem.konto.number] = rv[elem.konto.number] || []).push(elem);
    return rv;
  }, {});
  
  let sva_konta_sa_prometom = {};
  //console.log(m)
  for (var x in m) {
    let poc_d = 0;
    let poc_p = 0;
    let dug = 0;
    let pot = 0;
    let ukup_d = 0;
    let ukup_p = 0;
    let saldo_d = 0;
    let saldo_p = 0;
    let name;
    for (let i = 0; i <= m[x].length - 1; i++) {
      if (m[x][i].type === "R") {
        poc_d += m[x][i].duguje;
        poc_p += m[x][i].potrazuje;
      } else {
        dug += m[x][i].duguje;
        pot += m[x][i].potrazuje;
      }
    }
    ukup_d = dug + poc_d;
    ukup_p = pot + poc_p;
    name = m[x][0].konto.name;

    sva_konta_sa_prometom[x] = {}
    sva_konta_sa_prometom[x].poc_d = poc_d;
    sva_konta_sa_prometom[x].poc_p = poc_p;
    sva_konta_sa_prometom[x].dug = dug;
    sva_konta_sa_prometom[x].pot = pot;
    sva_konta_sa_prometom[x].ukup_dug = ukup_d;
    sva_konta_sa_prometom[x].ukup_pot = ukup_p;
    sva_konta_sa_prometom[x].name = name;

    (sva_konta_sa_prometom['array_konta'] = sva_konta_sa_prometom['array_konta'] || []).push(x)
    
    sva_konta_sa_prometom[x].saldo_d = 0;
    sva_konta_sa_prometom[x].saldo_p = 0;

    ukup_d - ukup_p > 0 ? sva_konta_sa_prometom[x].saldo_d = ukup_d - ukup_p : sva_konta_sa_prometom[x].saldo_p = ukup_p - ukup_d;
  
  }

  sva_konta_sa_prometom.array_konta = sva_konta_sa_prometom.array_konta.sort()
  
  for (let i=0; i <= sva_konta_sa_prometom.array_konta.length - 1; i++) {
    // ubacivanje trocifrenih
    let x = sva_konta_sa_prometom.array_konta[i].slice(0,3);
    if (sva_konta_sa_prometom[x]) {
          sva_konta_sa_prometom[x].dug += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug;
          sva_konta_sa_prometom[x].pot += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot;
          sva_konta_sa_prometom[x].poc_d += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d;
          sva_konta_sa_prometom[x].poc_p += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p;
          sva_konta_sa_prometom[x].ukup_dug += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug;
          sva_konta_sa_prometom[x].ukup_pot += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot;
    } else {
          sva_konta_sa_prometom[x] = {};
          sva_konta_sa_prometom[x].dug = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug;
          sva_konta_sa_prometom[x].pot = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot;
          sva_konta_sa_prometom[x].poc_d = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d;
          sva_konta_sa_prometom[x].poc_p = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p;
          sva_konta_sa_prometom[x].ukup_dug = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug;
          sva_konta_sa_prometom[x].ukup_pot = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot;
          //sva_konta_sa_prometom.array_konta.push(x)
    }
    // ubacivanje jednocifrenih
    let m = sva_konta_sa_prometom.array_konta[i].slice(0,1);
    if (sva_konta_sa_prometom[m]) {
          sva_konta_sa_prometom[m].dug += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug;
          sva_konta_sa_prometom[m].pot += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot;
          sva_konta_sa_prometom[m].poc_d += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d;
          sva_konta_sa_prometom[m].poc_p += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p;
          sva_konta_sa_prometom[m].ukup_dug += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug;
          sva_konta_sa_prometom[m].ukup_pot += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot;
    } else {
          sva_konta_sa_prometom[m] = {};
          sva_konta_sa_prometom[m].dug = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug;
          sva_konta_sa_prometom[m].pot = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot;
          sva_konta_sa_prometom[m].poc_d = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d;
          sva_konta_sa_prometom[m].poc_p = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p;
          sva_konta_sa_prometom[m].ukup_dug = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug;
          sva_konta_sa_prometom[m].ukup_pot = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot;
    }
  }
  // SORT sa ubacivanjem trocifrenih i jednocifrenih
  sva_konta_sa_prometom.array_konta = sva_konta_sa_prometom.array_konta.sort()
  console.log(sva_konta_sa_prometom.array_konta)
  for(let i = 0; i <= sva_konta_sa_prometom.array_konta.length -1; i++){
    let x;
    let y;
    let m; // jednocifreni
    let z; // jednocifreni
    if (sva_konta_sa_prometom.array_konta[i].length !=3 && sva_konta_sa_prometom.array_konta[i].length !=1)
    {
      x = sva_konta_sa_prometom.array_konta[i].slice(0,3)
      m = sva_konta_sa_prometom.array_konta[i].slice(0,1) // jednocifreni
      if (i == sva_konta_sa_prometom.array_konta.length-1){
        y = undefined;
        z = undefined; // jednocifreni
      }
      else {
        y = sva_konta_sa_prometom.array_konta[i+1].slice(0,3)
        z = sva_konta_sa_prometom.array_konta[i+1].slice(0,1)
      }
      if (x != y)
      {
        sva_konta_sa_prometom.array_konta.splice(i+1, 0, x)
      }
      if (m != z)
      {
        sva_konta_sa_prometom.array_konta.splice(i+2, 0, m)
      }
    }
  }
  console.log(sva_konta_sa_prometom.array_konta)
  // SORT sa ubacivanjem trocifrenih i jednocifrenih

  // ovde mi jos trocifrena konta nemaju saldo
  for(let i=0; i<= sva_konta_sa_prometom.array_konta.length -1; i++){
    if (sva_konta_sa_prometom.array_konta[i].length == 3){
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d = 0;
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p = 0;
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug - 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot > 0 ? 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d = 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug - 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot : 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p =
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot - sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug
    }
  }
  // ovde mi jos jednocifrena konta nemaju saldo
  for(let i=0; i<= sva_konta_sa_prometom.array_konta.length -1; i++){
    if (sva_konta_sa_prometom.array_konta[i].length == 1){
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d = 0;
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p = 0;
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug - 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot > 0 ? 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d = 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug - 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot : 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p =
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot - sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug
    }
  }
  //
  sva_konta_sa_prometom['0'] ? sva_konta_sa_prometom['0'].name = 'LONG TERM ASSETS' :  undefined
  sva_konta_sa_prometom['1'] ? sva_konta_sa_prometom['1'].name = 'CURRENT ASSETS' : undefined
  sva_konta_sa_prometom['2'] ? sva_konta_sa_prometom['2'].name = 'CURRENT ASSETS' : undefined
  sva_konta_sa_prometom['3'] ? sva_konta_sa_prometom['3'].name = 'CAPITAL' : undefined
  sva_konta_sa_prometom['4'] ? sva_konta_sa_prometom['4'].name = 'LIABILITIES' : undefined
  sva_konta_sa_prometom['5'] ? sva_konta_sa_prometom['5'].name = 'EXPENSES' : undefined
  sva_konta_sa_prometom['6'] ? sva_konta_sa_prometom['6'].name = 'REVENUES' : undefined
  //
  console.log('***') 
  console.log(sva_konta_sa_prometom)
  console.log('***')
  //'4601':
  // { poc_d: 0,
  //   poc_p: 0,
  //   dug: 50000,
  //   pot: 1000000,
  //   ukup_dug: 50000,
  //   ukup_pot: 1000000,
  //   saldo_d: 0,
  //   saldo_p: 950000 },
  //array_konta:
  // [ '020',
  //   '0201',
  //   '200',
  //   '2001',
  objekat = {
    content: [ { 
      table: {
        widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
        body: [
            [{ text:'Start', colSpan: 2}, {},
            { text:'Turnover', colSpan: 2}, {},
            { text:'Total', colSpan: 2}, {},
            { text:'Summary', colSpan: 2}, {} ],
            [{text:'owes'},{text:'claims'},{text:'owes'},{text:'claims'},{text:'owes'},{text:'claims'},{text:'owes'},{text:'claims'}]
          ]
        
    },
    style: "closing_sheet_header_table",
    layout: 'noBorders'}
    ],
    pageMargins: [40, 40, 40, 40],
    pageOrientation: 'landscape',
  };
  
  let value_array = []
  let column_header_array = []
  for (let i = 0; i <= sva_konta_sa_prometom.array_konta.length-1; i ++){
    //let sliced = sva_konta_sa_prometom.array_konta[i].slice(0,3);
    value_array = []
    column_header_array = []
    if (sva_konta_sa_prometom.array_konta[i].length == 3) {
      current_trocifreni = sva_konta_sa_prometom.array_konta[i];
      column_header_array.push(
        
        { text: `${current_trocifreni}`, style: "cell_header_trocifreni" },
        { text: `Group ${current_trocifreni}`, style: "cell_header_trocifreni_description", colSpan: 7 }, {},{},{},{},{},{}
        
      )
      value_array.push(
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" }
      )
      objekat.content.push({
        table: {
          widths: [81, 81, 81, 81, 81, 81, 81, 81],
          body: [column_header_array, value_array]
        },
        style: "table_style_trocifreni",
        layout: "lightHorizontalLines"
      });
    } else if (sva_konta_sa_prometom.array_konta[i].length != 1) {
      column_header_array.push(
        
        { text: `${sva_konta_sa_prometom.array_konta[i]}`, style: "cell_header" },
        { text: `${sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].name}`, style: "cell_header_description", colSpan: 7 }, {},{},{},{},{},{}
        
      )
      value_array.push(
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" }
      )
      objekat.content.push({
        table: {
          widths: [81, 81, 81, 81, 81, 81, 81, 81],
          body: [column_header_array, value_array]
        },
        style: "table_style",
        layout: "lightHorizontalLines"
      });
    } else { // jednocifreni
      column_header_array.push(
        
        { text: `${sva_konta_sa_prometom.array_konta[i]}`, style: "cell_header_jednocifren" },
        { text: `${sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].name}`, style: "cell_header_jednocifren_description", colSpan: 7 }, {},{},{},{},{},{}
        
      )
      value_array.push(
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" }
      )
      objekat.content.push({
        table: {
          widths: [81, 81, 81, 81, 81, 81, 81, 81],
          body: [column_header_array, value_array]
        },
        style: "table_style",
        layout: "lightHorizontalLines",
        pageBreak: 'after'//,
        //pageBreakAfter: function (currentNode, followingNodesOnPage,
        //  nodesOnNextPage, previousNodesOnPage) {
        //    console.log(currentNode)
        //  return currentNode.pageNumbers.length < 1;
        //  }
        });
      // jos sam u jednocifrenom elsu
      

    }
   
  }
  objekat.styles = {
    cell_header_jednocifren: {
      alignment: "center",
      fillColor: "#b1adbf"
    },
    cell_header_jednocifren_description: {
      alignment: "left",
      fillColor: "#b1adbf"
    },
    cell_number_jednocifren: {
      alignment: "right",
      fillColor: "#b1adbf"
    },
    cell_header: {
      fontSize: 9,
      alignment: "right",
      fillColor: "#f6f5f8"
    },
    cell_header_description: {
      fontSize: 9,
      alignment: "left",
      fillColor: "#f6f5f8"
    },
    cell_header_trocifreni: {
      fontSize: 9,
      alignment: "center",
      fillColor: "#dcd7e6",
      margin: [15,0,0,0]
    },
    cell_header_trocifreni_description: {
      fontSize: 9,
      alignment: "left",
      fillColor: "#dcd7e6"
    },
    cell_number: {
      alignment: "right",
      fillColor: "#f6f5f8",
      bold: false
    },
    cell_number_trocifreni: {
      alignment: "right",
      fillColor: "#dcd7e6",
      bold: true
    },
    page_header_left: {
      color: "grey",
      margin: [15, 15, 0, 0],
      italics: true,
      fontSize: 10
    },
    page_header_center: {
      color: "black",
      alignment: "center",
      margin: [0, 15, 0, 0],
      italics: true,
      bold: true,
      fontSize: 11
    },
    page_header_right: {
      color: "grey",
      margin: [0, 15, 15, 0],
      italics: true,
      alignment: "right",
      fontSize: 10
    },
    closing_sheet_header_table: {
      fontSize: 9,
      color: "white",
      alignment: 'center',
      fillColor: "#b1adbf",
      //fillColor: "#dcd7e6",
      margin: [0, 0, 0, 15]
    },
    footer_style: {
      margin: [0, 10, 0, 0],
      alignment: "center"
    },
    acc_number_and_name: {
      fontSize: 10
    },
    table_style: {
      fontSize: 8,
      bold: false,
    },
    table_style_trocifreni: {
      fontSize: 8,
      bold: false,
      margin: [0, 0, 0, 15] //// margin: [left, top, right, bottom]
    },
    cell_description: {
      alignment: "left"
    }
  };
//
  objekat.header = [
    {
      columns: [
        {
          text: `${current_company.name}, ${current_company_year} `,
          style: "page_header_left"
        },
        {
           text: `Closing sheet from ${datum_start} to ${datum_end}`, style: "page_header_center" 
        },
        {
          text: `Date: ${new Date().getDate()}-${new Date().getMonth() +
            1}-${new Date().getUTCFullYear()} `,
          style: "page_header_right"
        }
      ]
    }
  ];
  //// dynamic footers dont work on web workers
  ////objekat.footer = function(currentPage, pageCount) {
  ////  return [
  ////    {
  ////      text: `${currentPage.toString()} + " of " + ${pageCount}`,
  ////      style: "footer_style"
  ////    }
  ////  ];
  ////};
  //console.log(objekat);
  return res.status(200).json(objekat);
};
exports.getZakljucniTrocifrenPDF = async (req, res, nex) => {
  const pdfMakePrinter = require('pdfmake/src/printer');
  
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });
  const datum_start = `${current_company_year}-01-01`;
  let datum_end;
  if (req.query.datumend){
    datum_end = req.query.datumend;
  } else {
    datum_end = `${current_company_year}-12-31`;
  }

  const sva_konta = await Konto.find({
    company: current_company_id
  }).sort("number");
  
  const sva_konta_array_idova = sva_konta.map(e => e._id);
  
  const stavovi = await Stav.find({
    company: current_company_id,
    konto: sva_konta_array_idova,
    nalog_date: { $gte: datum_start, $lte: datum_end }
  })
    .populate({ path: "konto", model: Konto, select: "number name" })
    .populate({ path: "nalog", model: Nalog, select: "number" });

  const m = stavovi.reduce(function(rv, elem) {
    //elem je stav
    (rv[elem.konto.number] = rv[elem.konto.number] || []).push(elem);
    return rv;
  }, {});
  
  let sva_konta_sa_prometom = {};
  //console.log(m)
  for (var x in m) {
    let poc_d = 0;
    let poc_p = 0;
    let dug = 0;
    let pot = 0;
    let ukup_d = 0;
    let ukup_p = 0;
    let saldo_d = 0;
    let saldo_p = 0;
    let name;
    for (let i = 0; i <= m[x].length - 1; i++) {
      if (m[x][i].type === "R") {
        poc_d += m[x][i].duguje;
        poc_p += m[x][i].potrazuje;
      } else {
        dug += m[x][i].duguje;
        pot += m[x][i].potrazuje;
      }
    }
    ukup_d = dug + poc_d;
    ukup_p = pot + poc_p;
    name = m[x][0].konto.name;

    sva_konta_sa_prometom[x] = {}
    sva_konta_sa_prometom[x].poc_d = poc_d;
    sva_konta_sa_prometom[x].poc_p = poc_p;
    sva_konta_sa_prometom[x].dug = dug;
    sva_konta_sa_prometom[x].pot = pot;
    sva_konta_sa_prometom[x].ukup_dug = ukup_d;
    sva_konta_sa_prometom[x].ukup_pot = ukup_p;
    sva_konta_sa_prometom[x].name = name;

    (sva_konta_sa_prometom['array_konta'] = sva_konta_sa_prometom['array_konta'] || []).push(x)
    
    sva_konta_sa_prometom[x].saldo_d = 0;
    sva_konta_sa_prometom[x].saldo_p = 0;

    ukup_d - ukup_p > 0 ? sva_konta_sa_prometom[x].saldo_d = ukup_d - ukup_p : sva_konta_sa_prometom[x].saldo_p = ukup_p - ukup_d;
  }
  
  sva_konta_sa_prometom.array_konta = sva_konta_sa_prometom.array_konta.sort()
  
  for (let i=0; i <= sva_konta_sa_prometom.array_konta.length - 1; i++) {
    // ubacivanje trocifrenih
    let x = sva_konta_sa_prometom.array_konta[i].slice(0,3);
    if (sva_konta_sa_prometom[x]) {
          sva_konta_sa_prometom[x].dug += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug;
          sva_konta_sa_prometom[x].pot += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot;
          sva_konta_sa_prometom[x].poc_d += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d;
          sva_konta_sa_prometom[x].poc_p += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p;
          sva_konta_sa_prometom[x].ukup_dug += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug;
          sva_konta_sa_prometom[x].ukup_pot += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot;
    } else {
          sva_konta_sa_prometom[x] = {};
          sva_konta_sa_prometom[x].dug = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug;
          sva_konta_sa_prometom[x].pot = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot;
          sva_konta_sa_prometom[x].poc_d = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d;
          sva_konta_sa_prometom[x].poc_p = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p;
          sva_konta_sa_prometom[x].ukup_dug = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug;
          sva_konta_sa_prometom[x].ukup_pot = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot;
          //sva_konta_sa_prometom.array_konta.push(x)
    }
    // ubacivanje jednocifrenih
    let m = sva_konta_sa_prometom.array_konta[i].slice(0,1);
    if (sva_konta_sa_prometom[m]) {
          sva_konta_sa_prometom[m].dug += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug;
          sva_konta_sa_prometom[m].pot += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot;
          sva_konta_sa_prometom[m].poc_d += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d;
          sva_konta_sa_prometom[m].poc_p += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p;
          sva_konta_sa_prometom[m].ukup_dug += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug;
          sva_konta_sa_prometom[m].ukup_pot += sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot;
    } else {
          sva_konta_sa_prometom[m] = {};
          sva_konta_sa_prometom[m].dug = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug;
          sva_konta_sa_prometom[m].pot = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot;
          sva_konta_sa_prometom[m].poc_d = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d;
          sva_konta_sa_prometom[m].poc_p = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p;
          sva_konta_sa_prometom[m].ukup_dug = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug;
          sva_konta_sa_prometom[m].ukup_pot = sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot;
    }
  }
  // SORT sa ubacivanjem trocifrenih i jednocifrenih
  sva_konta_sa_prometom.array_konta = sva_konta_sa_prometom.array_konta.sort()
  console.log(sva_konta_sa_prometom.array_konta)
  for(let i = 0; i <= sva_konta_sa_prometom.array_konta.length -1; i++){
    let x;
    let y;
    let m; // jednocifreni
    let z; // jednocifreni
    if (sva_konta_sa_prometom.array_konta[i].length !=3 && sva_konta_sa_prometom.array_konta[i].length !=1)
    {
      x = sva_konta_sa_prometom.array_konta[i].slice(0,3)
      m = sva_konta_sa_prometom.array_konta[i].slice(0,1) // jednocifreni
      if (i == sva_konta_sa_prometom.array_konta.length-1){
        y = undefined;
        z = undefined; // jednocifreni
      }
      else {
        y = sva_konta_sa_prometom.array_konta[i+1].slice(0,3)
        z = sva_konta_sa_prometom.array_konta[i+1].slice(0,1)
      }
      if (x != y)
      {
        sva_konta_sa_prometom.array_konta.splice(i+1, 0, x)
      }
      if (m != z)
      {
        sva_konta_sa_prometom.array_konta.splice(i+2, 0, m)
      }
    }
  }
  console.log(sva_konta_sa_prometom.array_konta)
  // SORT sa ubacivanjem trocifrenih i jednocifrenih

  // ovde mi jos trocifrena konta nemaju saldo
  for(let i=0; i<= sva_konta_sa_prometom.array_konta.length -1; i++){
    if (sva_konta_sa_prometom.array_konta[i].length == 3){
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d = 0;
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p = 0;
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug - 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot > 0 ? 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d = 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug - 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot : 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p =
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot - sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug
    }
  }
  // ovde mi jos jednocifrena konta nemaju saldo
  for(let i=0; i<= sva_konta_sa_prometom.array_konta.length -1; i++){
    if (sva_konta_sa_prometom.array_konta[i].length == 1){
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d = 0;
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p = 0;
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug - 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot > 0 ? 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d = 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug - 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot : 
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p =
      sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot - sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug
    }
  }
  //
  sva_konta_sa_prometom['0'] ? sva_konta_sa_prometom['0'].name = 'LONG TERM ASSETS' :  undefined
  sva_konta_sa_prometom['1'] ? sva_konta_sa_prometom['1'].name = 'CURRENT ASSETS' : undefined
  sva_konta_sa_prometom['2'] ? sva_konta_sa_prometom['2'].name = 'CURRENT ASSETS' : undefined
  sva_konta_sa_prometom['3'] ? sva_konta_sa_prometom['3'].name = 'CAPITAL' : undefined
  sva_konta_sa_prometom['4'] ? sva_konta_sa_prometom['4'].name = 'LIABILITIES' : undefined
  sva_konta_sa_prometom['5'] ? sva_konta_sa_prometom['5'].name = 'EXPENSES' : undefined
  sva_konta_sa_prometom['6'] ? sva_konta_sa_prometom['6'].name = 'REVENUES' : undefined
  //
  console.log('***') 
  console.log(sva_konta_sa_prometom)
  console.log('***')
  //'4601':
  // { poc_d: 0,
  //   poc_p: 0,
  //   dug: 50000,
  //   pot: 1000000,
  //   ukup_dug: 50000,
  //   ukup_pot: 1000000,
  //   saldo_d: 0,
  //   saldo_p: 950000 },
  //array_konta:
  // [ '020',
  //   '0201',
  //   '200',
  //   '2001',
  objekat = {
    defaultStyle: {
      font: 'Courier'
    },
    content: [ { 
      table: {
        widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
        body: [
            [{ text:'Start', colSpan: 2}, {},
            { text:'Turnover', colSpan: 2}, {},
            { text:'Total', colSpan: 2}, {},
            { text:'Summary', colSpan: 2}, {} ],
            [{text:'owes'},{text:'claims'},{text:'owes'},{text:'claims'},{text:'owes'},{text:'claims'},{text:'owes'},{text:'claims'}]
          ]
        
    },
    style: "closing_sheet_header_table",
    layout: 'noBorders'}
    ],
    pageMargins: [40, 40, 40, 40],
    pageOrientation: 'landscape',
  };
  
  let value_array = []
  let column_header_array = []
  for (let i = 0; i <= sva_konta_sa_prometom.array_konta.length-1; i ++){
    //let sliced = sva_konta_sa_prometom.array_konta[i].slice(0,3);
    value_array = []
    column_header_array = []
    if (sva_konta_sa_prometom.array_konta[i].length == 3) {
      current_trocifreni = sva_konta_sa_prometom.array_konta[i];
      column_header_array.push(
        
        { text: `${current_trocifreni}`, style: "cell_header_trocifreni" },
        { text: `Group ${current_trocifreni}`, style: "cell_header_trocifreni_description", colSpan: 7 }, {},{},{},{},{},{}
        
      )
      value_array.push(
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" },
        { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_trocifreni" }
      )
      objekat.content.push({
        table: {
          widths: [81, 81, 81, 81, 81, 81, 81, 81],
          body: [column_header_array, value_array]
        },
        style: "table_style_trocifreni",
        layout: "lightHorizontalLines"
      });
    } 
    //else if (sva_konta_sa_prometom.array_konta[i].length != 1) {
    //  column_header_array.push(
    //    
    //    { text: `${sva_konta_sa_prometom.array_konta[i]}`, style: "cell_header" },
    //    { text: `${sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].name}`, style: "cell_header_description", colSpan: 7 }, {},{},{},{},{},{}
    //    
    //  )
    //  value_array.push(
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number" }
    //  )
    //  objekat.content.push({
    //    table: {
    //      widths: [81, 81, 81, 81, 81, 81, 81, 81],
    //      body: [column_header_array, value_array]
    //    },
    //    style: "table_style",
    //    layout: "lightHorizontalLines"
    //  });
    //} else { // jednocifreni
    //  column_header_array.push(
    //    
    //    { text: `${sva_konta_sa_prometom.array_konta[i]}`, style: "cell_header_jednocifren" },
    //    { text: `${sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].name}`, style: "cell_header_jednocifren_description", colSpan: 7 }, {},{},{},{},{},{}
    //    
    //  )
    //  value_array.push(
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].poc_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_dug, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].ukup_pot, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_d, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" },
    //    { text: accounting.formatNumber(sva_konta_sa_prometom[sva_konta_sa_prometom.array_konta[i]].saldo_p, {precision: 2, thousand: '.', decimal: ','}), style: "cell_number_jednocifren" }
    //  )
    //  objekat.content.push({
    //    table: {
    //      widths: [81, 81, 81, 81, 81, 81, 81, 81],
    //      body: [column_header_array, value_array]
    //    },
    //    style: "table_style",
    //    layout: "lightHorizontalLines",
    //    pageBreak: 'after',
    //    pageBreakAfter: function (currentNode, followingNodesOnPage,
    //      nodesOnNextPage, previousNodesOnPage) {
    //        console.log(currentNode)
    //      return currentNode.pageNumbers.length < 1;
    //  }
    //  });
    //  // jos sam u jednocifrenom elsu
    //  
//
    //}
   
  }
  objekat.styles = {
    cell_header_jednocifren: {
      alignment: "center",
      fillColor: "#b1adbf"
    },
    cell_header_jednocifren_description: {
      alignment: "left",
      fillColor: "#b1adbf"
    },
    cell_number_jednocifren: {
      alignment: "right",
      fillColor: "#b1adbf"
    },
    cell_header: {
      fontSize: 9,
      alignment: "right",
      fillColor: "#f6f5f8"
    },
    cell_header_description: {
      fontSize: 9,
      alignment: "left",
      fillColor: "#f6f5f8"
    },
    cell_header_trocifreni: {
      fontSize: 9,
      alignment: "center",
      fillColor: "#dcd7e6",
      margin: [15,0,0,0]
    },
    cell_header_trocifreni_description: {
      fontSize: 9,
      alignment: "left",
      fillColor: "#dcd7e6"
    },
    cell_number: {
      alignment: "right",
      fillColor: "#f6f5f8",
      bold: false
    },
    cell_number_trocifreni: {
      alignment: "right",
      fillColor: "#dcd7e6",
      bold: true
    },
    page_header_left: {
      color: "grey",
      margin: [15, 15, 0, 0],
      italics: true,
      fontSize: 10
    },
    page_header_center: {
      color: "black",
      alignment: "center",
      margin: [0, 15, 0, 0],
      italics: false,
      bold: true,
      fontSize: 10
    },
    page_header_right: {
      color: "grey",
      margin: [0, 15, 15, 0],
      italics: true,
      alignment: "right",
      fontSize: 10
    },
    closing_sheet_header_table: {
      fontSize: 9,
      color: "white",
      alignment: 'center',
      fillColor: "#b1adbf",
      //fillColor: "#dcd7e6",
      margin: [0, 0, 0, 15]
    },
    footer_style: {
      margin: [0, 10, 0, 0],
      alignment: "center"
    },
    acc_number_and_name: {
      fontSize: 10
    },
    table_style: {
      fontSize: 8,
      bold: false,
    },
    table_style_trocifreni: {
      fontSize: 8,
      bold: false,
      margin: [0, 0, 0, 15] //// margin: [left, top, right, bottom]
    },
    cell_description: {
      alignment: "left"
    }
  };
//
  objekat.header = [
    {
      columns: [
        {
          text: `${current_company.name}, ${current_company_year} `,
          style: "page_header_left"
        },
        {
           text: `3 - digit closing sheet \n \n from ${datum_start} to ${datum_end}`, style: "page_header_center" 
        },
        {
          text: `Date: ${new Date().getDate()}-${new Date().getMonth() +
            1}-${new Date().getUTCFullYear()} `,
          style: "page_header_right"
        }
      ]
    }
  ];




  function generatePdf(objekat, callback) {
    try {
      var fontDescriptors = {
        Courier: {
          normal: 'Courier',
          bold: 'Courier-Bold',
          italics: 'Courier-Oblique',
          bolditalics: 'Courier-BoldOblique'
        }
      };
      const printer = new pdfMakePrinter(fontDescriptors);
      const doc = printer.createPdfKitDocument(objekat);
      let chunks = [];
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      doc.on('end', () => {
        callback(Buffer.concat(chunks))
      });
      doc.end();
    } catch(err) {
      throw(err);
    }
  };
  generatePdf(objekat, (response) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.send(response); 
  });
}

exports.getHTMLToPDF = (req, res, nex) => {
  
}