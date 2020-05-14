const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const { check, body } = require("express-validator");
const User = require("../models/user");
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

router.get("/auth/linkedin/callback", userController.getLinkedin);
router.get("/back_to_login", userController.getBackToLogin);

module.exports = router;
