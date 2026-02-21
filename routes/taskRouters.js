const express = require("express");
const Task = require("../models/Task");
const { isLoggedIn, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", isLoggedIn, async (req, res) => {
  const tasks = await Task.find().populate("owner assignedTo");
  res.render("index", { tasks, user: req.session.user });
});

router.post("/tasks", isLoggedIn, async (req, res) => {
  await Task.create({
    title: req.body.title,
    owner: req.session.user._id,
    assignedTo: [req.session.user._id]
  });
  res.redirect("/");
});

router.post("/tasks/:id/done", isLoggedIn, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task.completedBy.includes(req.session.user._id)) {
    task.completedBy.push(req.session.user._id);
  }

  if (task.completedBy.length === task.assignedTo.length) {
    task.done = true;
    task.doneAt = new Date();
  }

  await task.save();
  res.redirect("/");
});

router.post("/tasks/:id/delete", isLoggedIn, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

module.exports = router;