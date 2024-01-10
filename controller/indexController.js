const createError = require("http-errors");
const userModel = require("../model/userModel");
const { poolPromise } = require("../config/config");

exports.getMainPage = async function (req, res, next) {
  try {
    const responeData = {};
    if (req.user !== undefined) {
      const user = await userModel.getUserById(req.user);
      responeData["user"] = {
        is_login_status: true,
        username: user[0].USERS_ID,
      };
    } else {
      responeData["user"] = { is_login_status: false };
    }

    const pool = await poolPromise;
    const korean = await pool.query`
    SELECT TOP 5 restaurant.CON_UID , restaurant.CON_TITLE, restaurant.CON_IMGFILENAME,  restaurant.SRC_TITLE
    FROM restaurant LEFT OUTER JOIN category ON restaurant.CON_UID = category.CON_UID
    WHERE category.CODE_NAME = '한식'
    ORDER BY NEWID();
    `;

    const japanese = await pool.query`
    SELECT TOP 5 restaurant.CON_UID , restaurant.CON_TITLE, restaurant.CON_IMGFILENAME,  restaurant.SRC_TITLE
    FROM restaurant LEFT OUTER JOIN category ON restaurant.CON_UID = category.CON_UID
    WHERE category.CODE_NAME = '일식'
    ORDER BY NEWID();
    `;

    const western = await pool.query`
    SELECT TOP 5 restaurant.CON_UID , restaurant.CON_TITLE, restaurant.CON_IMGFILENAME,  restaurant.SRC_TITLE
    FROM restaurant LEFT OUTER JOIN category ON restaurant.CON_UID = category.CON_UID
    WHERE category.CODE_NAME = '양식'
    ORDER BY NEWID();
    `;

    const cafe = await pool.query`
    SELECT TOP 5 restaurant.CON_UID , restaurant.CON_TITLE, restaurant.CON_IMGFILENAME,  restaurant.SRC_TITLE
    FROM restaurant LEFT OUTER JOIN category ON restaurant.CON_UID = category.CON_UID
    WHERE category.CODE_NAME = '카페'
    ORDER BY NEWID();
    `;

    res.render("index", { ...responeData, korean, japanese, western, cafe });
  } catch (error) {
    console.log(error);
    next(createError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getLoginPage = async function (req, res, next) {
  res.render("login");
};

exports.getMapPage = async function (req, res, next) {
  // 지도 연습시 사용, 완료시 삭제 필수
  res.render("map_practice");
};

exports.getListPage = async function (req, res, next) {
  try {
    const responeData = {};
    if (req.user !== undefined) {
      const user = await userModel.getUserById(req.user);
      responeData["user"] = {
        is_login_status: true,
        username: user[0].USERS_ID,
      };
    } else {
      responeData["user"] = { is_login_status: false };
    }
    const pool = await poolPromise;

    let result = null;

    let page = req.query.page || 1;

    let search = req.query.search || null;

    let filter = req.query.filter || "전체";

    let offset = (page - 1) * 8;

    let cnt_restaurant = null;

    if (!search && filter == "전체") {
      result = await pool.query` 
        SELECT ( SELECT COUNT(*) 
        FROM ((restaurant FULL OUTER JOIN cnt ON restaurant.CON_UID = cnt.CON_UID) LEFT OUTER JOIN category ON restaurant.CON_UID = category.CON_UID))
        AS cnt_restaurant, restaurant.CON_UID, restaurant.CON_TITLE, restaurant.CON_IMGFILENAME, restaurant.SRC_TITLE, restaurant.CON_PHONE, cnt.CON_LIKECNT, cnt.CON_READCNT 
        FROM ((restaurant FULL OUTER JOIN cnt ON restaurant.CON_UID = cnt.CON_UID) LEFT OUTER JOIN category ON restaurant.CON_UID = category.CON_UID)
        ORDER BY CON_UID
        OFFSET ${offset} ROWS
        FETCH NEXT ${8} ROWS ONLY
        `;
    } else if (search && filter == "전체") {
      result = await pool.query`
        SELECT ( SELECT COUNT (*) FROM list WHERE CON_TITLE LIKE ${`%${search}%`}) AS cnt_restaurant, * 
        FROM list
        WHERE CON_TITLE LIKE ${`%${search}%`}
        ORDER BY CON_UID
        OFFSET ${offset} ROWS
        FETCH NEXT ${8} ROWS ONLY
        `;
    } else if (!search && filter) {
      result = await pool.query`
        SELECT ( SELECT COUNT (*) FROM list WHERE CODE_NAME = ${filter}) AS cnt_restaurant, * 
        FROM list
        WHERE CODE_NAME = ${filter}
        ORDER BY CON_UID
        OFFSET ${offset} ROWS
        FETCH NEXT ${8} ROWS ONLY`;
    } else {
      result = await pool.query`
        SELECT ( SELECT COUNT (*) FROM list WHERE CON_TITLE LIKE ${`%${search}%`} AND CODE_NAME = ${filter}) AS cnt_restaurant, * 
        FROM list
        WHERE CON_TITLE LIKE ${`%${search}%`} AND CODE_NAME = ${filter}
        ORDER BY CON_UID
        OFFSET ${offset} ROWS
        FETCH NEXT ${8} ROWS ONLY
        `;
    }
    if (result.recordset.length == 0) {
      cnt_restaurant = 0;
    } else {
      cnt_restaurant = result.recordset[0].cnt_restaurant;
    }
    res.render("restaurant_list", {
      ...responeData,
      result,
      search,
      filter,
      cnt_restaurant,
    });

    // res.json({ ...responeData, recordset });
  } catch (error) {
    console.log(error);
    next(createError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getDetailPage = async function (req, res, next) {
  try {
    const responeData = {};
    if (req.user !== undefined) {
      const user = await userModel.getUserById(req.user);
      responeData["user"] = {
        is_login_status: true,
        username: user[0].USERS_ID,
      };
    } else {
      responeData["user"] = { is_login_status: false };
    }

    const pool = await poolPromise;

    const uid = req.query.uid;

    const { recordset } = await pool.query`
    UPDATE detail SET CON_READCNT += 1 WHERE CON_UID = ${uid}  
    SELECT *
    FROM detail
    WHERE CON_UID = ${uid}        
      `;

    res.render("restaurant_Details", {
      ...responeData,
      recordset,
    });
  } catch (error) {
    console.log(error);
    next(createError(500, "server_error", { isShowErrPage: true }));
  }
};

// exports.getSignUpPage = async function (req, res, next) {
//   res.render("signup");
// };
