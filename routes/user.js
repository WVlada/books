const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
const Company = require("../models/company");
const bcrypt = require("bcryptjs");

const userController = require("../controllers/user");

router.get("/", userController.getRoot);
router.get("/login", userController.getRoot);
router.get("/signup", userController.getSignUp);
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email adress.")
      .bail()
      .custom((value, { req }) => {
        return User.findOne({ email: req.body.email }).then(userDoc => {
          if (userDoc === null) {
            return Promise.reject("No user with that email registered.");
          }
        });
      }),
    check("password").custom((value, { req }) => {
      return User.findOne({ email: req.body.email }).then(userDoc => {
        if (userDoc) {
          return bcrypt.compare(value, userDoc.password).then(doMatch => {
            if (!doMatch) {
              return Promise.reject("Incorrect password.");
            }
          });
        }
      });
    }),
    check("email") // na kraju proceravam da li je confirmovan
      .custom((value, { req }) => {
        return User.findOne({ email: req.body.email }).then(userDoc => {
          if (userDoc && userDoc.emailConfirmed !== true) {
            return Promise.reject(
              "Email adress must be confirmed to continue. Please check your inbox."
            );
          }
        });
      })
  ],
  userController.postLogin
);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email adress.")
      .normalizeEmail({ gmail_remove_dots: false })
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("Email has already been registered.");
          }
        });
      }),
    body("password")
      .isLength({ min: 3 })
      .withMessage("Password must be minimum 3 characters long.")
      .isAlphanumeric()
      .withMessage("Password must be only letters and numbers.")
      .trim(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password must match confirm password field.");
        }
        if (value === "") {
          throw new Error("Confirm password field must not be blank.");
        }
        return true;
      })
      .trim()
  ],
  userController.postSignUp
);

router.get("/confirm-email/:token", userController.confirmEmail); //ovo je param

//router.get("/create_company", userController.createCompany);

router.get("/logout", userController.getLogout);
router.get("/settings", userController.getSettings);
router.get("/settings_tutorial_tips", userController.getSettingsTutorialTips);
router.get("/settings_autosave", userController.getSettingsAutosave);
router.get("/settings_permisions", userController.getSettingsPermisions);
router.get("/settings_new_company", isAuth, userController.getNewCompanySettings);
router.post("/settings_new_company", [
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
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email adress.")
      .normalizeEmail({ gmail_remove_dots: false })
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("Email has already been registered.");
          }
        });
      }),
  check("telephone")
    .isLength({ max: 15 })
    .withMessage(
      "If entered, telephone number must be maximum 30 characters long."
    )
], isAuth, userController.postNewCompanySettings);

router.get("/auth/linkedin/callback", userController.getLinkedin);
router.get("/preview_app", userController.getPreviewApp)
router.get("/back_to_login", userController.getBackToLogin);

module.exports = router;
