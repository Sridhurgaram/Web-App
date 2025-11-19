import { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "sonner";

const ASSIGNEES = ["Alice", "Bob", "Charlie", "David"];

export default function TaskForm({ fetchTasks, editingTask, setEditingTask, tasks }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load task for editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setAssignee(
        ASSIGNEES.find(
          (a) => a.toLowerCase() === (editingTask.assignee || "").toLowerCase()
        ) || ""
      );
      setEstimatedHours(editingTask.estimatedHours?.toString() || "");
      setPriority(editingTask.priority || "Medium");
      setShowModal(true);
    } else resetForm();
  }, [editingTask]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignee("");
    setEstimatedHours("");
    setPriority("Medium");
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title is required");
    if (!description.trim()) return toast.error("Description is required");

    // Capitalization validation
    if (title.trim()[0] !== title.trim()[0].toUpperCase()) {
      return toast.error("Title must start with a capital letter");
    }
    if (description.trim()[0] !== description.trim()[0].toUpperCase()) {
      return toast.error("Description must start with a capital letter");
    }

    setLoading(true);
    try {
      const payload = { title, description, assignee, estimatedHours, priority };

      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, payload);
        toast.success("Task updated successfully!");
      } else {
        await API.post("/tasks", payload);
        toast.success("Task added successfully!");
      }

      resetForm();
      fetchTasks();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Task operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/tasks/${deleteTaskId}`);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete task");
    } finally {
      setShowDeleteModal(false);
      setDeleteTaskId(null);
    }
  };

  const openDeleteModal = (id) => {
    setDeleteTaskId(id);
    setShowDeleteModal(true);
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => setShowModal(true)}
        >
          Add Task
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks?.map((task) => (
          <div
            key={task._id}
            className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border-2 border-purple-500 shadow-md transition flex flex-col justify-between relative"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-md font-bold text-black">{task.title}</h3>
              <span
                className={`px-2 py-1 rounded-full text-white text-xs ${
                  task.priority === "High"
                    ? "bg-red-500"
                    : task.priority === "Low"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              >
                {task.priority || "Medium"}
              </span>
            </div>

            <div className="mb-4 text-white text-sm">
              <p className="mb-2">{task.description || "No description"}</p>
              <p className="mb-1">
                <strong>Assignee:</strong> {task.assignee || "Unassigned"}
              </p>
              <p>
                <strong>Estimated Hours:</strong> {task.estimatedHours || "N/A"}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                onClick={() => setEditingTask(task)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                onClick={() => openDeleteModal(task._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 w-96 max-w-full border border-white/20">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingTask ? "Edit Task" : "Add Task"}
            </h3>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
  <label className="text-white font-medium">Title</label>
  <input
    placeholder="Title"
    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    disabled={loading}
    required
  />

  <label className="text-white font-medium">Description</label>
  <input
    placeholder="Description"
    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    disabled={loading}
  />

  <label className="text-white font-medium">Assignee</label>
  <select
    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
    value={assignee}
    onChange={(e) => setAssignee(e.target.value)}
  >
    <option value="">Select Assignee</option>
    {ASSIGNEES.map((name) => (
      <option key={name} value={name}>
        {name}
      </option>
    ))}
  </select>

  <label className="text-white font-medium">Estimated Hours</label>
  <input
    type="number"
    placeholder="Estimated Hours"
    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
    value={estimatedHours}
    onChange={(e) => setEstimatedHours(e.target.value)}
    disabled={loading}
    min={0}
  />

  <label className="text-white font-medium">Priority</label>
  <select
    value={priority}
    onChange={(e) => setPriority(e.target.value)}
    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
  >
    <option>Low</option>
    <option>Medium</option>
    <option>High</option>
  </select>

  <div className="flex justify-end gap-2 mt-4">
    <button
      type="button"
      className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
      onClick={() => {
        resetForm();
        setShowModal(false);
      }}
      disabled={loading}
    >
      Cancel
    </button>
    <button
      type="submit"
      className={`px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={loading}
    >
      {loading ? (editingTask ? "Updating..." : "Adding...") : editingTask ? "Update" : "Add"}
    </button>
  </div>
</form>

          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <p className="text-gray-800 font-medium mb-4">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
