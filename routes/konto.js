const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const Company = require("../models/user");

const kontoController = require("../controllers/konto");

router.get("/konto_edit", isAuth, kontoController.getEditKonto);
router.post("/konto_edit", isAuth, kontoController.postEditKonto);
router.get("/konto_promet_odabir", isAuth, kontoController.getKontoPrometOdabir);
router.post("/konto_promet", isAuth, kontoController.postKontoPromet);

router.get("/zakljucni_list", isAuth, kontoController.getZakljucniList);
router.get("/zakljucni_list_odabir", isAuth, kontoController.getZakljucniListOdabir);

router.get("/zakljucni_trocifren", isAuth, kontoController.getZakljucniTrocifren);
router.get("/zakljucni_list_trocifren_odabir", isAuth, kontoController.getZakljucniListTrocifrenOdabir);
router.get("/zakljucni_pdf", isAuth, kontoController.getZakljucniPDF);
router.get("/zakljucni_trocifren_pdf", isAuth, kontoController.getZakljucniTrocifrenPDF);

router.get("/konto_promet_pdf", isAuth, kontoController.getKontoPrometPDF);


router.get("/html_to_pdf", isAuth, kontoController.getHTMLToPDF);


module.exports = router;
