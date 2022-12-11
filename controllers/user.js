const User = require("../models/user");
const Company = require("../models/company");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
      process.env.SENDGRID_API_KEY
    }
  })
);
const crypto = require("crypto");
const emailConfirm = require("../public/email-confirm.js");
const request = require("request");
const seedOkvir = require("../models/seeds/seed_okvir");

exports.getRoot = (req, res, next) => {
  // ovo sam stavio da bih preneo poruku o neuspeloj confirmaciji maila
  const msgI = req.session["info"];
  const msgS = req.session["success"];
  let infoMsg = null;
  let succMsg = null;
  if (msgI) {
    infoMsg = [msgI];
  }
  if (msgS) {
    succMsg = [msgS];
  }
  req.session["info"] = null;
  req.session["success"] = null;
  // ovo sam stavio da bih preneo poruku o neuspeloj confirmaciji maila
  // uslov: req.session.user.company.length != 0 sam stavio ako user prekine login postupak na kreiranju
  // kompanije, jer tada se napravi user, koji je i loginovan, a ne postoje kompanije za prikaz
  if (req.session.isLoggedIn === true && req.session.user.company.length != 0) {
    console.log("LogedIN");
    res.redirect("/company");
  } else {
    console.log("Not LogedIN");
    res.render("user/login", {
      path: "/",
      pageTitle: "Finbooks app",
      oldInput: {
        email: "",
        password: "",
        confirmPassword: ""
      },
      successMessage: succMsg,
      infoMessage: infoMsg,
      errorMessage: [],
      validationErrors: []
    });
  }
};
exports.getSignUp = (req, res, next) => {
  res.render("user/signup", {
    path: "/signup",
    pageTitle: "Finbooks app",
    oldInput: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    errorMessage: [],
    validationErrors: []
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("user/login", {
      pageTitle: "Login",
      path: "/",
      hasError: true,
      oldInput: {
        email: email,
        password: password
      },
      successMessage: null,
      infoMessage: null,
      validationErrors: errors.array()
    });
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        console.log("user not found");
        return res.redirect("/");
      }
      bcrypt.compare(password, user.password).then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            if (user.company.count === 0) {
              console.log(err);
              res.redirect("/create_company");
            } else {
              console.log(err);
              res.redirect("/");
            }
          });
        }
        console.log("Password dont match");
        res.redirect("/");
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
      res.redirect("/");
    });
};
exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("user/signup", {
      pageTitle: "Signup",
      path: "/signup",
      hasError: true,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      validationErrors: errors.array() //cele greske
    });
  }
  User.findOne({ email: email })
    .then(userDoc => {
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          console.log(email);
          const user = new User({
            email: email,
            password: hashedPassword,
            emailConfirmed: false,
            current_company: null,
            current_company_year: null,
            current_company_years: []
          });
          return user;
        })
        .then(user => {
          crypto.randomBytes(32, (err, buffer) => {
            let token = buffer.toString("hex");
            user.confirmToken = token;
            user.confirmTokenExpiration = Date.now() + 10800000; //3 hour to confirm email.

            transporter
              .sendMail({
                to: email,
                from: "office@finbooks.com",
                subject: "Thanks for signing up at Finbooks!",
                html: emailConfirm(user.confirmToken, process.env.HOST)
                //html: `<h1>Hello.</h1><h2>You have successfuly made an account at Finbooks! <p>Click this link <a href="http://localhost:3000/confirm-email/${user.confirmToken}">link</a> to confirm your email adress.</p></h2>`
              })
              .catch(err => {
                console.log(err);
              });
            return user.save();
          });
          //return res.render("user/login", {
          //  path: "/login",
          //  pageTitle: "Login",
          //  successMessage: null,
          //  infoMessage: "Thanks for signing up! Check your email to confirm registration before loging in.",
          //  validationErrors: [],
          //  oldInput: { email: email, password: ""}
          //});
          req.session["info"] =
            "Thanks for signing up! Check your email to confirm registration before loging in.";
          return res.redirect("/");
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.confirmEmail = (req, res, next) => {
  const confirmEmailToken = req.params.token;
  let userFound = false;
  user = User.findOne({
    confirmToken: confirmEmailToken,
    confirmTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        req.session["info"] =
          "Your registration time has passed. Please contant the Finbooks! support team.";
        return res.redirect("/");
      }
      user.confirmToken = undefined;
      user.confirmTokenExpiration = undefined;
      user.emailConfirmed = true;
      user.save();

      (req.session["success"] =
        "Your email adress has been confirmed. Proceed by loging in with your credentials."),
        res.redirect("/");
    })
    .catch(err => {
      console.log(err);
    });

  //return res.render("user/login", {
  //        path: "/login",
  //        pageTitle: "Login",
  //        successMessage: null,
  //        errorMessage: "Your registration time has passed. Please contant the Finbooks! support team",
  //        infoMessage: null,
  //        validationErrors: [],
  //        oldInput: { email: "", password: ""}
  //        });
};
exports.getLogout = async (req, res, next) => {
  //req.session.destroy(err => {
  //  console.log(err);
  //});
  // uradio sam bez session destroy-a da bih preneo poruku
  // mozda nije dobro resenje, videcemo
  req.session.isLoggedIn = false;
  req.session.user = null;
  req.current_company_id = null;
  req.current_company_year = null;
  req.session["info"] = "You are now logged out. Thanks for using FinBooks!";
  await User.find({ fromLinkedIn: true }).then(async resArray => {
    if (resArray.length > 0) {
      for (let i = 0; i <= resArray.length - 1; i++) {
        let usr = await User.findOne({ _id: resArray[i]._id });
        await usr.deleteAllConnectedRecords();
      }}
  });
  // at the end, i delete all users, because User cannot be deleted from
  // within user schema (maybe it can)
  await User.deleteMany({ fromLinkedIn: true }).then(result => {
    return res.redirect("/");
  });
};

// ovo delo ne mogu ne znam zasto, ne mogu da vratim res.render iz then bloka
//.then(user=>{
//      if (!user) {
//        console.log("******************")
//        return res.render("user/login", {
//          path: "/login",
//          pageTitle: "Login",
//          successMessage: null,
//          errorMessage: "Your registration time has passed. Please contant the Finbooks! support team",
//          infoMessage: null,
//          validationErrors: [],
//          oldInput: { email: "", password: ""}
//          });}
//          console.log("yyyyyyyyyyyyy")
//  user.confirmToken = undefined;
//  user.confirmTokenExpiration = undefined;
//  user.emailConfirmed = true;
//  user.save();
//  return res.render("user/login", {
//    path: "/login",
//    pageTitle: "Login",
//    infoMessage: null,
//    successMessage: "Your email adress has been confirmed. Proceed by loging in with your credentials.",
//    validationErrors: [],
//    oldInput: { email: user.email, password: ""}})
//  }).catch(err => {
//  console.log(err);
//})

exports.createCompany = (req, res, next) => {
  //res.render("user/create_company", {
  //  path: "/create_company",
  //  pageTitle: "Finbooks app - create company"
  //});
};
exports.getSettings = (req, res, next) => {
  const user = req.user;
  const company_id = req.current_company_id;
  let companies;
  let company;
  Company.find({ user: user._id })
    .then(result => {
      companies = result;
    })
    .then(result => {
      Company.findById({ _id: company_id }).then(result => {
        company = result;
        return res.render("user/get_settings", {
          path: "/settings",
          user: user,
          company: company,
          companies: companies
        });
      });
    });
};
exports.getLinkedin = (req, res, next) => {
  const client_id = process.env.LINKEDIN_CLIENT_ID;
  const client_secret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirect_host = process.env.HOST;
  const code = req.query.code;
  const grant_type = "authorization_code";
  const URL = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=${grant_type}&code=${code}&redirect_uri=${redirect_host}/auth/linkedin/callback&client_id=${client_id}&client_secret=${client_secret}`;
  request.post(URL, function(error, response, body) {
    if (error) {
      console.log(error);
      return res.redirect("/");
    } else {
      var token = JSON.parse(response.body).access_token;
      //const options = {
      //  url: "https://api.linkedin.com/v2/me",
      //  method: "GET",
      //  headers: {
      //    Connection: "Keep-Alive",
      //    Authorization: `Bearer ${token}`
      //  }
      //};
      //request(options, function(err, res, body) {
      //  if (err) {
      //    console.log(err);
      //    return res.redirect("/");
      //  }
      //  const lastname = JSON.parse(body).localizedLastName;
      //  const firstname = JSON.parse(body).localizedFirstName;
      //  console.log(firstname);
      //  console.log(lastname);
      //});
      const optionsEmail = {
        url:
          "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
        method: "GET",
        headers: {
          Connection: "Keep-Alive",
          Authorization: `Bearer ${token}`
        }
      };
      request(optionsEmail, async function(err, response, body) {
        if (err) {
          console.log(err);
          return res.redirect("/");
        }
        const arr = JSON.parse(body).elements;
        if (!arr) {
          // ako user pogresi pass na linkedinu ili klinke cancel
          console.log(arr);
          return res.redirect("/");
        }
        const email = arr[0]["handle~"].emailAddress;
        const checkuser = await User.findOne({ email: email });
        if (checkuser) {
          req.session["info"] =
            "You are already signed up. Continue with company creation";
          req.session.isLoggedIn = true;
          req.session.user = checkuser;
          req.session.save();
          return res.redirect("/new_company");
        }
        const user = await User.create({
          email: email,
          emailConfirmed: true,
          password: "default",
          fromLinkedIn: true,
          company: []
        });
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
          if (user.company.length == 0 || user.company.length == undefined  ) {
            return res.redirect("/new_company");
          } else {
            res.redirect("/");
          }
        });
      });
    }
  });
};
exports.getPreviewApp = async (req, res, next) => {
  console.log("preview app_controller")

  // GET LOGOUT
  await User.find({ fromLinkedIn: true }).then(async resArray => {
    if (resArray.length > 0) {
      for (let i = 0; i <= resArray.length - 1; i++) {
        let usr = await User.findOne({ _id: resArray[i]._id });
        await usr.deleteAllConnectedRecords();
      }}
  });
  // at the end, i delete all users, because User cannot be deleted from
  // within user schema (maybe it can)
  await User.deleteMany({ fromLinkedIn: true }).then(result => {
    console.log("all previous users deleted")
  });
  // GET LOGOUT

  const user = await User.create({
    email: "gost@gmail.com",
    emailConfirmed: true,
    password: "default",
    fromLinkedIn: true,
    company: []
  });
  req.session.isLoggedIn = true;
  req.session.user = user;
  req.session.save(err => {
    if (user.company.length == 0 || user.company.length == undefined  ) {
      return res.redirect("/new_company");
    } else {
      res.redirect("/");
    }
  });
}

exports.getBackToLogin = (req, res, next) => {
  req.session.isLoggedIn = false;
  req.session.user = null;
  req.current_company_id = null;
  req.current_company_year = null;
  req.session["info"] = "Cache cleared";
  res.redirect("/");
};

exports.getSettingsTutorialTips = async (req, res, next) => {
  const user = req.user;
  user.tutorial_tips = !user.tutorial_tips;
  await user.save();
  console.log(user.tutorial_tips);
  return res.status(200).json([
    {
      param: "tutorial",
      msg: `Tutorial tips updated.`
    }
  ]);
};
exports.getSettingsAutosave = async (req, res, next) => {
  const user = req.user;
  user.autosave = !user.autosave;
  await user.save();
  console.log(user.autosave);
  return res.status(200).json([
    {
      param: "autosave",
      msg: `Autosaving updated.`
    }
  ]);
};
exports.getSettingsPermisions = async (req, res, next) => {
  const user = req.user;
  user.permisions = !user.permisions;
  await user.save();
  console.log(user.permisions);
  return res.status(200).json([
    {
      param: "permsisions",
      msg: `Permisions updated.`
    }
  ]);
};
exports.getNewCompanySettings = (req, res, next) => {
  const user = req.user;
  let name = "";
  let mb = "";
  let pib = "";
  let email = "";
  let adress = "";
  let telephone = "";
  let infoMsg;
  
  if (req.session["info"]) {
    infoMsg = req.session["info"];
  } else {
    infoMsg = "Please enter data about the company";
  }
  res.render("user/settings_new_company", {
    pageTitle: "New company",
    path: "/settings_new_company",
    infoMessage: infoMsg,
    oldInput: {
      name: name,
      mb: mb,
      pib: pib,
      email: email,
      adress: adress,
      telephone: telephone,
    },
    successMessage: null,
    validationErrors: [],
  });
};

exports.postNewCompanySettings = (req, res, next) => {
  const name = req.body.name;
  const year = req.body.year;
  const mb = req.body.mb;
  const pib = req.body.pib;
  const adress = req.body.adress;
  const email = req.body.email;
  const telephone = req.body.telephone;
  const user = req.user;
  
  const errors = validationResult(req);
  console.log(errors)
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(errors.array());
  }
  
    Company.findOne({ pib: pib })
    // findOne vraca null ako ne postoji
    // find vraca prazan array ako ne postoji
    .then((result) => {
      if (result) {
        return res.status(422).json({param: "pib", msg:"Company with same pib and year already exists. To be added as a user to existing company, contact FinBooks! administrators."})
          }
      else {
        const company = new Company({
          name: name,
          year: year,
          mb: mb,
          pib: pib,
          adress: adress,
          user: user,
          vrste_naloga: ["R", "N", "I", "Z"],
        });
        company
          .save()
          .then(seedOkvir(company))
          .then(
            user.addCompany(company)
               )
          .then(
            user.setActiveCompany(company)
               )
          .then(
            res.redirect("/company")
            )
          }})
}