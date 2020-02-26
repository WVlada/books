const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const Company = require("../models/user");
const Nalog = require("../models/komitent");

const nalogController = require("../controllers/nalog");

router.get("/new_nalog", isAuth, nalogController.getNalog);
router.post(
  "/new_nalog",
  [
    check("broj_naloga")
      .isNumeric()
      .withMessage("Broj naloga must be a number."),
    check("opis_naloga")
      .isLength({ min: 1, max: 50 })
      .withMessage("Description must be more than 1 characters."),
    check("opis_stava")
      .isArray()
      .custom(array => {
        let i = 0;
        array.every(elem => {
          if (elem.length >= 0) {
            //kada ima =, onda moze i nula
            i++;
          } else {
            i++;
            msg = `Opis stava broj "${i}" mora biti duzi od 0 karaktera`;
            throw new Error(msg);
          }
        });
        return true;
      }),
    check("duguje")
      .isArray()
      .custom(array => {
        let i = 0;
        for (let j = 0; j <= array.length-1; j++){
          console.log("duguje")
          console.log(array[j])
          console.log("duguje")
          if (!isNaN(array[j].split(',').join(""))) {
            i++;
          } else {
            i++;
            msg = `Duguje number is not a number - "${array[j]}" `;
            throw new Error(msg);
          }
        }
        return true;
      }),
    check("potrazuje")
      .isArray()
      .custom(array => {
        let i = 0;
        for (let j = 0; j <= array.length-1; j++){
          console.log("duguje")
          console.log(array[j])
          console.log("duguje")
          if (!isNaN(array[j].split(',').join(""))) {
            i++;
          } else {
            i++;
            msg = `Potrazuje number is not a number - "${array[j]}" `;
            throw new Error(msg);
          }
        }
        return true;
      })
  ],
  isAuth,
  nalogController.postNalog
);
router.get("/edit_nalog", isAuth, nalogController.getEditNalog);
router.post("/edit_nalog", [
  check("opis_naloga")
  .isLength({ min: 1, max: 50 })
  .withMessage("Description must be more than 1 characters."),
], isAuth, nalogController.updateNalog);
router.get("/pronadji_brojeve_naloga", isAuth, nalogController.getPronadjiBrojeveNaloga);

module.exports = router;
