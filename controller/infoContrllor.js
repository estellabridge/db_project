const { poolPromise } = require("../config/config");

exports.getInfo = async function (req, res, next) {
  const pool = await poolPromise;

  const { recordset } =
    await pool.query`SELECT CON_UID , CON_TITLE, CON_PHONE, CON_IMGFILENAME, SRC_TITLE FROM restaurant `;

  if (recordset.length > 0) {
    return res.send(recordset);
  }

  return false;
};

exports.getLocationByLATLNG = async function (req, res, next) {
  const pool = await poolPromise;
  const uid = req.query.uid;

  const { recordset } =
    await pool.query`SELECT location.CON_LATITUDE, location.CON_LONGITUDE FROM restaurant LEFT OUTER JOIN location ON restaurant.CON_UID = location.CON_UID WHERE location.CON_UID = ${uid};`;

  if (recordset.length > 0) {
    return res.send(...recordset);
  }
  return false;
};
