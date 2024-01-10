const http = require("http");
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const app = express();
const server = http.createServer(app);
const dotenv = require("dotenv");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const indexRouter = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");
const infoRouter = require("./routes/infoRouter.js");
const passport = require("passport");
const passportConfig = require("./passport"); // passport/index.js 폴더 임포트(index.js는 생략가능)

const { poolPromise } = require("./config/config.js");

const hostname = "127.0.0.1";
const port = 8080;

app.set("view engine", "ejs");

app.use(logger("dev"));
dotenv.config();
app.use(express.urlencoded({ extended: false })); //form 데이터
app.use(express.json()); //json
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: new SQLiteStore({ db: "session.db", dir: "./session" }),
    cookie: { maxAge: 3600000 }, // 1 hours (= 1 * 60 * 60 * 1000 ms)
  })
);

passportConfig();
app.use(passport.authenticate("session")); // authenticate the session.

app.use("/", express.static(path.join(__dirname, "public")));
app.set("views", "./views");
app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api", infoRouter);

app.use((err, req, res, next) => {
  //createError로 만듦.
  console.error(err);
  if (err.status) return res.status(err.status).send({ message: err.message });
  return res.status(500).send({ message: "server_error" });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
