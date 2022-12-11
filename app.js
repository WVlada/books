const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const csrf = require("csurf");
const favicon = require("serve-favicon");
const path = require("path");

const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

const app = express();
const csrfProtection = csrf();

const User = require("./models/user");
const Company = require("./models/company");

const MONGODB_URI = process.env.MONGODB
  ;
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "finbooks-sessions"
});

if (process.env.NODE_ENV === undefined) {
  env = require("./.env");
  process.env.NODE_ENV = env.NODE_ENV;
  process.env.HOST = env.HOST;
  process.env.LINKEDIN_CLIENT_ID = env.LINKEDIN_CLIENT_ID;
  process.env.LINKEDIN_CLIENT_SECRET = env.LINKEDIN_CLIENT_SECRET;
}

app.set("view engine", "ejs");

const userRoutes = require("./routes/user");
const companyRoutes = require("./routes/company");
const komitentRoutes = require("./routes/komitent");
const errorController = require("./controllers/error");
const nalogRoutes = require("./routes/nalog");
const kontoRoutes = require("./routes/konto");
app.use("/500", errorController.get500);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my finbooks secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);

app.use((req, res, next) => {
  if (
    !req.session.user &&
    !req.current_company_id &&
    !req.current_company_year &&
    !req.current_company_years
  ) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(async user => {
      if (!user) {
        //this means that i have session in browaser that wasnt deleted, and user doeasnt exist
        // in database no more, so i have to clear session
        req.session.user = null;
        req.session.isLoggedIn = null;
        req.session.save();
        return res.render("404", { status: 404, url: "/404" });
      }
      req.user = user;
      const company = await Company.findOne({ _id: user.current_company });
      user && company
        ? (req.current_company_years = company.year)
        : (req.current_company_years = null);
      user.current_company
        ? (req.current_company_id = user.current_company._id)
        : (req.current_company_id = null);
      user
        ? (req.current_company_year = user.current_company_year)
        : (req.current_company_year = null);
      next();
    })
    .catch(err => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(favicon(path.join(__dirname, "/public/favicon.ico")));

app.use(userRoutes);
app.use(companyRoutes);
app.use(komitentRoutes);
app.use(nalogRoutes);
app.use(kontoRoutes);
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(result => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
