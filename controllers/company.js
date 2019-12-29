const User = require("../models/user");
const Company = require("../models/company");
const Nalog = require("../models/nalog");
const Stav = require("../models/stav");

const { validationResult } = require("express-validator");

exports.getCompany = (req, res, next) => {
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
      if (checkbox) {
        console.log("checkbox true");
        company.createDefaultTransactions(user);
      }
    })
    .then(result => {
      return res.redirect("/company");
    });
};
// AJAX
exports.getDnevnikNaloga = (req, res, next) => {
  const user = req.user;
  const current_company_id = req.current_company_id;
  const current_company_year = req.current_company_year;
  const current_company_years = req.current_company_years;
  console.log("/get_dnevnik");
  console.log(user);
  console.log(current_company_id);
  console.log(current_company_year);
  console.log(current_company_years);
  console.log("/get_dnevnik");

  Nalog.find({ company: current_company_id, year: current_company_year })
    .then(result => {
      nalozi = result;
      console.log("33333");
      console.log(nalozi);
      console.log("33333");
    })
    .then(result => {
      Company.find({ user: user._id })
        .then(result => {
          companies = result;
        })
        .then(com => {
          current_company = user.current_company;
        })
        .then(result => {
          return res.status(200).render("includes/dashboard/dnevnik", {
            pageTitle: "",
            path: "/dnevnik",
            hasError: false,
            user: user,
            current_company: current_company,
            current_company_year: current_company_year,
            years: current_company_years,
            companies: companies,
            nalozi: nalozi,
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
exports.getNalog = (req, res, next) => {
  const user = req.user;
  const company_id = req.query.current_company;
  const current_company_year = req.query.current_year;
  const sifra_komitenta_array = [1, 2, 3];
  const poziv_na_broj_array = [1, 2, 3];
  const broj_konta_array = [1, 2, 3];
  const brojevi = [];
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
  //console.log(res)
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(422).render("company/new_nalog", {
      pageTitle: "",
      path: "/new_nalog",
      hasError: true,
      user: user,
      //oldInput: {
      //  name: name,
      //  year: year,
      //  mb: mb,
      //  pib: pib,
      //  adress: adress,
      //  email: email,
      //  telephone: telephone
      //},
      successMessage: null,
      infoMessage: null,
      validationErrors: errors.array()
    });
  }
  console.log(req.body);
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
