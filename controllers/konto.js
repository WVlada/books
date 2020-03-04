const User = require("../models/user");
const Nalog = require("../models/nalog");
const Company = require("../models/company");
const Konto = require("../models/konto");
const Okvir = require("../models/okvir");
const Stav = require("../models/stav");
const accounting = require("accounting-js");

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
exports.getZakljucniList = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });

  const datum_start = `01-01-${current_company_year}`;
  const datum_end = `12-31-${current_company_year}`;
  //const konto_start_number = req.body.konto_start;
  //const konto_end_number = req.body.konto_end;
  //console.log(req.body);
  const sva_konta = await Konto.find({
    company: current_company_id
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

  console.log("+++++");
  //console.log(sredjeno);
  console.log("+++++");
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
  console.log("111111");

  console.log("111111");
  console.log("2222222");
  //console.log(trocifreni_array)
  console.log("2222222");
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
  for (let i = 0; i <= array.length - 1; i++) {
    for (let j = 0; j <= aray_konta_name_and_number.length - 1; j++) {
      if (array[i].key == aray_konta_name_and_number[j].number) {
        array[i].name = aray_konta_name_and_number[j].name;
      }
    }
  }
  console.log(array);
  console.log("333");
  console.log(aray_konta_name_and_number);
  console.log("333");
  return res.status(200).render("includes/dashboard/zakljucni_list", {
    pageTitle: "",
    path: "/zakljucni_list",
    hasError: false,
    user: user,
    array: array,
    trocifreni_obj: trocifreni_obj,
    current_company: current_company,
    accounting: accounting,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.getZakljucniTrocifreni = async (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company = await Company.findOne({ _id: current_company_id });
  const datum_start = `01-01-${current_company_year}`;
  const datum_end = `12-31-${current_company_year}`;

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

  console.log(sva_konta_sa_prometom);
  console.log(samo_array_trocifrenih);
  let sorted_samo_array_trocifrenih = samo_array_trocifrenih.sort((a, b) => {
    return a > b;
  });
  let full_trocifreni = [];
  console.log(sorted_samo_array_trocifrenih);

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

  return res.status(200).render("includes/dashboard/zakljucni_trocifreni", {
    pageTitle: "",
    path: "/zakljucni_trocifreni",
    hasError: false,
    user: user,
    full_trocifreni: full_trocifreni,
    current_company: current_company,
    accounting: accounting,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
