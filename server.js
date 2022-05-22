const express = require("express");
const app = express();
require("dotenv").config();
const DB = require("./config/Db");
const userRoutes = require("./routes/user");

app.set("view engine", "ejs");
app.use(express.static(__dirname, +"asserts"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// database connection start here
DB();
// database connection end here

// user routes middlewares
app.use("/", userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
