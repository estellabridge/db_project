const express = require("express");
const router = express.Router();
const infoController = require("../controller/infoContrllor");

router.post("/location", infoController.getLocationByLATLNG);

router.post("/info", infoController.getInfo);

module.exports = router;
