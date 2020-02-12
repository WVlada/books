const Nalog = require("../nalog");
const Stav = require("../stav");
const Konto = require("../konto");
const Komitent = require("../komitent");
const Komitenttype = require("../komitenttype");


async function seedOstaliNalozi(company, user) {

// godine
company.year = [company.year[0] - 1, company.year[0], company.year[0] + 1]
//company.year.push(company.year[0]+1)
//company.year.push(company.year[0]-1)
await company.save()
// godine

// konta
const kontoKupci =          await Konto.create({ number: "2401", name: "Kupci - Idea ltd.",      type: "A", company: company._id });
const kontoDobavljači =     await Konto.create({ number: "4200", name: "Dobavljači", type: "P", company: company._id });
const kontoTekuciRacun1 =   await Konto.create({ number: "2501", name: "Tekući račun - AIK Banka",    type: "A", company: company._id });
const kontoTekuciRacun2 =   await Konto.create({ number: "2502", name: "Tekući račun - Banca Intesa", type: "A", company: company._id });
const kontoIntesaKredit =   await Konto.create({ number: "4101", name: "Dugoročni kredit u zemlji - Banca Intesa", type: "P", company: company._id });
const kontoIntesaKreditKretkorocniDeo =   await Konto.create({ number: "4601", name: "Deo dugoročnog kredita koji dospeva u toku 1. godine - Banca Intesa", type: "P", company: company._id });

// konta

// tipovi
const bankatype     = await Komitenttype.create({ user: user, company: company, name: "Banka", type: "B", number: 0 });
const kupactype     = await Komitenttype.create({ user: user, company: company, name: "Kupac", type: "K", number: 1 });
const dobavljactype = await Komitenttype.create({ user: user, company: company, name: "Dobavljač", type: "D", number: 2 });
// tipovi

// komitenti
const komitent1 = await Komitent.create({  user: user, company: company, type: kupactype,     number: 0,  adress: "Vojvodjanski bulevar 1",   pib: "123456987", name: "Microsoft",                 sifra: "kpcMicro"  });
const komitent2 = await Komitent.create({  user: user, company: company, type: kupactype,     number: 1,  adress: "Prvomajska 3",             pib: "321456987", name: "Google inc.",               sifra: "kpcGoogle"  });
const komitent3 = await Komitent.create({  user: user, company: company, type: kupactype,     number: 2,  adress: "Otona Zupancica 123",      pib: "123654987", name: "Apple inc.",                sifra: "kpcApple"  });
const komitent4 = await Komitent.create({  user: user, company: company, type: bankatype,     number: 3,  adress: "Milutina Mihajlovica 2",   pib: "321654987", name: "Banca Intesa",              sifra: "bnkIntesa"  });
const komitent5 = await Komitent.create({  user: user, company: company, type: dobavljactype, number: 4,  adress: "Vojvodjanski bulevar 56",  pib: "123456978", name: "Elektroprivreda Srbije",    sifra: "dobEPS"  });
const komitent6 = await Komitent.create({  user: user, company: company, type: dobavljactype, number: 5,  adress: "Vojvodjanski bulevar 57",  pib: "124356987", name: "JKP Vodovod",               sifra: "dobVodovod" });
const komitent7 = await Komitent.create({  user: user, company: company, type: kupactype,     number: 6,  adress: "Vojvodjanski bulevar 1",   pib: "123464688", name: "Micr macro osoft",          sifra: "kpcMacMicro"  });
const komitent8 = await Komitent.create({  user: user, company: company, type: kupactype,     number: 7,  adress: "Prvomajska 3",             pib: "321454988", name: "Glass Google inc.",         sifra: "kpcGlassGoogle"  });
const komitent9 = await Komitent.create({  user: user, company: company, type: kupactype,     number: 8,  adress: "Otona Zupancica 123",      pib: "123434917", name: "Red Apple inc.",            sifra: "kpcRedApple"  });
const komitent10 = await Komitent.create({ user: user, company: company, type: bankatype,     number: 9,  adress: "Milutina Mihajlovica 2",   pib: "721232981", name: "Sber Bank",                 sifra: "bnkSber"  });
const komitent11 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 10, adress: "Vojvodjanski bulevar 56",  pib: "823323971", name: "Wirelessprivreda Srbije",   sifra: "dobWrlsSerb"  });
const komitent12 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 11, adress: "Vojvodjanski bulevar 57",  pib: "724424981", name: "JKP Telefonija",            sifra: "dobTelefon" });
const komitent13 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 12, adress: "Vojvodjanski bulevar 1",   pib: "123525987", name: "Microsoft 2",               sifra: "kpcMicro2"  });
const komitent14 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 13, adress: "Prvomajska 3",             pib: "321626987", name: "Google inc. 2",             sifra: "kpcGoogle2"  });
const komitent15 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 14, adress: "Otona Zupancica 123",      pib: "123727987", name: "Apple inc. 2",              sifra: "kpcApple2"  });
const komitent16 = await Komitent.create({ user: user, company: company, type: bankatype,     number: 15, adress: "Milutina Mihajlovica 2",   pib: "321929987", name: "Banca Intesa 2",            sifra: "bnkIntesa2"  });
const komitent17 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 16, adress: "Vojvodjanski bulevar 56",  pib: "123828978", name: "Elektroprivreda Srbije 2",  sifra: "dobEPS2"  });
const komitent18 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 17, adress: "Vojvodjanski bulevar 57",  pib: "124818987", name: "JKP Vodovod 2",             sifra: "dobVodovod2" });
const komitent19 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 18, adress: "Vojvodjanski bulevar 1",   pib: "123919688", name: "Micr macro soft 2",         sifra: "kpcMacMicro2"  });
const komitent20 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 19, adress: "Prvomajska 3",             pib: "321909988", name: "Glass Google inc. 3",       sifra: "kpcGlassGoogle3"  });
const komitent21 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 20, adress: "Otona Zupancica 123",      pib: "123808917", name: "Red Apple inc. 3",          sifra: "kpcRedApple"  });
const komitent22 = await Komitent.create({ user: user, company: company, type: bankatype,     number: 21, adress: "Milutina Mihajlovica 2",   pib: "721707981", name: "Sber Bank 3",               sifra: "bnkSber3"  });
const komitent23 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 22, adress: "Vojvodjanski bulevar 56",  pib: "823606971", name: "Wirelessprivreda Srbije 3", sifra: "dobWrlsSerb3"  });
const komitent24 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 23, adress: "Vojvodjanski bulevar 57",  pib: "724505981", name: "JKP Telefonija 3",          sifra: "dobTelefon3" });
const komitent25 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 24, adress: "Vojvodjanski bulevar 1",   pib: "123404987", name: "Microsoft 4",               sifra: "kpcMicro4"  });
const komitent26 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 25, adress: "Prvomajska 3",             pib: "321303987", name: "Google inc. 4",             sifra: "kpcGoogle4"  });
const komitent27 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 26, adress: "Otona Zupancica 123",      pib: "123202987", name: "Apple inc. 4",              sifra: "kpcApple4"  });
const komitent28 = await Komitent.create({ user: user, company: company, type: bankatype,     number: 27, adress: "Milutina Mihajlovica 2",   pib: "321101987", name: "Banca Intesa 5",            sifra: "bnkIntesa5"  });
const komitent29 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 28, adress: "Vojvodjanski bulevar 56",  pib: "123999978", name: "Elektroprivreda Srbije 5",  sifra: "dobEPS5"  });
const komitent30 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 29, adress: "Vojvodjanski bulevar 57",  pib: "124777987", name: "JKP Vodovod 5",             sifra: "dobVodovod5" });
const komitent31 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 30, adress: "Vojvodjanski bulevar 1",   pib: "123666688", name: "Micr macro osoft 5",        sifra: "kpcMacMicro5"  });
const komitent32 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 31, adress: "Prvomajska 3",             pib: "321555988", name: "Glass Google inc. 5",       sifra: "kpcGlassGoogle5"  });
const komitent33 = await Komitent.create({ user: user, company: company, type: kupactype,     number: 32, adress: "Otona Zupancica 123",      pib: "123444917", name: "Red Apple inc. 5",          sifra: "kpcRedApple5"  });
const komitent34 = await Komitent.create({ user: user, company: company, type: bankatype,     number: 33, adress: "Milutina Mihajlovica 2",   pib: "721111981", name: "Sber Bank 5",               sifra: "bnkSber5"  });
const komitent35 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 34, adress: "Vojvodjanski bulevar 56",  pib: "823222971", name: "Wirelessprivreda Srbije 5", sifra: "dobWrlsSerb5"  });
const komitent36 = await Komitent.create({ user: user, company: company, type: dobavljactype, number: 35, adress: "Vojvodjanski bulevar 57",  pib: "724333981", name: "JKP Telefonija 5",          sifra: "dobTelefon5" });
// komitenti

//nalozi
const nalogI1 = await Nalog.create({ company: company._id, user: user, locked: false, number: 1, duguje: 50000, potrazuje: 50000, opis: "Uplata pozajmice", date: new Date(Date.UTC(company.year[1], 0, 5)), type: "I", year: company.year[1]});
const stavI11 = await Stav.create({ user: user, company: company._id, opis: `Izvod 01 01 ${new Date(Date.UTC(company.year[1], 0, 5)).getFullYear()}`, sifra_komitenta: komitent1, pozivnabroj: null, konto: kontoDobavljači, duguje: 0, potrazuje: 50000, valuta: null, number: 0, nalog: nalogI1._id, nalog_date: nalogI1.date, type: nalogI1.type});
const stavI12 = await Stav.create({ user: user, company: company._id, opis: `Izvod 01 01 ${new Date(Date.UTC(company.year[1], 0, 5)).getFullYear()}`, sifra_komitenta: komitent1, pozivnabroj: null, konto: kontoTekuciRacun1, duguje: 50000, potrazuje: 0, valuta: null, number: 1, nalog: nalogI1._id, nalog_date: nalogI1.date, type: nalogI1.type});
nalogI1.stavovi = [ {_id: stavI11._id}, {_id: stavI12._id} ]
await nalogI1.save()
const nalogI2 = await Nalog.create({ company: company._id, user: user, locked: false, number: 2, duguje: 500000, potrazuje: 500000, opis: "Uplata pozajmice", date: new Date(Date.UTC(company.year[1], 0, 8)), type: "I", year: company.year[1]});
const stavI21 = await Stav.create({ user: user, company: company._id, opis: `Izvod 03 01 ${new Date(Date.UTC(company.year[1], 0, 8)).getFullYear()}`, sifra_komitenta: komitent2, pozivnabroj: null, konto: kontoDobavljači, duguje: 0, potrazuje: 500000, valuta: null, number: 0, nalog: nalogI2._id, nalog_date: nalogI2.date, type: nalogI2.type});
const stavI22 = await Stav.create({ user: user, company: company._id, opis: `Izvod 03 01 ${new Date(Date.UTC(company.year[1], 0, 8)).getFullYear()}`, sifra_komitenta: komitent2, pozivnabroj: null, konto: kontoTekuciRacun1, duguje: 500000, potrazuje: 0, valuta: null, number: 1, nalog: nalogI2._id, nalog_date: nalogI2.date, type: nalogI2.type});
nalogI2.stavovi = [ {_id: stavI21._id}, {_id: stavI22._id} ]
await nalogI2.save()


const nalogN1 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 1,  duguje: 3000,  potrazuje: 3000,  opis: `Izvod 01 02 ${new Date(Date.UTC(company.year[1], 0, 5) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[1], 0, 20)),  type: "N",  year: company.year[1]});
const stavN11 = await Stav.create({  user: user,  company: company._id,  opis: "Prenos na drugi tekuci racun",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun2,  duguje: 3000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogN1._id,  nalog_date: nalogN1.date,  type: nalogN1.type});
const stavN12 = await Stav.create({  user: user,  company: company._id,  opis: "Prenos na drugi tekuci racun",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun1,  duguje: 0,  potrazuje: 3000,  valuta: null,  number: 1,  nalog: nalogN1._id,  nalog_date: nalogN1.date,  type: nalogN1.type});
nalogN1.stavovi = [ {_id: stavN11._id}, {_id: stavN12._id} ]
await nalogN1.save()
const nalogI3 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 3,  duguje: 100000,  potrazuje: 100000,  opis: `Izvod 02 10 ${new Date(Date.UTC(company.year[1], 0, 5) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[1], 2, 20)),  type: "I",  year: company.year[1]});
const stavI31 = await Stav.create({  user: user,  company: company._id,  opis: "Prenos na drugi tekuci racun",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun2,  duguje: 100000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogI3._id,  nalog_date: nalogI3.date,  type: nalogI3.type});
const stavI32 = await Stav.create({  user: user,  company: company._id,  opis: "Prenos na drugi tekuci racun",  sifra_komitenta: komitent4,  pozivnabroj: null,  konto: kontoIntesaKredit,  duguje: 0,  potrazuje: 100000,  valuta: null,  number: 1,  nalog: nalogI3._id,  nalog_date: nalogI3.date,  type: nalogI3.type});
nalogI3.stavovi = [ {_id: stavI31._id}, {_id: stavI32._id} ]
await nalogI3.save()
const nalogI4 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 4,  duguje: 80000,  potrazuje: 80000,  opis: `Izvod 02 20 ${new Date(Date.UTC(company.year[1], 1, 20) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[1], 2, 20)),  type: "I",  year: company.year[1]});
const stavI41 = await Stav.create({  user: user,  company: company._id,  opis: "Uplata pozajmice",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun2,  duguje: 80000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogI4._id,  nalog_date: nalogI4.date,  type: nalogI4.type});
const stavI42 = await Stav.create({  user: user,  company: company._id,  opis: "Uplata pozajmice",  sifra_komitenta: komitent5,  pozivnabroj: null,  konto: kontoDobavljači,  duguje: 0,  potrazuje: 80000,  valuta: null,  number: 1,  nalog: nalogI4._id,  nalog_date: nalogI4.date,  type: nalogI4.type});
nalogI4.stavovi = [ {_id: stavI41._id}, {_id: stavI42._id} ]
await nalogI4.save()
const nalogI5 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 5,  duguje: 40000,  potrazuje: 40000,  opis: `Izvod 02 25 ${new Date(Date.UTC(company.year[1], 1, 25) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[1], 2, 25)),  type: "I",  year: company.year[1]});
const stavI51 = await Stav.create({  user: user,  company: company._id,  opis: "Povraćaj pozajmice",  sifra_komitenta: komitent5,  pozivnabroj: null,  konto: kontoDobavljači,  duguje: 40000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogI5._id,  nalog_date: nalogI5.date,  type: nalogI5.type});
const stavI52 = await Stav.create({  user: user,  company: company._id,  opis: "Povraćaj pozajmice",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun2,  duguje: 0,  potrazuje: 40000,  valuta: null,  number: 1,  nalog: nalogI5._id,  nalog_date: nalogI5.date,  type: nalogI5.type});
nalogI5.stavovi = [ {_id: stavI51._id}, {_id: stavI52._id} ]
await nalogI5.save()
const nalogI6 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 6,  duguje: 20000,  potrazuje: 20000,  opis: `Izvod 02 26 ${new Date(Date.UTC(company.year[1], 1, 26) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[1], 2, 26)),  type: "I",  year: company.year[1]});
const stavI61 = await Stav.create({  user: user,  company: company._id,  opis: "Povraćaj pozajmice",  sifra_komitenta: komitent5,  pozivnabroj: null,  konto: kontoDobavljači,  duguje: 20000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogI6._id,  nalog_date: nalogI6.date,  type: nalogI6.type});
const stavI62 = await Stav.create({  user: user,  company: company._id,  opis: "Povraćaj pozajmice",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun2,  duguje: 0,  potrazuje: 20000,  valuta: null,  number: 1,  nalog: nalogI6._id,  nalog_date: nalogI6.date,  type: nalogI6.type});
nalogI6.stavovi = [ {_id: stavI61._id}, {_id: stavI62._id} ]
await nalogI6.save()
const nalogI7 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 7,  duguje: 20000,  potrazuje: 20000,  opis: `Izvod 02 26 ${new Date(Date.UTC(company.year[1], 1, 27) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[1], 2, 27)),  type: "I",  year: company.year[1]});
const stavI71 = await Stav.create({  user: user,  company: company._id,  opis: "Povraćaj pozajmice",  sifra_komitenta: komitent5,  pozivnabroj: null,  konto: kontoDobavljači,  duguje: 20000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogI7._id,  nalog_date: nalogI7.date,  type: nalogI7.type});
const stavI72 = await Stav.create({  user: user,  company: company._id,  opis: "Povraćaj pozajmice",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun2,  duguje: 0,  potrazuje: 20000,  valuta: null,  number: 1,  nalog: nalogI7._id,  nalog_date: nalogI7.date,  type: nalogI7.type});
nalogI7.stavovi = [ {_id: stavI71._id}, {_id: stavI72._id} ]
await nalogI7.save()
const nalogI8 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 8,  duguje: 50000,  potrazuje: 50000,  opis: `Izvod 02 26 ${new Date(Date.UTC(company.year[1], 1, 27) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[1], 2, 27)),  type: "I",  year: company.year[1]});
const stavI81 = await Stav.create({  user: user,  company: company._id,  opis: "Uplata pozajmice",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun1,  duguje: 50000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogI8._id,  nalog_date: nalogI8.date,  type: nalogI8.type});
const stavI82 = await Stav.create({  user: user,  company: company._id,  opis: "Uplata pozajmice",  sifra_komitenta: komitent5,  pozivnabroj: null,  konto: kontoDobavljači,  duguje: 0,  potrazuje: 50000,  valuta: null,  number: 1,  nalog: nalogI8._id,  nalog_date: nalogI8.date,  type: nalogI8.type});
nalogI8.stavovi = [ {_id: stavI81._id}, {_id: stavI82._id} ]
await nalogI8.save()
const nalogI9 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 9,  duguje: 10000000,  potrazuje: 10000000,  opis: `Izvod 03 23 ${new Date(Date.UTC(company.year[1], 2, 23) ).getFullYear()}`,  date: new Date(Date.UTC(company.year[1], 2, 23)),  type: "I",  year: company.year[1]});
const stavI91 = await Stav.create({  user: user,  company: company._id,  opis: "Kredit",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun2,  duguje: 10000000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogI9._id,  nalog_date: nalogI9.date,  type: nalogI9.type});
const stavI92 = await Stav.create({  user: user,  company: company._id,  opis: "Kredit",  sifra_komitenta: komitent4,  pozivnabroj: "805556.6",  konto: kontoIntesaKredit,  duguje: 0,  potrazuje: 10000000,  valuta: null,  number: 1,  nalog: nalogI9._id,  nalog_date: nalogI9.date,  type: nalogI9.type});
nalogI9.stavovi = [ {_id: stavI91._id}, {_id: stavI92._id} ]
await nalogI9.save()
const nalogN2 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 2,  duguje: 1000000,  potrazuje: 1000000,  opis: `Preknjizavanje dela kredita`,  date: new Date(Date.UTC(company.year[1], 2, 25)),  type: "N",  year: company.year[1]});
const stavN21 = await Stav.create({  user: user,  company: company._id,  opis: "Deo kredita koji dospeva do 1 godine",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoIntesaKredit,  duguje: 1000000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogN2._id,  nalog_date: nalogN2.date,  type: nalogN2.type});
const stavN22 = await Stav.create({  user: user,  company: company._id,  opis: "Deo kredita koji dospeva do 1 godine",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoIntesaKreditKretkorocniDeo,  duguje: 0,  potrazuje: 1000000,  valuta: null,  number: 1,  nalog: nalogN2._id,  nalog_date: nalogN2.date,  type: nalogN2.type});
nalogN2.stavovi = [ {_id: stavN21._id}, {_id: stavN22._id} ]
await nalogN2.save()
const nalogI10 = await Nalog.create({ company: company._id,  user: user,  locked: false,  number: 10,  duguje: 50000,  potrazuje: 50000,  opis: `Povracaj kredita`,  date: new Date(Date.UTC(company.year[1], 4, 25)),  type: "I",  year: company.year[1]});
const stavI101 = await Stav.create({  user: user,  company: company._id,  opis: "Povracaj kredita",  sifra_komitenta: null,  pozivnabroj: "805556.6",  konto: kontoIntesaKreditKretkorocniDeo,  duguje: 50000,  potrazuje: 0,  valuta: null,  number: 0,  nalog: nalogI10._id,  nalog_date: nalogI10.date,  type: nalogI10.type});
const stavI102 = await Stav.create({  user: user,  company: company._id,  opis: "Povracaj kredita",  sifra_komitenta: null,  pozivnabroj: null,  konto: kontoTekuciRacun1,  duguje: 0,  potrazuje: 50000,  valuta: null,  number: 1,  nalog: nalogI10._id,  nalog_date: nalogI10.date,  type: nalogI10.type});
nalogI10.stavovi = [ {_id: stavI101._id}, {_id: stavI102._id} ]
await nalogI10.save()
//nalozi
console.log("Seeding ostalo completed.")
}

module.exports = seedOstaliNalozi;
