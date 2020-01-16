const Okvir = require("../okvir");

async function seedOkvir(company) {
await Okvir.create({ company: company, number: "0",   naziv: "Stalna imovina",                      type: "D" })
await Okvir.create({ company: company, number: "00",  naziv: "Upisani a neuplaćeni kapital",        type: "D" })
await Okvir.create({ company: company, number: "01",  naziv: "Nematerijalna imovina",               type: "D" })
await Okvir.create({ company: company, number: "02",  naziv: "Nekretnine, postrojenja i oprema",    type: "D" })
await Okvir.create({ company: company, number: "03",  naziv: "Biološka sredstva",                   type: "D" })
await Okvir.create({ company: company, number: "04",  naziv: "Dugoročni finansijski plasmani",      type: "D" })
await Okvir.create({ company: company, number: "05",  naziv: "Dugoročna potraživanja",              type: "D" })

await Okvir.create({ company: company, number: "1",   naziv: "Obrtna imovina",                      type: "D" })
await Okvir.create({ company: company, number: "10",  naziv: "Zalihe materijala",                   type: "D" })
await Okvir.create({ company: company, number: "11",  naziv: "Nedovršena proizvodnja i usluge",     type: "D" })
await Okvir.create({ company: company, number: "12",  naziv: "Gotovi proizvodi",                    type: "D" })
await Okvir.create({ company: company, number: "13",  naziv: "Roba",                                type: "D" })
await Okvir.create({ company: company, number: "14",  naziv: "Stalna sredstva namenjena prodaji",   type: "D" })
await Okvir.create({ company: company, number: "15",  naziv: "Plaćeni avansi za zalihe i usluge",   type: "D" })

await Okvir.create({ company: company, number: "2",   naziv: "Obrtna imovina",                      type: "D" })
await Okvir.create({ company: company, number: "20",  naziv: "Potraživanja po osnovu prodaje",      type: "D" })
await Okvir.create({ company: company, number: "21",  naziv: "Potržaivanja iz specifičnih poslova", type: "D" })
await Okvir.create({ company: company, number: "22",  naziv: "Druga potrživanja",                   type: "D" })
await Okvir.create({ company: company, number: "23",  naziv: "Kratkoročni finansijski plasmani",    type: "D" })
await Okvir.create({ company: company, number: "24",  naziv: "Готовински еквиваленти и готовнина",  type: "D" })
await Okvir.create({ company: company, number: "25",  naziv: "Плаћени аванси за залихе и услуге",   type: "D" })
await Okvir.create({ company: company, number: "27",  naziv: "Porez na dodatu vrednost",            type: "D" })
await Okvir.create({ company: company, number: "28",  naziv: "Aktivna vremenska razgraničenja",     type: "D" })

await Okvir.create({ company: company, number: "3",   naziv: "Kapital",                      type: "P" } )
await Okvir.create({ company: company, number: "30",  naziv: "Osnovni kapital",              type: "P" })
await Okvir.create({ company: company, number: "31",  naziv: "Upisani a neuplaćeni kapital", type: "P" })
await Okvir.create({ company: company, number: "32",  naziv: "Rezerve",                      type: "P" })
await Okvir.create({ company: company, number: "33",  naziv: "Revalorizacione rezerve",      type: "P" })
await Okvir.create({ company: company, number: "34",  naziv: "Neraspoređeni dobitak",        type: "P" })
await Okvir.create({ company: company, number: "35",  naziv: "Gubitak",                      type: "P" })

await Okvir.create({ company: company, number: "4",   naziv: "Obaveze",                                             type: "P" })
await Okvir.create({ company: company, number: "40",  naziv: "Dugoročna rezervisanja",                              type: "P" })
await Okvir.create({ company: company, number: "41",  naziv: "Dugoročne obaveze",                                   type: "P" })
await Okvir.create({ company: company, number: "42",  naziv: "Kratkoročne finansijske obaveze",                     type: "P" })
await Okvir.create({ company: company, number: "43",  naziv: "Obaveze iz poslovanja",                               type: "P" })
await Okvir.create({ company: company, number: "44",  naziv: "Obaveze iz specifičnih poslova",                      type: "P" })
await Okvir.create({ company: company, number: "45",  naziv: "Obaveze po osnovu zarada i naknada zarada",           type: "P" })
await Okvir.create({ company: company, number: "46",  naziv: "Druge obaveze",                                       type: "P" })
await Okvir.create({ company: company, number: "47",  naziv: "Obaveze za porez na dodatu vrednost",                 type: "P" })
await Okvir.create({ company: company, number: "48",  naziv: "Obaveze za ostale poreze, doprinose i druge dažbine", type: "P" })
await Okvir.create({ company: company, number: "49",  naziv: "Pasivna vremenska razgraničenja",                     type: "P" })
 
await Okvir.create({ company: company, number: "5",   naziv: "Rashodi",     type: "P" })
await Okvir.create({ company: company, number: "6",   naziv: "Prihodi",     type: "P" })
console.log("Okvir seed completed.")
}

module.exports = seedOkvir;