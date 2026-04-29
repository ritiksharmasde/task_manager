const { z } = require("zod");
const prisma = require("../utils/prisma");

const projectSchema = z.object({
  name: z.string().min(2)
});

const addMemberSchema = z.object({
  email: z.string().email()
});

exports.createProject = async (req, res) => {
  try {
    const data = projectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id
          }
        }
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({
      message: "Project creation failed",
      error: error.errors || error.message
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "ADMIN") {
      projects = await prisma.project.findMany({
        where: { ownerId: req.user.id },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true }
              }
            }
          },
          tasks: true
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              userId: req.user.id
            }
          }
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, role: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true }
              }
            }
          },
          tasks: true
        },
        orderBy: { createdAt: "desc" }
      });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const data = addMemberSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Only project owner can add members" });
    }

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add member",
      error: error.code === "P2002" ? "User already added to project" : error.errors || error.message
    });
  }
};