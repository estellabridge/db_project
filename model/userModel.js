const { poolPromise } = require("../config/config");

exports.addNewUser = async function (userInfo) {
  const { USERS_ID, hashedPassword, USERS_NAME, USERS_EMAIL, USERS_PHONE } =
    userInfo;

  const pool = await poolPromise;
  await pool.query`INSERT INTO users(USERS_ID,USERS_PW,USERS_NAME,USERS_EMAIL,USERS_PHONE) VALUES
                      (${USERS_ID}, ${hashedPassword}, ${USERS_NAME}, ${USERS_EMAIL}, ${USERS_PHONE});`;
};

exports.getUserById = async function (USERS_ID) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM users WHERE USERS_ID = ${USERS_ID}`;
  return recordset;
};

exports.checkIdDuplication = async function (USERS_ID) {
  //id 중복 검사
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT USERS_ID FROM users WHERE USERS_ID = ${USERS_ID}`;

  if (recordset.length > 0) {
    return true;
  }
  return false;
};
