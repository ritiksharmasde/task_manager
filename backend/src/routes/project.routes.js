const express = require("express");
const {
  createProject,
  getProjects,
  addMember
} = require("../controllers/project.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getProjects);
router.post("/", protect, adminOnly, createProject);
router.post("/:projectId/members", protect, adminOnly, addMember);

module.exports = router;