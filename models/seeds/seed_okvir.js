const Okvir = require("../okvir");

async function seedOkvir(company) {
await Okvir.create({ company: company, number: "0",   name: "LONG TERM ASSETS",                      type: "D" })
await Okvir.create({ company: company, number: "00",  name: "Unpaid registered capital",        type: "D" })
await Okvir.create({ company: company, number: "01",  name: "Intangible assets",               type: "D" })
await Okvir.create({ company: company, number: "02",  name: "Property, plant and equipment",    type: "D" })
await Okvir.create({ company: company, number: "03",  name: "Biological assets",                   type: "D" })
await Okvir.create({ company: company, number: "04",  name: "Long term financial investments",      type: "D" })
await Okvir.create({ company: company, number: "05",  name: "Long term receivables",              type: "D" })

await Okvir.create({ company: company, number: "1",   name: "CURRENT ASSETS",                      type: "D" })
await Okvir.create({ company: company, number: "10",  name: "Material inventories",                   type: "D" })
await Okvir.create({ company: company, number: "11",  name: "Unfinished production and services",     type: "D" })
await Okvir.create({ company: company, number: "12",  name: "Finished products",                    type: "D" })
await Okvir.create({ company: company, number: "13",  name: "Goods",                                type: "D" })
await Okvir.create({ company: company, number: "14",  name: "Fixed assets held for sale",   type: "D" })
await Okvir.create({ company: company, number: "15",  name: "Plaćeni avansi za zalihe i usluge",   type: "D" })

await Okvir.create({ company: company, number: "2",   name: "CURRENT ASSETS",                      type: "D" })
await Okvir.create({ company: company, number: "20",  name: "Accounts receivable",      type: "D" })
await Okvir.create({ company: company, number: "21",  name: "Specific accounts receivable", type: "D" })
await Okvir.create({ company: company, number: "22",  name: "Other receivables",                   type: "D" })
await Okvir.create({ company: company, number: "23",  name: "Short term financial investments",    type: "D" })
await Okvir.create({ company: company, number: "24",  name: "Cash and cash equvalents",  type: "D" })
await Okvir.create({ company: company, number: "25",  name: "Advanced payments for goods and services",   type: "D" })
await Okvir.create({ company: company, number: "27",  name: "VAT",            type: "D" })
await Okvir.create({ company: company, number: "28",  name: "Active accruals and prepaid expenses",     type: "D" })

await Okvir.create({ company: company, number: "3",   name: "CAPITAL",                      type: "P" } )
await Okvir.create({ company: company, number: "30",  name: "Capital stock",              type: "P" })
await Okvir.create({ company: company, number: "31",  name: "Unpaid registered capital", type: "P" })
await Okvir.create({ company: company, number: "32",  name: "Reserves",                      type: "P" })
await Okvir.create({ company: company, number: "33",  name: "Reevaluation adjustment of capital",      type: "P" })
await Okvir.create({ company: company, number: "34",  name: "Net profit carried over",        type: "P" })
await Okvir.create({ company: company, number: "35",  name: "Net loss carried over",                      type: "P" })

await Okvir.create({ company: company, number: "4",   name: "LIABILITIES",                                             type: "P" })
await Okvir.create({ company: company, number: "40",  name: "Long term provisions",                              type: "P" })
await Okvir.create({ company: company, number: "41",  name: "Long term liabilities",                                   type: "P" })
await Okvir.create({ company: company, number: "42",  name: "Short term financial obligations",                     type: "P" })
await Okvir.create({ company: company, number: "43",  name: "Current bussiness liabilities",                               type: "P" })
await Okvir.create({ company: company, number: "44",  name: "Other current liabilities",                      type: "P" })
await Okvir.create({ company: company, number: "45",  name: "Liabilities for gross wages and contributions paid by employer",           type: "P" })
await Okvir.create({ company: company, number: "46",  name: "Other liabilities",                                       type: "P" })
await Okvir.create({ company: company, number: "47",  name: "VAT payable",                 type: "P" })
await Okvir.create({ company: company, number: "48",  name: "Other taxes, and contributions", type: "P" })
await Okvir.create({ company: company, number: "49",  name: "Passive accruals",                     type: "P" })
 
await Okvir.create({ company: company, number: "5",   name: "Expenses",     type: "P" })
await Okvir.create({ company: company, number: "6",   name: "Revenues",     type: "P" })
console.log("Okvir seed completed.")
}

module.exports = seedOkvir;