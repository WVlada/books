const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const Company = require("../models/user");

const companyController = require("../controllers/company");

router.get("/company", isAuth, companyController.getCompany);

router.get("/new_company", isAuth, companyController.getNewCompanyRoot);
router.post(
  "/new_company",
  [
    check("name")
      .isLength({ min: 3, max: 20 })
      .withMessage(
        "Company name must be minimum 3 and maximum 20 characters long."
      )
      .trim(),
    check("year")
      .isLength({ min: 4, max: 4 })
      .withMessage("Year wasn entered correctly.")
      .isNumeric(),
    check("mb")
      .isLength({ min: 8, max: 8 })
      .withMessage("MB wasnt entered correctly.")
      .isNumeric(),
    check("pib")
      .isLength({ min: 9, max: 9 })
      .withMessage("PIB wasnt entered correctly.")
      .isNumeric()
      .custom((value, { req }) => {
        return Company.findOne({ pib: value }).then(companyDoc => {
          if (companyDoc) {
            return Promise.reject("PIB has already been registered.");
          }
        });
      }),
    check("adress")
      .isLength({ max: 30 })
      .withMessage("Company adress must be maximum 30 characters long.")
      .trim(),
    check("email")
      .isLength({ max: 30 })
      .withMessage(
        "If entered, email adress must be maximum 30 characters long."
      ),
    check("telephone")
      .isLength({ max: 15 })
      .withMessage(
        "If entered, telephone number must be maximum 30 characters long."
      )
  ],
  isAuth,
  companyController.postNewCompanyRoot
);

router.get("/dnevnik_naloga", isAuth, companyController.getDnevnikNaloga);

router.get("/kontni_plan", isAuth, companyController.getKontniPlan);
router.get("/show_konto", isAuth, companyController.getShowKonto);

router.get("/change_company", isAuth, companyController.changeCompany);
router.get("/change_year", isAuth, companyController.changeYear);

router.get("/tok_dokumentacije", isAuth, companyController.getTokDokumentacije);

router.get("/not_implemented", isAuth, companyController.getNotImplemented);

module.exports = router;
