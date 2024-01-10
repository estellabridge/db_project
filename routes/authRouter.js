const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/login/sign-in", authController.signin);

router.post("/login", authController.signup);

router.post("/logout", authController.logout);

router.post("/likeCNT", authController.likeCNT);

module.exports = router;
