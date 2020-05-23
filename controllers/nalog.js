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

const NALOGS_PER_PAGE = 22;
exports.getNalog = async (req, res, next) => {
  console.log("*************");
  const user = req.user;
  const company_id = req.current_company_id;
  console.log("*************");
  console.log(req.session);
  console.log("*************");
  console.log(req.user);
  console.log("*************");

  const current_company_year = req.current_company_year;
  // sifre komitenata
  const sifra_komitenta_array = await Komitent.find({
    company: company_id
  }).select("sifra name");
  // sifre komitenata
  // pozivi na broj
  const svi_stavovi = await Stav.find({ company: company_id });
  const poziv_na_broj_array_sa_undefined = svi_stavovi.map(e => {
    return e.pozivnabroj;
  });
  const poziv_na_broj_array = poziv_na_broj_array_sa_undefined.filter(
    item => item
  );
  // pozivi na broj
  // broj konta
  const broj_konta_array = await Konto.find({
    company: company_id
  }).select("-_id number name");
  // broj konta
  // brojevi naloga
  
  if (broj_konta_array.length == 0){
    return res.status(422).json({param: "321", msg: "Before creating an Entry, minimum 1 Konto must exist. Create Konto first."});
  }

  const brojevi_postojecih_naloga = [];
  const brojevi = [];
  const nalog_type = "N";
  const svi_nalozi_firme = await Nalog.find({
    company: company_id,
    type: nalog_type,
    year: current_company_year
  });
  for (let i = 0; i <= svi_nalozi_firme.length - 1; i++) {
    brojevi_postojecih_naloga.push(svi_nalozi_firme[i].number);
  }
  let j = 1;
  while (brojevi.length < 10) {
    if (!brojevi_postojecih_naloga.includes(j))
      //ako ne sadrzi
      brojevi.push(j);
    j++;
  }
  // brojevi naloga
  //const nalog_date = (()=>{x = new Date(current_company_year, 0,1); return x.toLocaleDateString() })()
  const nalog_date = `${current_company_year}-01-01`;

  Company.findOne({ _id: company_id }).then(result => {
    const current_company = result;

    Nalog.find({ company_id: current_company.id, type: "N" })
      .then(result => {
        for (let i = 0; i <= result.length - 1; i++) {
          if (i === result.broj) {
          } else {
            brojevi.push(i);
          }
        }
        let j = 1;
        while (brojevi.length < 10) {
          brojevi.push(result.length + j);
          j++;
        }
      })
      .then(result => {
        return res.render("company/new_nalog", {
          path: "/new_nalog",
          user: user,
          current_company: current_company,
          current_company_year: current_company_year,
          vrste_naloga: current_company.vrste_naloga,
          sifra_komitenta_array: sifra_komitenta_array,
          poziv_na_broj_array: poziv_na_broj_array,
          broj_konta_array: broj_konta_array,
          brojevi: brojevi,
          nalog_date: nalog_date,
          successMessage: null,
          infoMessage: null,
          validationErrors: []
        });
      });
  });
};
exports.postNalog = async (req, res, next) => {
  const user = req.user;
  const company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const errors = validationResult(req);
  console.log("---------------------");
  console.log(req.body);
  console.log("---------------------");
  if (!errors.isEmpty()) {
    console.log("---------------------errors");
    console.log(errors);
    console.log("---------------------errors");
    return res.status(400).json(errors.array());
  }

  const vrsta_naloga = req.body.vrsta_naloga;
  const broj_naloga = req.body.broj_naloga;
  const opis_naloga = req.body.opis_naloga;
  const datum_naloga = req.body.datum_naloga;
  const opis_stava_array = req.body.opis_stava;
  const sifra_komitenta_array = req.body.sifra_komitenta;
  const poziv_na_broj_array = req.body.poziv_na_broj;
  const konto_array = req.body.konto;
  const duguje_array = req.body.duguje;
  const potrazuje_array = req.body.potrazuje;
  const valuta_array = req.body.valuta;

  let nalog;
  let nalozi;
  let companies;

  // has to be set to null if doeasnt exist
  let sifra_kom_za_snimanje;

  // provera stavova
  let broj_stavova_koji_se_snimaju = 0;
  for (i = 0; i <= opis_stava_array.length - 1; i++) {
    if (opis_stava_array[i].length > 1) {
      broj_stavova_koji_se_snimaju++;
    }
  }
  if (broj_stavova_koji_se_snimaju < 2) {
    return res
      .status(400)
      .json([
        { param: "opis_stava", msg: "At least 2 (two) entries must exist." }
      ]);
  }
  // provera stavova
  // snimanje naloga ce biti moguce samo ako konto postoji
  // jer on je glavni
  if (!konto_array) {
    return res
      .status(400)
      .json([
        { param: "konto", msg: "Konto must exist." }
      ]);
  }
  let array_konta_za_snimanje = [];
  for (i = 0; i <= konto_array.length - 1; i++) {
    let x = await Konto.findOne({
      company: company_id,
      number: konto_array[i]
    });
    if (x) {
      array_konta_za_snimanje.push({ _id: x._id, number: x.number });
    } else {
      array_konta_za_snimanje.push(null);
    }
  }
  //[ { _id: 5e54e455fa4e4b2c1c673f2b, number: '0201' }, null, { _id: 5e54e457fa4e4b2c1c673f37, number: '2401' } ]
  console.log(array_konta_za_snimanje);

  // u duguje i potrazuje sum mogu uci samo stavovi za koje postoje konta
  for (i = 0; i <= array_konta_za_snimanje.length - 1; i++) {
    if (array_konta_za_snimanje[i] == null) {
      duguje_array[i] = 0;
      potrazuje_array[i] = 0;
    }
  }
  const duguje_sum = duguje_array.reduce(
    (a, b) =>
      Math.round(Number(String(a).replace(/,/g, "")) * 100) / 100 +
      Math.round(Number(String(b).replace(/,/g, "")) * 100) / 100,
    0
  );
  const potrazuje_sum = potrazuje_array.reduce(
    (a, b) =>
      Math.round(Number(String(a).replace(/,/g, "")) * 100) / 100 +
      Math.round(Number(String(b).replace(/,/g, "")) * 100) / 100,
    0
  );
  // u duguje i potrazuje sum mogu uci samo stavovi za koje postoje konta

  // provera datuma naloga - moglo je i u routu
  if (datum_naloga.slice(0, 4) != current_company_year) {
    return res.status(400).json([
      {
        param: "datum_naloga",
        msg: `Godina naloga mora biti ${current_company_year}.`
      }
    ]);
  }
  // provera datuma naloga - moglo je i u routu
  Company.findOne({ _id: company_id }).then(result => {
    const current_company = result;
    const years = result.year;
    Nalog.create({
      company: company_id,
      user: user,
      locked: false,
      number: broj_naloga,
      duguje: duguje_sum,
      potrazuje: potrazuje_sum,
      opis: opis_naloga,
      date: datum_naloga,
      type: vrsta_naloga,
      year: current_company_year
    })
      .then(async result => {
        nalog = result;
        // simanje stavova
        for (i = 0; i <= array_konta_za_snimanje.length - 1; i++) {
          if (array_konta_za_snimanje[i]) {
            // snimam samo stav koji ima normalan broj konta
            // ako sifra ima vrednost '', mora biti snimljena kao null
            sifra_komitenta_array[i] === ""
              ? (sifra_kom_za_snimanje = null)
              : (sifra_kom_za_snimanje = sifra_komitenta_array[i]);

            const stav = new Stav({
              user: user,
              company: company_id,
              opis: opis_stava_array[i],
              sifra_komitenta: sifra_kom_za_snimanje,
              poziv_na_broj: poziv_na_broj_array[i],
              konto: array_konta_za_snimanje[i]._id,
              duguje: Number(
                Number(duguje_array[i].replace(/,/g, "")).toFixed(2)
              ),
              potrazuje: Number(
                Number(potrazuje_array[i].replace(/,/g, "")).toFixed(2)
              ),
              valuta: valuta_array[i],
              number: i,
              nalog: result._id,
              nalog_date: datum_naloga,
              type: result.type
            });
            await stav.save();
            nalog.stavovi.push(stav);
          }
        }
        // snimanje stavova
        nalog.save();
      })
      .then(result => {
        Nalog.find({ company: company_id, year: current_company_year })
          .then(result => {
            nalozi = result;
          })
          .then(result => {
            Company.find({ user: user._id })
              .then(result => {
                companies = result;
              })
              .then(async result => {
                let totalNalogs;
                let page = +req.page || 1;
                let nalozi = await Nalog.find({
                  company: company_id,
                  year: current_company_year
                })
                  .countDocuments()
                  .then(numberOfNalogs => {
                    totalNalogs = numberOfNalogs;
                    if (totalNalogs !== 0) {
                      page = Math.ceil(totalNalogs / NALOGS_PER_PAGE);
                    }
                    return Nalog.find({
                      company: company_id,
                      year: current_company_year
                    })
                      .skip((page - 1) * NALOGS_PER_PAGE) //paginacija
                      .limit(NALOGS_PER_PAGE); //paginacija;
                  });
                return res.status(200).render("includes/dashboard/dnevnik", {
                  pageTitle: "",
                  path: "/dnevnik",
                  hasError: false,
                  user: user,
                  accounting: accounting,
                  current_company: current_company,
                  current_company_year: current_company_year,
                  years: years,
                  companies: companies,
                  nalozi: nalozi,
                  currentPage: page,
                  hasNextPage: NALOGS_PER_PAGE * page < totalNalogs,
                  hasPreviousPage: page > 1,
                  nextPage: page + 1,
                  previousPage: page - 1,
                  lastPage: Math.ceil(totalNalogs / NALOGS_PER_PAGE),
                  successMessage: `Nalog ${nalog.type} ${nalog.number} has been saved.`,
                  infoMessage: null,
                  validationErrors: []
                });
              })
              .catch(err => {
                console.log(err);
              });
          });
      })
      .catch(err => {
        console.log(err);
      });
  });
};
exports.getEditNalog = async (req, res, next) => {
  console.log("edit_nalog");
  console.log(req.query);
  console.log("edit_nalog");
  const user = req.user;
  const company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const nalog_id = req.query.nalog_id;
  const nalog_index_page = req.query.nalog_index_page;
  // sifre komitenata
  const sifra_komitenta_array = await Komitent.find({
    company: company_id
  }).select("sifra name");
  // sifre komitenata
  // broj konta
  const broj_konta_array = await Konto.find({
    company: company_id
  }).select("-_id number name");
  // broj konta
  const current_company = await Company.findOne({ _id: company_id });
  const nalog = await Nalog.findOne({
    _id: nalog_id
  });
  const nalog_type = nalog.type;
  // brojevi naloga
  const brojevi_postojecih_naloga = [];
  const brojevi = [];
  const svi_nalozi_firme = await Nalog.find({
    company: company_id,
    type: nalog_type,
    year: nalog.year
  });
  for (let i = 0; i <= svi_nalozi_firme.length - 1; i++) {
    brojevi_postojecih_naloga.push(svi_nalozi_firme[i].number);
  }
  let j = 1;
  while (brojevi.length < 10) {
    if (!brojevi_postojecih_naloga.includes(j))
      //ako ne sadrzi
      brojevi.push(j);
    j++;
  }
  // brojevi naloga
  const date = nalog.date.toISOString().split("T")[0];
  // pozivi na broj
  const svi_stavovi = await Stav.find({ company: company_id });
  const poziv_na_broj_array_sa_undefined = svi_stavovi.map(e => {
    return e.pozivnabroj;
  });
  const poziv_na_broj_array2 = poziv_na_broj_array_sa_undefined.filter(
    item => item
  );
  let poziv_na_broj_array = [];
  console.log(poziv_na_broj_array2);
  for (let k = 0; k <= poziv_na_broj_array2.length - 1; k++) {
    poziv_na_broj_array.includes(poziv_na_broj_array2[k])
      ? null
      : poziv_na_broj_array.push(poziv_na_broj_array2[k]);
  }
  console.log(poziv_na_broj_array);
  // pozivi na broj
  // stavovi
  const stavovi = await Stav.find({ _id: nalog.stavovi })
    .populate({
      path: "sifra_komitenta",
      model: Komitent,
      select: "name sifra"
    })
    .populate({
      path: "konto",
      model: Konto,
      select: "name number"
    });
  var new_stavovi = stavovi.map(stav => {
    let new_stav = {};
    new_stav.duguje = accounting.formatNumber(stav["duguje"]);
    new_stav.potrazuje = accounting.formatNumber(stav["potrazuje"]);
    new_stav.number = stav["number"];
    new_stav.komitent = stav["sifra_komitenta"];
    new_stav.pozivnabroj = stav["pozivnabroj"];
    new_stav.konto = stav["konto"];
    new_stav.opis = stav["opis"];
    new_stav._id = stav["_id"];
    new_stav.user = stav["user"];
    new_stav.company = stav["company"];
    new_stav.type = stav["type"];
    new_stav.nalog_date = stav["nalog_date"];
    if (stav["valuta"]) {
      let valuta =
        stav["valuta"].getFullYear() +
        "-" +
        (stav["valuta"].getMonth() + 1).toString().padStart(2, 0) +
        "-" +
        (stav["valuta"].getDay() + 1).toString().padStart(2, 0);
      new_stav.valuta = valuta;
    }
    return new_stav;
  });
  console.log("***stavovi****");
  console.log(new_stavovi);
  console.log("***stavovi***");
  return res.render("company/edit_nalog", {
    path: "/edit_nalog",
    user: user,
    current_company: current_company,
    current_company_year: current_company_year,
    vrste_naloga: current_company.vrste_naloga,
    sifra_komitenta_array: sifra_komitenta_array,
    poziv_na_broj_array: poziv_na_broj_array,
    broj_konta_array: broj_konta_array,
    date: date,
    brojevi: brojevi,
    stavovi: new_stavovi,
    nalog: nalog,
    successMessage: null,
    infoMessage: null,
    validationErrors: []
  });
};
exports.updateNalog = async (req, res, next) => {
  console.log("***update nalog***");
  console.log(req.body);
  console.log("***update nalog***");
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const years = req.current_company_years;
  const companies = await Company.find({ user: user });
  const current_company = await Company.findOne({
    _id: req.current_company_id
  });
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("-----erorrs");
    console.log(errors);
    console.log("-----erorrs");
    return res.status(400).json(errors.array());
  }
  // nalog update
  const nalog_id = req.body["_id"];
  const nalog = await Nalog.findOne({ _id: nalog_id });
  const vrsta_naloga = req.body.vrsta_naloga;
  const broj_naloga = req.body.broj_naloga;
  const opis_naloga = req.body.opis_naloga;
  const datum_naloga = req.body.datum_naloga;
  const duguje_array = req.body.duguje;
  const potrazuje_array = req.body.potrazuje;
  const valuta_array = req.body.valuta;

  const opis_stava_array = req.body.opis_stava;
  const poziv_na_broj_array = req.body.poziv_na_broj;
  const konto_array = req.body.konto;
  // provera stavova
  let broj_stavova_koji_se_snimaju = 0;
  for (i = 0; i <= opis_stava_array.length - 1; i++) {
    if (opis_stava_array[i].length > 1) {
      broj_stavova_koji_se_snimaju++;
    }
  }
  if (broj_stavova_koji_se_snimaju < 2) {
    return res
      .status(400)
      .json([
        { param: "opis_stava", msg: "At least 2 (two) entries must exist." }
      ]);
  }
  // provera stavova
  // snimanje naloga ce biti moguce samo ako konto postoji
  // jer on je glavni
  let array_konta_za_snimanje = [];
  for (i = 0; i <= konto_array.length - 1; i++) {
    let x = await Konto.findOne({
      company: current_company_id,
      number: konto_array[i]
    });
    if (x) {
      array_konta_za_snimanje.push({ _id: x._id, number: x.number });
    } else {
      array_konta_za_snimanje.push(null);
    }
  }
  //[ { _id: 5e54e455fa4e4b2c1c673f2b, number: '0201' }, null, { _id: 5e54e457fa4e4b2c1c673f37, number: '2401' } ]
  console.log(array_konta_za_snimanje);
  // ne sme uci u sumu red stav koji ne snimam jer nema konto - a ima iznos duguje ili potrazuje
  for (i = 0; i <= array_konta_za_snimanje.length - 1; i++) {
    if (array_konta_za_snimanje[i] == null) {
      duguje_array[i] = 0;
      potrazuje_array[i] = 0;
    }
  }
  console.log("++++");
  console.log(duguje_array);
  console.log("++++");
  console.log("++++");
  console.log(potrazuje_array);
  console.log("++++");
  const duguje_sum = duguje_array.reduce(
    (a, b) =>
      Math.round(Number(String(a).replace(/,/g, "")) * 100) / 100 +
      Math.round(Number(String(b).replace(/,/g, "")) * 100) / 100,
    0
  );
  const potrazuje_sum = potrazuje_array.reduce(
    (a, b) =>
      Math.round(Number(String(a).replace(/,/g, "")) * 100) / 100 +
      Math.round(Number(String(b).replace(/,/g, "")) * 100) / 100,
    0
  );
  const stavovi_old_id_array = nalog.stavovi.map(e => {
    return e._id;
  });
  // provera datuma naloga - moglo je i u routu
  if (datum_naloga.slice(0, 4) != current_company_year) {
    return res.status(400).json([
      {
        param: "datum_naloga",
        msg: `Godina naloga mora biti ${current_company_year}.`
      }
    ]);
  }
  // provera datuma naloga - moglo je i u routu
  await nalog.updateOne({
    duguje: duguje_sum,
    potrazuje: potrazuje_sum,
    opis: opis_naloga,
    type: vrsta_naloga,
    number: broj_naloga,
    locked: false,
    date: datum_naloga,
    stavovi: []
  });
  // nalog update
  // stavovi update

  const sifra_komitenta_array = req.body.sifra_komitenta.map(sifra => {
    return sifra == "" ? null : sifra;
  });
  console.log("***");
  console.log(sifra_komitenta_array);
  console.log("***");

  //const konto_array_ids_with_numbers = await Konto.find({
  //  number: konto_array
  //}).select("_id number");
  //// napraviti array od konto_array i konto_array_ids_with_numbers
  //let konto_array_ids = [];
  //for (let m = 0; m <= konto_array.length - 1; m++) {
  //  for (let k = 0; k <= konto_array_ids_with_numbers.length - 1; k++) {
  //    if (konto_array[m] == konto_array_ids_with_numbers[k].number) {
  //      konto_array_ids.push(konto_array_ids_with_numbers[k]._id);
  //    }
  //  }
  //}
  // napraviti array od konto_array i konto_array_ids_with_numbers
  await Stav.deleteMany({ _id: stavovi_old_id_array });
  let novi_stavovi = [];
  for (i = 0; i <= array_konta_za_snimanje.length - 1; i++) {
    if (array_konta_za_snimanje[i]) {
      novi_stavovi[i] = await Stav.create({
        user: user,
        company: current_company_id,
        opis: opis_stava_array[i],
        sifra_komitenta: sifra_komitenta_array[i],
        pozivnabroj: poziv_na_broj_array[i],
        konto: array_konta_za_snimanje[i],
        duguje: Number(Number(duguje_array[i].replace(/,/g, "")).toFixed(2)),
        potrazuje: Number(
          Number(potrazuje_array[i].replace(/,/g, "")).toFixed(2)
        ),
        valuta: valuta_array[i],
        number: i,
        nalog: nalog,
        nalog_date: datum_naloga,
        type: nalog.type
      });
    }
  }
  nalog.stavovi = novi_stavovi;
  nalog.save();
  // stavovi update

  let totalNalogs;
  const page = +req.page || 1;
  const nalozi = await Nalog.find({
    company: current_company_id,
    year: current_company_year
  })
    .countDocuments()
    .then(numberOfNalogs => {
      totalNalogs = numberOfNalogs;
      return Nalog.find({
        company: current_company_id,
        year: current_company_year
      })
        .skip((page - 1) * NALOGS_PER_PAGE) //paginacija
        .limit(NALOGS_PER_PAGE); //paginacija;
    });

  return res.status(200).render("includes/dashboard/dnevnik", {
    pageTitle: "",
    accounting: accounting,
    path: "/dnevnik",
    hasError: false,
    user: user,
    companies: companies,
    current_company: current_company,
    current_company_year: current_company_year,
    years: years,
    companies: companies,
    nalozi: nalozi,
    currentPage: page,
    hasNextPage: NALOGS_PER_PAGE * page < totalNalogs,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalNalogs / NALOGS_PER_PAGE),
    successMessage: `Nalog ${nalog.type} - ${nalog.number} has been updated successfuly!.`,
    infoMessage: null,
    validationErrors: []
  });
};

exports.getPronadjiBrojeveNaloga = async (req, res, next) => {
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const brojevi_postojecih_naloga = [];
  const brojevi = [];
  const nalog_type = req.query.vrsta;
  const svi_nalozi_firme = await Nalog.find({
    company: current_company_id,
    type: nalog_type,
    year: current_company_year
  });
  for (let i = 0; i <= svi_nalozi_firme.length - 1; i++) {
    brojevi_postojecih_naloga.push(svi_nalozi_firme[i].number);
  }
  let j = 1;
  while (brojevi.length < 10) {
    if (!brojevi_postojecih_naloga.includes(j)) brojevi.push(j);
    j++;
  }

  return res.status(200).render("includes/pronadji_brojeve_naloga", {
    brojevi: brojevi,
    hasError: false,
    infoMessage: null,
    validationErrors: []
  });
};
