const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, assignee, estimatedHours, priority } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ msg: "Title is required" });
    }

    const newTask = new Task({
      title,
      description: description || "",
      assignee: assignee || "",
      estimatedHours: estimatedHours || 0,
      priority: priority || "Medium",
      userId: req.user.userId
    });

    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, assignee, estimatedHours, priority } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        assignee,
        estimatedHours,
        priority
      },
      { new: true }
    );

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Task deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
