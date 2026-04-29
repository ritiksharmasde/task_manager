const prisma = require("../utils/prisma");

exports.getDashboard = async (req, res) => {
  try {
    const where =
      req.user.role === "ADMIN"
        ? { project: { ownerId: req.user.id } }
        : { assignedTo: req.user.id };

    const total = await prisma.task.count({ where });

    const pending = await prisma.task.count({
      where: { ...where, status: "PENDING" }
    });

    const inProgress = await prisma.task.count({
      where: { ...where, status: "IN_PROGRESS" }
    });

    const completed = await prisma.task.count({
      where: { ...where, status: "COMPLETED" }
    });

    const overdue = await prisma.task.count({
      where: {
        ...where,
        dueDate: { lt: new Date() },
        status: { not: "COMPLETED" }
      }
    });

    res.json({
      total,
      pending,
      inProgress,
      completed,
      overdue
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};