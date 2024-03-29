const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const Company = require("../models/user");
const Komitent = require("../models/komitent");

const komitentController = require("../controllers/komitent");

router.get("/komitenti", isAuth, komitentController.getKomitentIndex);
router.get("/banks", isAuth, komitentController.getKomitentBanksIndex);

router.get("/komitent", isAuth, komitentController.getKomitent);
router.get("/komitent_edit", isAuth, komitentController.getEditKomitent);
router.post(
  "/komitent_edit",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email adress.")
      .normalizeEmail({ gmail_remove_dots: false }),
    check("name")
      .isLength({ min: 3, max: 25 })
      .withMessage(
        "Client name must be minimum 3 and maximum 25 characters long."
      )
      .trim(),
    check("pib")
      .isLength({ min: 9, max: 9 })
      .withMessage("PIB wasnt entered correctly.")
      .isNumeric()
      .custom((value, { req }) => {
        if (req.body.komitent_id) {
          return Promise.resolve();
        }
        return Komitent.findOne({ pib: value }).then(clientDoc => {
          if (clientDoc) {
            return Promise.reject("PIB has already been registered.");
          }
        });
      }),
    check("number")
      .isInt({ min: 0, max: 999 })
      .withMessage(
        "Number wasnt entered correctly, it must be positive and less than 999."
      )
      .custom((value, { req }) => {
        return Komitent.findOne({
          company: req.current_company_id,
          number: value
        }).then(clientDoc => {
          if (clientDoc) {
            if (clientDoc._id != req.body.komitent_id) {
              return Promise.reject("Number has already been registered.");
            }
          }
        });
      }),
    check("adress")
      .isLength({ min: 3, max: 30 })
      .withMessage("Client adress must be maximum 30 characters long.")
      .trim(),
    check("sifra")
      .isLength({ min: 3, max: 20 })
      .withMessage(
        "Client code must be minimum 3 and maximum 20 characters long."
      )
      .trim()
  ],
  isAuth,
  komitentController.postEditKomitent
);

module.exports = router;
