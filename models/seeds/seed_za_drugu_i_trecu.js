const Komitenttype = require("../komitenttype");

async function seedZaDruguITrecu(user, company){
// tipovi
    const bankatype     = await Komitenttype.create({ user: user, company: company, name: "Banka", type: "B", number: 0 });
    const kupactype     = await Komitenttype.create({ user: user, company: company, name: "Customer", type: "C", number: 1 });
    const dobavljactype = await Komitenttype.create({ user: user, company: company, name: "Supplier", type: "S", number: 2 });
// tipovi
}
module.exports = seedZaDruguITrecu;