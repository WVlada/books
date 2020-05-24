const Okvir = require("../okvir");

async function seedOkvir(company) {
await Okvir.create({ company: company, number: "0",   name: "LONG TERM ASSETS",                         type: "A" })
await Okvir.create({ company: company, number: "00",  name: "Unpaid registered capital",                type: "A" })
await Okvir.create({ company: company, number: "01",  name: "Intangible assets",                        type: "A" })
await Okvir.create({ company: company, number: "02",  name: "Property, plant and equipment",            type: "A" })
await Okvir.create({ company: company, number: "03",  name: "Biological assets",                        type: "A" })
await Okvir.create({ company: company, number: "04",  name: "Long term financial investments",          type: "A" })
await Okvir.create({ company: company, number: "05",  name: "Long term receivables",                    type: "A" })
        
await Okvir.create({ company: company, number: "1",   name: "CURRENT ASSETS",                           type: "A" })
await Okvir.create({ company: company, number: "10",  name: "Material inventories",                     type: "A" })
await Okvir.create({ company: company, number: "11",  name: "Unfinished production and services",       type: "A" })
await Okvir.create({ company: company, number: "12",  name: "Finished products",                        type: "A" })
await Okvir.create({ company: company, number: "13",  name: "Merchandise",                              type: "A" })
await Okvir.create({ company: company, number: "14",  name: "Fixed assets held for sale",               type: "A" })
await Okvir.create({ company: company, number: "15",  name: "Plaćeni avansi za zalihe i usluge",        type: "A" })
     
await Okvir.create({ company: company, number: "2",   name: "CURRENT ASSETS",                           type: "A" })
await Okvir.create({ company: company, number: "20",  name: "Accounts receivable",                      type: "A" })
await Okvir.create({ company: company, number: "21",  name: "Specific accounts receivable",             type: "A" })
await Okvir.create({ company: company, number: "22",  name: "Other receivables",                        type: "A" })
await Okvir.create({ company: company, number: "23",  name: "Short term financial investments",         type: "A" })
await Okvir.create({ company: company, number: "24",  name: "Cash and cash equvalents",                 type: "A" })
await Okvir.create({ company: company, number: "25",  name: "Advanced payments for goods and services", type: "A" })
await Okvir.create({ company: company, number: "27",  name: "VAT",                                      type: "A" })
await Okvir.create({ company: company, number: "28",  name: "Active accruals and prepaid expenses",     type: "A" })

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
 
await Okvir.create({ company: company, number: "5",   name: "EXPENSES",     type: "A" })
await Okvir.create({ company: company, number: "50",  name: "Costs of merchandise sold", type: "A" })
await Okvir.create({ company: company, number: "51",  name: "Costs of material", type: "A" })
await Okvir.create({ company: company, number: "52",  name: "Costs of salaries, fringe benefits and other personal expenses", type: "A" })
await Okvir.create({ company: company, number: "53",  name: "Costs of production services", type: "A" })
await Okvir.create({ company: company, number: "54",  name: "Costs of depreciation and provisions", type: "A" })
await Okvir.create({ company: company, number: "55",  name: "Non-production costs", type: "A" })
await Okvir.create({ company: company, number: "56",  name: "Financial expenses", type: "A" })
await Okvir.create({ company: company, number: "57",  name: "Other expenses", type: "A" })
await Okvir.create({ company: company, number: "58",  name: "Impairment Costs", type: "A" })
await Okvir.create({ company: company, number: "59",  name: "Losses of suspended business", type: "A" })

await Okvir.create({ company: company, number: "6",   name: "REVENUES",     type: "P" })
await Okvir.create({ company: company, number: "60",  name: "Income from the sale of merchandise", type: "P" })
await Okvir.create({ company: company, number: "61",  name: "Income from sales of products and services rendered", type: "P" })
await Okvir.create({ company: company, number: "62",  name: "Income from the own use of products, services and merchandise", type: "P" })
await Okvir.create({ company: company, number: "63",  name: "Change in value of inventories of work in progress and finished  products", type: "P" })
await Okvir.create({ company: company, number: "64",  name: "Income from premiums, subventions, donations, etc", type: "P" })
await Okvir.create({ company: company, number: "65",  name: "Other operating income", type: "P" })
await Okvir.create({ company: company, number: "66",  name: "Financial income", type: "P" })
await Okvir.create({ company: company, number: "67",  name: "Other income", type: "P" })
await Okvir.create({ company: company, number: "68",  name: "Income from assets valuation adjustments", type: "P" })
await Okvir.create({ company: company, number: "69",  name: "Profit of suspended business", type: "P" })



console.log("Okvir seed completed.")
}

module.exports = seedOkvir;