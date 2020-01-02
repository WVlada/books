const Nalog = require("../nalog");
const Stav = require("../stav");
const Konto = require("../konto");

function seedNalogs(company, user) {
  let nalog;
  let stavovi;
  Nalog.create({
    company: company._id,
    user: user,
    locked: false,
    number: 1,
    duguje: 10000,
    potrazuje: 10000,
    opis: "Otvaranje knjiga",
    date: new Date(company.year[0], 0, 1).toISOString(),
    type: "R",
    year: company.year[0]
  })
    .then(result => {
      nalog = result;
      Konto.create({
        number: "1000",
        name: "stalna imovina",
        type: "A",
        company: company._id
      }).then(konto => {
        Stav.create({
          user: user,
          company: company._id,
          opis: "Otvaranje knjiga",
          sifra_komitenta: null,
          poziv_na_broj: null,
          konto: konto._id,
          duguje: 10000,
          potrazuje: 0,
          valuta: null,
          number: 1,
          nalog_id: nalog._id,
          date: nalog.date,
          type: nalog.type
        }).then(stav => {
          stavovi.push(stav);
        });
      });
      Konto.create({
        number: "2000",
        name: "obrtna imovina",
        type: "A",
        company: company._id
      }).then(konto2 => {
        Stav.create({
          user: user,
          company: company._id,
          opis: "Otvaranje knjiga",
          sifra_komitenta: null,
          poziv_na_broj: null,
          konto: konto2._id,
          duguje: 10000,
          potrazuje: 0,
          valuta: null,
          number: 2,
          nalog_id: nalog._id,
          date: nalog.date,
          type: nalog.type
        }).then(stav => {
          stavovi.push(stav);
        });
      });
      Konto.create({
        number: "3000",
        name: "sopstveni kapital",
        type: "B",
        company: company._id
      }).then(konto3 => {
        Stav.create({
          user: user,
          company: company._id,
          opis: "Otvaranje knjiga",
          sifra_komitenta: null,
          poziv_na_broj: null,
          konto: konto3._id,
          duguje: 0,
          potrazuje: 10000,
          valuta: null,
          number: 3,
          nalog_id: nalog._id,
          date: nalog.date,
          type: nalog.type
        }).then(stav => {
          stavovi.push(stav);
        });
      });
      Konto.create({
        number: "4000",
        name: "dugorocne obaveze",
        type: "B",
        company: company._id
      }).then(konto4 => {
        Stav.create({
          user: user,
          company: company._id,
          opis: "Otvaranje knjiga",
          sifra_komitenta: null,
          poziv_na_broj: null,
          konto: konto4._id,
          duguje: 0,
          potrazuje: 10000,
          valuta: null,
          number: 4,
          nalog_id: nalog._id,
          date: nalog.date,
          type: nalog.type
        }).then(stav => {
          stavovi.push(stav);
        });
      });
    })
    .then(result => {
      nalog.stavovi = stavovi;
      nalog.save();
    });
}

module.exports = seedNalogs;
