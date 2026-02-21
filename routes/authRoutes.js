const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

router.get("/register", (req, res) => res.render("register"));

router.post("/register", async (req, res) => {
  const { username, password, fullName, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash, fullName, role });
  res.redirect("/login");
});

router.get("/login", (req, res) => res.render("login"));

router.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.send("User not found");

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.send("Wrong password");

  req.session.user = user;
  res.redirect("/");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;