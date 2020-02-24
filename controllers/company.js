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
exports.getNalog = async (req, res, next) => {
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
exports.postNalog = (req, res, next) => {
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
  //const sifra_komitenta_array = sifra_komitenta_array_premap.map(e => {
  //  return e == "" ? null : e;
  //});
  const poziv_na_broj_array = req.body.poziv_na_broj;
  const konto_array = req.body.konto;
  const duguje_array = req.body.duguje;
  const potrazuje_array = req.body.potrazuje;
  const valuta_array = req.body.valuta;
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
  let nalog;
  let nalozi;
  let companies;

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
      .then(result => {
        nalog = result;
        for (i = 0; i <= opis_stava_array.length - 1; i++) {
          const stav = new Stav({
            user: user,
            company: company_id,
            opis: opis_stava_array[i],
            sifra_komitenta: sifra_komitenta_array[i],
            poziv_na_broj: poziv_na_broj_array[i],
            konto: konto_array[i],
            duguje: Number(
              Number(duguje_array[i].replace(/,/g, "")).toFixed(2)
            ),
            potrazuje: Number(
              Number(potrazuje_array[i].replace(/,/g, "")).toFixed(2)
            ),
            valuta: valuta_array[i],
            number: i,
            nalog_id: result._id,
            date: datum_naloga,
            type: result.id
          });
          stav.save();
          nalog.stavovi.push(stav);
        }
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
              .then(result => {
                return res.status(200).render("company/show_company", {
                  pageTitle: "",
                  path: "/dnevnik",
                  hasError: false,
                  user: user,
                  current_company: current_company,
                  current_company_year: current_company_year,
                  years: years,
                  companies: companies,
                  nalozi: nalozi,
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

  //Company.findOne({ _id: company_id })
  //  .then(result => {
  //    const current_company = result;
  //    return res.render("company/new_nalog", {
  //      path: "/new_nalog",
  //      user: user,
  //      current_company: current_company,
  //      current_company_year: current_company_year,
  //      vrste_naloga: current_company.vrste_naloga,
  //      sifra_kupca_array: sifra_kupca_array,
  //      poziv_na_broj_array: poziv_na_broj_array,
  //      broj_konta_array: broj_konta_array,
  //      successMessage: null,
  //      infoMessage: null,
  //      validationErrors: []
  //      });
  //  })
  ////  .then(result => {
  //    Company.findById({ _id: company_id }).then(result => {
  //      company = result;

  //    });
  //  });
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
    console.log(errors);
    return res.status(300).render("includes/dashboard/dnevnik", {
      pageTitle: "",
      accounting: accounting,
      path: "/dnevnik",
      hasError: false,
      user: user,
      current_company: current_company,
      current_company_year: current_company_year,
      years: years,
      companies: companies,
      nalozi: nalozi,
      successMessage: null,
      infoMessage: null,
      validationErrors: []
    });
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
  const opis_stava_array = req.body.opis_stava;
  const sifra_komitenta_array = req.body.sifra_komitenta.map(sifra => {
    return sifra == "" ? null : sifra;
  });
  console.log("***");
  console.log(sifra_komitenta_array);
  console.log("***");
  const poziv_na_broj_array = req.body.poziv_na_broj;
  const konto_array = req.body.konto;
  const konto_array_ids_with_numbers = await Konto.find({
    number: konto_array
  }).select("_id number");
  // napraviti array od konto_array i konto_array_ids_with_numbers
  let konto_array_ids = [];
  for (let m = 0; m <= konto_array.length - 1; m++) {
    for (let k = 0; k <= konto_array_ids_with_numbers.length - 1; k++) {
      if (konto_array[m] == konto_array_ids_with_numbers[k].number) {
        konto_array_ids.push(konto_array_ids_with_numbers[k]._id);
      }
    }
  }
  // napraviti array od konto_array i konto_array_ids_with_numbers
  await Stav.deleteMany({ _id: stavovi_old_id_array });
  let novi_stavovi = [];
  for (i = 0; i <= opis_stava_array.length - 1; i++) {
    novi_stavovi[i] = await Stav.create({
      user: user,
      company: current_company_id,
      opis: opis_stava_array[i],
      sifra_komitenta: sifra_komitenta_array[i],
      poziv_na_broj: poziv_na_broj_array[i],
      konto: konto_array_ids[i],
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

  return res.status(200).render("company/show_company", {
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
