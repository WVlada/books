const Nalog = require("../nalog");
const Stav = require("../stav");
const Konto = require("../konto");

async function seedNalogs(company, user) {
  console.log("Seeding database....");
  let nalog;
  let stavovi = [];
  await Nalog.create({
    company: company._id,
    user: user,
    locked: false,
    number: 1,
    duguje: 10000,
    potrazuje: 10000,
    opis: "Otvaranje knjiga",
    date: new Date(Date.UTC(company.year[0], 0, 1)),
    type: "R",
    year: company.year[0]
  })
    .then(result => {
      // nalog kreiran
      nalog = result;
      Konto.create({
        number: "1000",
        name: "stalna imovina",
        type: "A",
        company: company._id
      }).then(konto => {
        //konto kreiran
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
          nalog_date: nalog.date,
          type: nalog.type
        }).then(stav => {
          //stav kreiran
          stavovi.push({ _id: stav._id });
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
          nalog_date: nalog.date,
          type: nalog.type
        }).then(stav => {
          stavovi.push({ _id: stav._id });
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
          valuta: new Date(Date.UTC(company.year[0], 0, 1)),
          number: 3,
          nalog_id: nalog._id,
          nalog_date: nalog.date,
          type: nalog.type
        }).then(stav => {
          stavovi.push({ _id: stav._id });
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
          nalog_date: nalog.date,
          type: nalog.type
        })
          .then(stav => {
            stavovi.push({ _id: stav._id });
          })
          .then(result => {
            Nalog.findOne({ _id: nalog._id })
              .then(async res => {
                res.stavovi.push(...stavovi);
                await res.save();
                console.log("Seeding completed.");
                return Promise.resolve();
              })
              .catch(err => {
                console.log(err);
              });
          });
      });
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = seedNalogs;
