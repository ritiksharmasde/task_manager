const express = require("express");
const {
  createTask,
  getTasks,
  updateTaskStatus
} = require("../controllers/task.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, adminOnly, createTask);
router.patch("/:taskId/status", protect, updateTaskStatus);

module.exports = router;