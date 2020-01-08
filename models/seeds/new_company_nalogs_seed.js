const Nalog = require("../nalog");
const Stav = require("../stav");
const Konto = require("../konto");
const Komitent = require("../komitent");
const Komitenttype = require("../komitenttype");

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
    .then(async result => {
      // nalog kreiran
      nalog = result;
      await Konto.create({
        number: "1000",
        name: "stalna imovina",
        type: "A",
        company: company._id
      }).then(async konto => {
        //konto kreiran
        await Stav.create({
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
      await Konto.create({
        number: "2000",
        name: "obrtna imovina",
        type: "A",
        company: company._id
      }).then(async konto2 => {
        await Stav.create({
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
      await Konto.create({
        number: "3000",
        name: "sopstveni kapital",
        type: "B",
        company: company._id
      }).then(async konto3 => {
        await Stav.create({
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
      await Konto.create({
        number: "4000",
        name: "dugorocne obaveze",
        type: "B",
        company: company._id
      }).then(async konto4 => {
        await Stav.create({
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
          .then(async result => {
            await Nalog.findOne({ _id: nalog._id })
              .then(async res => {
                res.stavovi.push(...stavovi);
                await res.save();
                // tipovi
                const bankatype = await Komitenttype.create({
                  user: user,
                  company: company,
                  name: "Banka",
                  type: "B",
                  number: 0
                });
                const kupactype = await Komitenttype.create({
                  user: user,
                  company: company,
                  name: "Kupac",
                  type: "K",
                  number: 1
                });
                const dobavljactype = await Komitenttype.create({
                  user: user,
                  company: company,
                  name: "Dobavljač",
                  type: "D",
                  number: 2
                });
                // tipovi
                // komitenti
                const komitent1 = await Komitent.create({
                  user: user,
                  company: company,
                  type: kupactype,
                  number: 0,
                  adress: "Vojvodjanski bulevar 1",
                  pib: "123456987",
                  name: "Microsoft",
                  sifra: "kpcMicro"
                });
                const komitent2 = await Komitent.create({
                  user: user,
                  company: company,
                  type: kupactype,
                  number: 1,
                  adress: "Prvomajska 3",
                  pib: "321456987",
                  name: "Google inc.",
                  sifra: "kpcGoogle"
                });
                const komitent3 = await Komitent.create({
                  user: user,
                  company: company,
                  type: kupactype,
                  number: 2,
                  adress: "Otona Zupancica 123",
                  pib: "123654987",
                  name: "Apple inc.",
                  sifra: "kpcApple"
                });
                const komitent4 = await Komitent.create({
                  user: user,
                  company: company,
                  type: bankatype,
                  number: 3,
                  adress: "Milutina Mihajlovica 2",
                  pib: "321654987",
                  name: "Banca Intesa",
                  sifra: "bnkIntesa"
                });
                const komitent5 = await Komitent.create({
                  user: user,
                  company: company,
                  type: dobavljactype,
                  number: 4,
                  adress: "Vojvodjanski bulevar 56",
                  pib: "123456978",
                  name: "Elektroprivreda Srbije",
                  sifra: "dobEPS"
                });
                const komitent6 = await Komitent.create({
                  user: user,
                  company: company,
                  type: dobavljactype,
                  number: 5,
                  adress: "Vojvodjanski bulevar 57",
                  pib: "124356987",
                  name: "JKP Vodovod",
                  sifra: "dobVodovod"
                });
                // komitenti
                // nalozi N i I
                const nalogN1 = await Nalog.create({
                  company: company._id,
                  user: user,
                  locked: false,
                  number: 1,
                  duguje: 50000,
                  potrazuje: 50000,
                  opis: "Nabavka opreme",
                  date: new Date(Date.UTC(company.year[0], 0, 5)),
                  type: "N",
                  year: company.year[0]
                });
                const stavN11 = await Stav.create({});
                const stavN12 = await Stav.create({});
                const stavN13 = await Stav.create({});
                const nalogN2 = await Nalog.create({
                  company: company._id,
                  user: user,
                  locked: false,
                  number: 2,
                  duguje: 100000,
                  potrazuje: 100000,
                  opis: "Nabavka vozila",
                  date: new Date(Date.UTC(company.year[0], 0, 10)),
                  type: "N",
                  year: company.year[0]
                });
                const stavN21 = await Stav.create({});
                const stavN22 = await Stav.create({});
                const stavN23 = await Stav.create({});
                const stavN24 = await Stav.create({});
                const stavN25 = await Stav.create({});
                // nalozi N i I
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
