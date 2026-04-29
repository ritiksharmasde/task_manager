import { useEffect, useState } from "react";
import API from "./api";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
  });

  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [projectName, setProjectName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    dueDate: "",
  });

  const loadData = async () => {
    try {
      const [dashRes, projectRes, taskRes] = await Promise.all([
        API.get("/dashboard"),
        API.get("/projects"),
        API.get("/tasks"),
      ]);

      setDashboard(dashRes.data);
      setProjects(projectRes.data);
      setTasks(taskRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";

      const payload = isLogin
        ? {
            email: authForm.email,
            password: authForm.password,
          }
        : authForm;

      const res = await API.post(endpoint, payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);
    } catch (error) {
      alert(error.response?.data?.message || "Auth failed");
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const createProject = async (e) => {
    e.preventDefault();

    try {
      await API.post("/projects", { name: projectName });
      setProjectName("");
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Project creation failed");
    }
  };

  const addMember = async (e) => {
    e.preventDefault();

    try {
      await API.post(`/projects/${selectedProject}/members`, {
        email: memberEmail,
      });

      setMemberEmail("");
      loadData();
      alert("Member added");
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || "Failed");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        projectId: taskForm.projectId,
        dueDate: taskForm.dueDate
          ? new Date(taskForm.dueDate).toISOString()
          : undefined,
        assignedTo: taskForm.assignedTo || undefined,
      };

      await API.post("/tasks", payload);

      setTaskForm({
        title: "",
        description: "",
        projectId: "",
        assignedTo: "",
        dueDate: "",
      });

      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Task creation failed");
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed");
    }
  };

  if (!user) {
    return (
      <div className="container auth-container">
        <div className="card auth-card">
          <h1>Team Task Manager</h1>
          <h2>{isLogin ? "Login" : "Signup"}</h2>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <input
                  placeholder="Name"
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, name: e.target.value })
                  }
                />

                <select
                  value={authForm.role}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, role: e.target.value })
                  }
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                </select>
              </>
            )}

            <input
              placeholder="Email"
              value={authForm.email}
              onChange={(e) =>
                setAuthForm({ ...authForm, email: e.target.value })
              }
            />

            <input
              placeholder="Password"
              type="password"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
            />

            <button>{isLogin ? "Login" : "Signup"}</button>
          </form>

          <p onClick={() => setIsLogin(!isLogin)} className="link">
            {isLogin ? "Create new account" : "Already have account? Login"}
          </p>
        </div>
      </div>
    );
  }

  const allMembers = projects.flatMap((p) => p.members || []);

  return (
    <div className="container">
      <nav>
        <div>
          <h1>Team Task Manager</h1>
          <p>
            {user.name} — <b>{user.role}</b>
          </p>
        </div>
        <button onClick={logout}>Logout</button>
      </nav>

      <section className="grid dashboard">
        <div className="card">Total: {dashboard?.total || 0}</div>
        <div className="card">Pending: {dashboard?.pending || 0}</div>
        <div className="card">In Progress: {dashboard?.inProgress || 0}</div>
        <div className="card">Completed: {dashboard?.completed || 0}</div>
        <div className="card danger">Overdue: {dashboard?.overdue || 0}</div>
      </section>

      {user.role === "ADMIN" && (
        <section className="grid two">
          <div className="card">
            <h2>Create Project</h2>
            <form onSubmit={createProject}>
              <input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <button>Create</button>
            </form>
          </div>

          <div className="card">
            <h2>Add Member</h2>
            <form onSubmit={addMember}>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Member email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />

              <button>Add Member</button>
            </form>
          </div>
        </section>
      )}

      {user.role === "ADMIN" && (
        <section className="card">
          <h2>Create Task</h2>
          <form onSubmit={createTask} className="task-form">
            <input
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
            />

            <input
              placeholder="Description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
            />

            <select
              value={taskForm.projectId}
              onChange={(e) =>
                setTaskForm({ ...taskForm, projectId: e.target.value })
              }
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              value={taskForm.assignedTo}
              onChange={(e) =>
                setTaskForm({ ...taskForm, assignedTo: e.target.value })
              }
            >
              <option value="">Unassigned</option>
              {allMembers.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
            </select>

            <input
              type="datetime-local"
              value={taskForm.dueDate}
              onChange={(e) =>
                setTaskForm({ ...taskForm, dueDate: e.target.value })
              }
            />

            <button>Create Task</button>
          </form>
        </section>
      )}

      <section className="card">
        <h2>Projects</h2>
        {projects.map((project) => (
          <div className="item" key={project.id}>
            <h3>{project.name}</h3>
            <p>Members: {project.members?.length || 0}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Tasks</h2>
        {tasks.map((task) => (
          <div className="item" key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
              Project: <b>{task.project?.name}</b>
            </p>
            <p>
              Assigned to:{" "}
              <b>{task.assignee ? task.assignee.name : "Unassigned"}</b>
            </p>
            <p>Status: {task.status}</p>
            <p>
              Due:{" "}
              {task.dueDate
                ? new Date(task.dueDate).toLocaleString()
                : "No due date"}
            </p>

            <select
              value={task.status}
              onChange={(e) => updateStatus(task.id, e.target.value)}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;