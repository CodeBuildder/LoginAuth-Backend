const express = require("express");
const UserData = require("../models/userData");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/Admin");

const User = require("../models/user");

const router = new express.Router();



router.post("/tasks", auth, async (req, res) => {
    const userData = new UserData({
      ...req.body,
      user: req.user._id,
    });
  
    try {
      await userData.save();
      res.status(201).send(userData);
    } catch (e) {
      res.status(400).send(e);
    }
  });


  
  router.get("/admin/tasks", authAdmin, async (req, res) => {
    try {
      const userData = await UserData.find({});
      res.send(userData);
    } catch (e) {
      res.status(500).send(e);
    }
  });




  router.delete("/admin/tasks/:id", authAdmin, async (req, res) => {
    const taskId = req.params.id;
    try {
      const task = await UserData.findOneAndDelete({ _id: taskId });
  
      res.send(task);
    } catch (e) {
      res.status(500).send(e);
    }
  });




  router.patch("/admin/tasks/:id", authAdmin, async (req, res) => {
    const taskId = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "hobbies", "contact", "address"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
  
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }
  
    try {
      const task = await UserData.findOne({ _id: taskId });
      updates.forEach((update) => (task[update] = req.body[update]));
      await task.save();
      res.send(task);
    } catch (e) {
      res.status(500).send(e);
    }
  });
  



  router.get("/tasks", auth, async (req, res) => {
    try {
      await req.user.populate({ path: "tasks" }).execPopulate();
      res.send(req.user.tasks);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  
  router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
  
    try {
      const userData = await UserData.findOne({ _id, owner: req.user._id });
  
      if (!userData) {
        return res.status(401).send({ error: "Data does not exist." });
      }
  
      res.send(userData);
    } catch (e) {
      console.log("error here");
      res.status(401).send(e);
    }
  });


  
  router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "hobbies", "contact", "address"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
  
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid update data!" });
    }
  
    try {
      const userData = await UserData.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });
  
      if (!userData) {
        return res.status(404).send({ error: "Task does not exist." });
      }
  
      updates.forEach((update) => (userData[update] = req.body[update]));
      await userData.save();
      res.status(200).send(userData);
    } catch (e) {
      res.status(400).send(e);
    }
  });
  
  router.delete("/tasks/:id", auth, async (req, res) => {
    try {
      const userData = await UserData.findById({
        _id: req.params.id,
        owner: req.user._id,
      });
  
      if (!task) {
        return req.status(404).send({ error: "Data does not exist." });
      }
  
      res.status(201).send(userData);
    } catch (e) {
      res.status(500).send({
        error: "Invalid task. Please Enter appropriate authentication.",
      });
    }
  });
  
  module.exports = router;
  