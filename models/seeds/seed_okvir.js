const Okvir = require("../okvir");

async function seedOkvir(company) {
await Okvir.create({ company: company, number: "0",   name: "Stalna imovina",                      type: "D" })
await Okvir.create({ company: company, number: "00",  name: "Upisani a neuplaćeni kapital",        type: "D" })
await Okvir.create({ company: company, number: "01",  name: "Nematerijalna imovina",               type: "D" })
await Okvir.create({ company: company, number: "02",  name: "Nekretnine, postrojenja i oprema",    type: "D" })
await Okvir.create({ company: company, number: "03",  name: "Biološka sredstva",                   type: "D" })
await Okvir.create({ company: company, number: "04",  name: "Dugoročni finansijski plasmani",      type: "D" })
await Okvir.create({ company: company, number: "05",  name: "Dugoročna potraživanja",              type: "D" })

await Okvir.create({ company: company, number: "1",   name: "Obrtna imovina",                      type: "D" })
await Okvir.create({ company: company, number: "10",  name: "Zalihe materijala",                   type: "D" })
await Okvir.create({ company: company, number: "11",  name: "Nedovršena proizvodnja i usluge",     type: "D" })
await Okvir.create({ company: company, number: "12",  name: "Gotovi proizvodi",                    type: "D" })
await Okvir.create({ company: company, number: "13",  name: "Roba",                                type: "D" })
await Okvir.create({ company: company, number: "14",  name: "Stalna sredstva namenjena prodaji",   type: "D" })
await Okvir.create({ company: company, number: "15",  name: "Plaćeni avansi za zalihe i usluge",   type: "D" })

await Okvir.create({ company: company, number: "2",   name: "Obrtna imovina",                      type: "D" })
await Okvir.create({ company: company, number: "20",  name: "Potraživanja po osnovu prodaje",      type: "D" })
await Okvir.create({ company: company, number: "21",  name: "Potržaivanja iz specifičnih poslova", type: "D" })
await Okvir.create({ company: company, number: "22",  name: "Druga potrživanja",                   type: "D" })
await Okvir.create({ company: company, number: "23",  name: "Kratkoročni finansijski plasmani",    type: "D" })
await Okvir.create({ company: company, number: "24",  name: "Готовински еквиваленти и готовнина",  type: "D" })
await Okvir.create({ company: company, number: "25",  name: "Плаћени аванси за залихе и услуге",   type: "D" })
await Okvir.create({ company: company, number: "27",  name: "Porez na dodatu vrednost",            type: "D" })
await Okvir.create({ company: company, number: "28",  name: "Aktivna vremenska razgraničenja",     type: "D" })

await Okvir.create({ company: company, number: "3",   name: "Kapital",                      type: "P" } )
await Okvir.create({ company: company, number: "30",  name: "Osnovni kapital",              type: "P" })
await Okvir.create({ company: company, number: "31",  name: "Upisani a neuplaćeni kapital", type: "P" })
await Okvir.create({ company: company, number: "32",  name: "Rezerve",                      type: "P" })
await Okvir.create({ company: company, number: "33",  name: "Revalorizacione rezerve",      type: "P" })
await Okvir.create({ company: company, number: "34",  name: "Neraspoređeni dobitak",        type: "P" })
await Okvir.create({ company: company, number: "35",  name: "Gubitak",                      type: "P" })

await Okvir.create({ company: company, number: "4",   name: "Obaveze",                                             type: "P" })
await Okvir.create({ company: company, number: "40",  name: "Dugoročna rezervisanja",                              type: "P" })
await Okvir.create({ company: company, number: "41",  name: "Dugoročne obaveze",                                   type: "P" })
await Okvir.create({ company: company, number: "42",  name: "Kratkoročne finansijske obaveze",                     type: "P" })
await Okvir.create({ company: company, number: "43",  name: "Obaveze iz poslovanja",                               type: "P" })
await Okvir.create({ company: company, number: "44",  name: "Obaveze iz specifičnih poslova",                      type: "P" })
await Okvir.create({ company: company, number: "45",  name: "Obaveze po osnovu zarada i naknada zarada",           type: "P" })
await Okvir.create({ company: company, number: "46",  name: "Druge obaveze",                                       type: "P" })
await Okvir.create({ company: company, number: "47",  name: "Obaveze za porez na dodatu vrednost",                 type: "P" })
await Okvir.create({ company: company, number: "48",  name: "Obaveze za ostale poreze, doprinose i druge dažbine", type: "P" })
await Okvir.create({ company: company, number: "49",  name: "Pasivna vremenska razgraničenja",                     type: "P" })
 
await Okvir.create({ company: company, number: "5",   name: "Rashodi",     type: "P" })
await Okvir.create({ company: company, number: "6",   name: "Prihodi",     type: "P" })
console.log("Okvir seed completed.")
}

module.exports = seedOkvir;