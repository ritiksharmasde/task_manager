const { z } = require("zod");
const prisma = require("../utils/prisma");

const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional()
});

const statusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"])
});

exports.createTask = async (req, res) => {
  try {
    const data = taskSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { id: data.projectId }
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Only project owner can create tasks" });
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: true
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({
      message: "Task creation failed",
      error: error.errors || error.message
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where:
        req.user.role === "ADMIN"
          ? { project: { ownerId: req.user.id } }
          : { assignedTo: req.user.id },
      include: {
        project: true,
        assignee: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const data = statusSchema.parse(req.body);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const isOwner = task.project.ownerId === req.user.id;
    const isAssignee = task.assignedTo === req.user.id;

    if (!isOwner && !isAssignee) {
      return res.status(403).json({ message: "Not allowed to update this task" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: data.status }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({
      message: "Status update failed",
      error: error.errors || error.message
    });
  }
};