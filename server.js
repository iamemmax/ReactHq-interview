const express = require("express");
const app = express();
require("dotenv").config();
const DB = require("./config/Db");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/adminRoutes");
const adminDashboard = require("./routes/dashboardRoutes");
const methodOverride = require("method-override");
const Layout = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");

// @DESC: middlewares
app.set("view engine", "ejs");
app.use(Layout);
app.set("layout", "./layouts/authlayouts");
app.use(express.static(__dirname, +"asserts"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
require("./config/passport")(passport);
// database connection start here
DB();
// database connection end here

app.use(
  session({
    secret: process.env.SECRETE,
    cookie: { maxAge: 3600000, path: "/" },
    resave: true,
    saveUninitialized: true,
  })
);

console.log(process.env.SECRETE);
require("./config/passport")(passport);

app.use(passport.initialize());
app.use(passport.session());

// user routes middlewares
app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/admin", adminDashboard);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
