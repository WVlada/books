const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const Company = require("../models/user");

const kontoController = require("../controllers/konto");

router.get("/konto_edit", isAuth, kontoController.getEditKonto);
router.post("/konto_edit", isAuth, kontoController.postEditKonto);


module.exports = router;