const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const Company = require("../models/user");

const kontoController = require("../controllers/konto");

router.get("/konto_edit", isAuth, kontoController.getEditKonto);
router.post("/konto_edit", isAuth, kontoController.postEditKonto);
router.get(
  "/konto_promet_odabir",
  isAuth,
  kontoController.getKontoPrometOdabir
);
router.post("/konto_promet", isAuth, kontoController.postKontoPromet);

router.get("/zakljucni_list", isAuth, kontoController.getZakljucniList);
router.get("/zakljucni_trocifreni", isAuth, kontoController.getZakljucniTrocifreni);

module.exports = router;
