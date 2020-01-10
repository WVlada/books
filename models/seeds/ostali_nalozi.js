const Nalog = require("../nalog");
const Stav = require("../stav");
const Konto = require("../konto");
const Komitent = require("../komitent");
const Komitenttype = require("../komitenttype");

async function seedOstaliNalozi(company, user) {
    
// konta
const kontoKupci =          await Konto.create({ number: "2200", name: "Kupci",      type: "A", company: company._id });
const kontoDobavljači =     await Konto.create({ number: "4200", name: "Dobavljači", type: "P", company: company._id });
const kontoTekuciRacun1 =   await Konto.create({ number: "2501", name: "Tekući račun - AIK Banka",    type: "A", company: company._id });
const kontoTekuciRacun2 =   await Konto.create({ number: "2502", name: "Tekući račun - Banca Intesa", type: "A", company: company._id });
// konta

// tipovi
const bankatype     = await Komitenttype.create({ user: user, company: company, name: "Banka", type: "B", number: 0 });
const kupactype     = await Komitenttype.create({ user: user, company: company, name: "Kupac", type: "K", number: 1 });
const dobavljactype = await Komitenttype.create({ user: user, company: company, name: "Dobavljač", type: "D", number: 2 });
// tipovi

// komitenti
const komitent1 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 0, adress: "Vojvodjanski bulevar 1",   pib: "123456987", name: "Microsoft",              sifra: "kpcMicro"  });
const komitent2 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 1, adress: "Prvomajska 3",             pib: "321456987", name: "Google inc.",            sifra: "kpcGoogle"  });
const komitent3 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 2, adress: "Otona Zupancica 123",      pib: "123654987", name: "Apple inc.",             sifra: "kpcApple"  });
const komitent4 = await Komitent.create({ user: user, company: company, type: bankatype,     number: 3, adress: "Milutina Mihajlovica 2",   pib: "321654987", name: "Banca Intesa",           sifra: "bnkIntesa"  });
const komitent5 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 4, adress: "Vojvodjanski bulevar 56",  pib: "123456978", name: "Elektroprivreda Srbije", sifra: "dobEPS"  });
const komitent6 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 5, adress: "Vojvodjanski bulevar 57",  pib: "124356987", name: "JKP Vodovod",            sifra: "dobVodovod" });
const komitent7 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 6, adress: "Vojvodjanski bulevar 1",   pib: "123357688", name: "Micr macro osoft",       sifra: "kpcMacMicro"  });
const komitent8 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 7, adress: "Prvomajska 3",             pib: "321156988", name: "Glass Google inc.",      sifra: "kpcGlassGoogle"  });
const komitent9 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 8, adress: "Otona Zupancica 123",      pib: "123254917", name: "Red Apple inc.",         sifra: "kpcRedApple"  });
const komitent10 = await Komitent.create({ user: user, company: company, type: bankatype,     number: 9, adress: "Milutina Mihajlovica 2",   pib: "721654981", name: "Sber Bank",             sifra: "bnkSber"  });
const komitent11 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 10, adress: "Vojvodjanski bulevar 56",  pib: "823456971", name: "Wirelessprivreda Srbije", sifra: "dobWrlsSerb"  });
const komitent12 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 11, adress: "Vojvodjanski bulevar 57",  pib: "724356981", name: "JKP Telefonija",          sifra: "dobTelefon" });
// komitenti

//nalozi
const nalogI1 = await Nalog.create({ company: company._id, user: user, locked: false, number: 1, duguje: 50000, potrazuje: 50000, opis: "Uplata pozajmice", date: new Date(Date.UTC(company.year[0], 0, 5)), type: "I", year: company.year[0]});
const stavI11 = await Stav.create({ user: user, company: company._id, opis: `Izvod 01 01 ${new Date(Date.UTC(company.year[0], 0, 5)).getFullYear()}`, sifra_komitenta: komitent1.sifra, poziv_na_broj: null, konto: kontoDobavljači, duguje: 0, potrazuje: 5000, valuta: null, number: 0, nalog_id: nalogI1._id, nalog_date: nalogI1.date, type: nalogI1.type});
const stavI12 = await Stav.create({ user: user, company: company._id, opis: `Izvod 01 01 ${new Date(Date.UTC(company.year[0], 0, 5)).getFullYear()}`, sifra_komitenta: komitent1.sifra, poziv_na_broj: null, konto: kontoTekuciRacun1, duguje: 5000, potrazuje: 0, valuta: null, number: 1, nalog_id: nalogI1._id, nalog_date: nalogI1.date, type: nalogI1.type});
nalogI1.stavovi = [ {_id: stavI11._id}, {_id: stavI12._id} ]
await nalogI1.save()


const nalogN1 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 1,  duguje: 3000,  potrazuje: 3000,  opis: `Izvod 01 02 ${new Date(Date.UTC(company.year[0], 0, 5) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[0], 0, 20)),  type: "N",  year: company.year[0]});
const stavN11 = await Stav.create({  user: user,  company: company._id,  opis: "Prenos na drugi tekuci racun",  sifra_komitenta: null,  poziv_na_broj: null,  konto: kontoTekuciRacun2,  duguje: 3000,  potrazuje: 0,  valuta: null,  number: 0,  nalog_id: nalogN1._id,  nalog_date: nalogN1.date,  type: nalogN1.type});
const stavN12 = await Stav.create({  user: user,  company: company._id,  opis: "Prenos na drugi tekuci racun",  sifra_komitenta: null,  poziv_na_broj: null,  konto: kontoTekuciRacun1,  duguje: 0,  potrazuje: 3000,  valuta: null,  number: 1,  nalog_id: nalogN1._id,  nalog_date: nalogN1.date,  type: nalogN1.type});
nalogN1.stavovi = [ {_id: stavN11._id}, {_id: stavN12._id} ]
await nalogN1.save()
//nalozi
console.log("Seeding ostalo completed.")
}

module.exports = seedOstaliNalozi;
