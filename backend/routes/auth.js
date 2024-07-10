const express = require("express");
const router = express.Router();
const User = require("../models/User");
const app = express();

//create a user using :POST "./api/auth" .Dosen't require Auth
app.get("/", (req, res) => {
  console.log("Router working");
  res.send("I am auth");
});

app.use(router);

module.exports = router;
