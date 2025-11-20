import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { toast } from "sonner";

const ASSIGNEES = ["Alice", "Bob", "Charlie", "David"];

export default function TaskForm({
  fetchTasks,
  editingTask,
  setEditingTask,
  tasks,
  showAddModal,
  setShowAddModal,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const cardsRef = useRef([]);
  const modalRef = useRef();
  const [offsets, setOffsets] = useState([]);

  // Reset card refs when tasks change
  useEffect(() => {
    cardsRef.current = [];
  }, [tasks]);

  // Fan animation for Add/Edit modal
  useEffect(() => {
    if (!showAddModal) {
      setOffsets([]);
      return;
    }

    const timer = setTimeout(() => {
      if (!modalRef.current || tasks.length === 0) return;

      const modalCard = modalRef.current.querySelector("div") || modalRef.current;
      const modalRect = modalCard.getBoundingClientRect();
      const modalCenterX = modalRect.left + modalRect.width / 2;
      const modalCenterY = modalRect.top + modalRect.height / 2;

      const distance = window.innerWidth < 768 ? 70 : 120;
      const fanAngle = 80;

      const newOffsets = tasks.map((_, i) => {
        const cardEl = cardsRef.current[i];
        if (!cardEl) return { x: 0, y: 0 };

        const rect = cardEl.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        let dx = cardCenterX - modalCenterX;
        let dy = cardCenterY - modalCenterY;
        const length = Math.hypot(dx, dy) || 1;
        dx /= length;
        dy /= length;

        const progress = tasks.length === 1 ? 0 : (i / (tasks.length - 1)) - 0.5;
        const angleOffset = progress * (fanAngle * Math.PI / 180);

        const cos = Math.cos(angleOffset);
        const sin = Math.sin(angleOffset);

        const fx = dx * cos - dy * sin;
        const fy = dx * sin + dy * cos;

        return { x: fx * distance, y: fy * distance };
      });

      setOffsets(newOffsets);
    }, 100);

    return () => clearTimeout(timer);
  }, [showAddModal, tasks]);

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
    if (!title.trim() || !description.trim()) {
      return toast.error("Title and Description required");
    }

    const duplicate = tasks.some(
      (t) =>
        t.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        t.description.trim().toLowerCase() === description.trim().toLowerCase() &&
        (!editingTask || t._id !== editingTask._id)
    );

    if (duplicate) {
      return toast.error("Task already exists!");
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        assignee: assignee || null,
        estimatedHours: estimatedHours || null,
        priority,
      };

      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, payload);
        toast.success("Task updated successfully!");
      } else {
        await API.post("/tasks", payload);
        toast.success("Task added successfully!");
      }

      resetForm();
      fetchTasks();
      setShowAddModal(false);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Task operation failed");
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
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setShowDeleteModal(false);
      setDeleteTaskId(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Tasks</h2>
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          onClick={() => setShowAddModal(true)}
        >
          + Add Task
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks?.map((task, index) => (
          <div
            key={task._id}
            ref={(el) => { if (el) cardsRef.current[index] = el; }}
            className={`bg-white/10 backdrop-blur-md border-2 border-purple-400/30 rounded-2xl p-6 shadow-xl transition-all duration-500 ease-out relative ${
              showAddModal || showDeleteModal ? "pointer-events-none" : "hover:shadow-2xl"
            }`}
            style={{
              transform: showAddModal && offsets[index]
                ? `translate(${offsets[index].x}px, ${offsets[index].y}px) scale(0.88)`
                : "translate(0px, 0px) scale(1)",
              opacity: showAddModal || showDeleteModal ? 0.6 : 1,
              filter: showAddModal || showDeleteModal ? "blur(2px)" : "blur(0px)",
              zIndex: showAddModal || showDeleteModal ? 10 : 1,
              transition: "transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease, filter 0.5s ease",
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-white truncate max-w-[70%]">{task.title}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md ${
                  task.priority === "High" ? "bg-red-500" : task.priority === "Low" ? "bg-green-500" : "bg-yellow-500"
                }`}
              >
                {task.priority}
              </span>
            </div>

            <p className="text-white/80 text-sm mb-4 line-clamp-2">{task.description || "No description"}</p>

            <div className="text-white/70 text-xs space-y-1 mb-4">
              <p><strong>Assignee:</strong> {task.assignee || "Unassigned"}</p>
              <p><strong>Hours:</strong> {task.estimatedHours || "—"}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingTask(task);
                  setTitle(task.title);
                  setDescription(task.description);
                  setAssignee(task.assignee || "");
                  setEstimatedHours(task.estimatedHours || "");
                  setPriority(task.priority || "Medium");
                  setShowAddModal(true);
                }}
                className="flex-1 bg-blue-500/80 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Edit
              </button>
              <button
                onClick={() => openDeleteModal(task._id)}
                className="flex-1 bg-red-500/80 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
        >
          <div 
            className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/30"
            style={{ zIndex: 9999 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-white text-center">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white font-medium mb-2">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-gray-500 placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-gray-500 placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 resize-none transition"
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-white font-medium mb-2">Assignee</label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 appearance-none relative z-[100]"
                  >
                    <option value="">Unassigned</option>
                    {ASSIGNEES.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-white font-medium mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/50 appearance-none relative z-[100]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Estimated Hours</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-gray-500 placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                  placeholder="e.g. 4"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowAddModal(false); }}
                  className="flex-1 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* Delete Confirmation Modal */}
{showDeleteModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
    <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full border border-white/30 shadow-2xl">
      <h3 className="text-xl font-bold text-black mb-4">Delete Task?</h3>
      <p className="text-white mb-6">This action cannot be undone.</p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="flex-1 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
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
