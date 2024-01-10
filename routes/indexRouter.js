const express = require("express");
const router = express.Router();
const indexController = require("../controller/indexController");

router.get("/", indexController.getMainPage);

router.get("/login", indexController.getLoginPage);

router.get("/map_practice", indexController.getMapPage); // 지도 연습 페이지 테스트 완료시 삭제 필수

router.get("/list", indexController.getListPage);

router.get("/list/details", indexController.getDetailPage);

module.exports = router;
