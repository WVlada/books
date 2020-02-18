const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const Company = require("../models/user");
const Komitent = require("../models/komitent");

const komitentController = require("../controllers/komitent");

router.get("/komitenti", isAuth, komitentController.getKomitentIndex);
router.get("/komitent", isAuth, komitentController.getKomitent);
router.get("/komitent_new", isAuth, komitentController.getNewKomitent);
router.get("/komitent_edit", isAuth, komitentController.getEditKomitent);

module.exports = router;
