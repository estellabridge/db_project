const passport = require("passport");
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const userModel = require("../model/userModel");
const { poolPromise } = require("../config/config");

exports.signin = function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    return next(createError(400, "not_contain_nessary_body"));
  }

  passport.authenticate("local", function (err, user, userError) {
    // new LocalStrategy(async function verify(username, password, cb){...}) 이후 작업

    // passport/localStrategy.js의 new LocalStrategy(...) 에서 예상치 못한 에러가 발생한 경우
    if (err) {
      console.error(err);
      return next(createError(500, "login_error"));
    }

    if (!user) {
      return next(userError);
    }

    // user정보 session storage에 저장
    return req.login(user, (err) => {
      if (err) {
        console.error(err);
        return next(createError(500, "login_error"));
      }

      res.status(201).json({ message: "Successfully login!" });
    });
  })(req, res, next);
};

exports.signup = async function (req, res, next) {
  try {
    if (
      //필수
      req.body.USERS_ID === undefined ||
      req.body.USERS_PW === undefined ||
      req.body.USERS_NAME === undefined ||
      req.body.USERS_EMAIL === undefined ||
      req.body.USERS_PHONE === undefined
    ) {
      return next(createError(400, "not_contain_nessary_body"));
    }

    const { USERS_ID, USERS_PW, USERS_NAME, USERS_EMAIL, USERS_PHONE } =
      req.body; //*필수

    if (await userModel.checkIdDuplication(USERS_ID)) {
      //*필수
      return next(createError(409, "아이디 중복! 다시입력해주세요!"));
    }

    const hashedPassword = await bcrypt.hash(USERS_PW, 12); //hash(패스워드, salt횟수) * 필수

    await userModel.addNewUser({
      //* 회원정보 데이터 넣기
      USERS_ID,
      hashedPassword,
      USERS_NAME,
      USERS_EMAIL,
      USERS_PHONE,
    });
    return res.status(201).json({ message: "Successfully signup!" }); //회원가입 가능
  } catch (error) {
    next(error);
  }
};

exports.logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(createError(500, "logout_error"));
    }
    return res.status(201).json({ message: "Successfully logout!" });
  });
};

exports.likeCNT = async function (req, res, next) {
  if (req.isAuthenticated()) {
    const pool = await poolPromise;

    const restaurant_id = req.query.uid;
    const user_id = req.user;

    const uid = await pool.query`
        SELECT USERS_UID
        FROM users
        WHERE USERS_ID=${user_id}`;

    console.log(uid.recordset[0].USERS_UID);
    console.log(restaurant_id);

    await pool.query`
      DECLARE @CountOfRecords INT;
        
      IF EXISTS (
          SELECT 1 FROM likeCNT
          WHERE CON_UID = ${restaurant_id} AND USERS_UID = ${uid.recordset[0].USERS_UID}
      )
      BEGIN
        DELETE FROM likeCNT
        WHERE CON_UID = ${restaurant_id} AND USERS_UID = ${uid.recordset[0].USERS_UID};
      END
      ELSE
      BEGIN
        INSERT INTO likeCNT (
            CON_UID,
            USERS_UID
        )
        VALUES (
            ${restaurant_id},
            ${uid.recordset[0].USERS_UID}
        );
    END;

    SELECT @CountOfRecords = COUNT(*)
    FROM likeCNT
    WHERE CON_UID = ${restaurant_id};
    
    
    UPDATE cnt
    SET CON_LIKECNT = @CountOfRecords
    WHERE CON_UID = ${restaurant_id};
      `;

    return res.json({ Message: "좋아요가 성공적으로 반영되었습니다!" });
  } else {
    return next(createError(401, "로그인이 필요합니다! "));
  }
};
