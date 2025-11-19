import { useEffect, useState } from "react";
import API from "../api/api";
import TaskForm from "./TaskForm";
import { toast } from "sonner";
import { LayoutGrid, User, LogOut } from "lucide-react";
import { Search } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  useEffect(() => {
    if (!localStorage.getItem("token")) window.location.href = "/login";
    fetchProfile();
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!search) setFilteredTasks(tasks);
    else {
      const lowerSearch = search.toLowerCase();
      setFilteredTasks(
        tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(lowerSearch) ||
            t.description.toLowerCase().includes(lowerSearch)
        )
      );
    }
  }, [search, tasks]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await API.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to fetch profile");
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteTaskId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/tasks/${deleteTaskId}`);
      setTasks(tasks.filter((t) => t._id !== deleteTaskId));
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete task");
    } finally {
      setShowDeleteModal(false);
      setDeleteTaskId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const menuItems = [
    { icon: <LayoutGrid className="mr-3 h-4 w-4" />, label: "Dashboard" },
    { icon: <User className="mr-3 h-4 w-4" />, label: "Profile" },
  ];

  return (
    <div className="relative min-h-screen flex">
      {/* Blurred Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/premium-photo/abstract-technology-background-with-blue-purple-tones_476363-3600.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(12px)",
          zIndex: 0,
        }}
      />
      <div className="absolute inset-0 bg-white/20 z-10"></div>

      {/* Sidebar */}
      <aside className="w-64 fixed h-screen z-20 flex flex-col justify-between bg-white/10 backdrop-blur-xl shadow-lg rounded-tr-xl rounded-br-xl border-r-2 border-purple-500">
        <div className="p-6 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-white">TaskManager</h1>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveMenu(item.label)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm font-medium w-full text-left ${
                  activeMenu === item.label
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-white hover:bg-purple-500/30"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-red-400 hover:text-white hover:bg-red-500 transition-all font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col relative z-20">
       {/* Topbar */}
<header className="w-full flex items-center bg-white/20 backdrop-blur-lg p-4 justify-between rounded-b-xl shadow-sm border-b-2 border-purple-500">
  {/* Search Box with Icon */}
 <div className="relative flex-1 max-w-2xl flex items-center">
  <Search className="absolute left-3 text-gray-400 w-5 h-5 pointer-events-none" />
  <input
    type="text"
    placeholder="Search tasks..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-md text-gray-800"
  />
</div>

  {/* User Avatar */}
  {user && (
    <div
      className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full ml-4 cursor-pointer relative shadow-sm"
      onClick={() => setShowUserModal(!showUserModal)}
    >
      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
        {user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()}
      </div>
      <span className="text-white font-medium">{user.name}</span>

      {showUserModal && (
        <div className="absolute top-12 right-0 w-48 bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-4 z-50 flex flex-col gap-2">
          <button
            className="text-left text-white hover:text-purple-400 font-medium px-3 py-2 rounded-lg transition-colors"
            onClick={() => setActiveMenu("Profile")}
          >
            My Profile
          </button>
          <button
            className="text-left text-red-400 hover:text-red-500 font-medium px-3 py-2 rounded-lg transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )}
</header>


        {/* Content Area */}
        <main className="p-8 overflow-auto flex-1">
          {activeMenu === "Dashboard" && (
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Dashboard
              </h1>
              {user && (
                <p className="text-white text-lg mb-4">Welcome, {user.name}!</p>
              )}

              {/* Pass filteredTasks to TaskForm */}
              <TaskForm
                fetchTasks={fetchTasks}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                tasks={filteredTasks}
              />
            </div>
          )}

          {activeMenu === "Profile" && user && (
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-8">
                My Profile
              </h1>
              <div className="flex justify-center">
                <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-lg p-8 w-96 flex flex-col items-center gap-6 ">
                  <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="text-center text-white">
                    <p className="text-lg font-medium">
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p className="text-lg font-medium">
                      <strong>Email:</strong> {user.email}
                    </p>
                  </div>

                  <button
                    className="mt-4 px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all"
                    onClick={() => setActiveMenu("Dashboard")}
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <p className="text-gray-800 font-medium mb-4">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded-xl bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded-xl bg-red-500 text-white hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
