import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import {
  CheckCircle,
  Moon,
  PlusCircle,
  Sun,
  Trash,
  ChartPie,
  ArrowsOut,
  ArrowsIn,
  Translate,
  PencilSimple,
  X,
  FloppyDisk,
  ArrowCounterClockwise,
  Warning,
  Info,
  DotsThreeVertical,
} from "phosphor-react";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface DeleteConfirmation {
  taskId: string | null;
  taskTitle: string;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deletingTask, setDeletingTask] = useState<DeleteConfirmation>({
    taskId: null,
    taskTitle: "",
    timeoutId: null,
  });
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("@todo:token");
    if (!token) {
      navigate("/login");
    } else {
      fetchTasks();
    }
  }, [navigate]);

  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (deletingTask.timeoutId) {
        clearTimeout(deletingTask.timeoutId);
      }
    };
  }, [deletingTask.timeoutId]);

  // Show toast notification
  const showToast = (
    type: "success" | "error" | "info" | "warning",
    message: string,
    duration = 3000
  ) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message, duration };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        );
      }, duration);
    }
  };

  // Remove a specific toast
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Fetch tasks from API
  async function fetchTasks() {
    setLoading(true);
    try {
      const token = localStorage.getItem("@todo:token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("@todo:token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      console.log("API Response:", data); // Log the API response

      // Check data structure
      if (data && typeof data === "object") {
        console.log("Data keys:", Object.keys(data));

        // If data has a tasks property, use it
        if (data.tasks && Array.isArray(data.tasks)) {
          console.log("Using data.tasks array:", data.tasks);
          setTasks(data.tasks);
        }
        // If data is directly an array
        else if (Array.isArray(data)) {
          console.log("Data is an array with length:", data.length);
          setTasks(data);
        }
        // If data is not in the expected format
        else {
          console.error("Data is not in expected format:", data);
          setTasks([]);
        }
      } else {
        console.error("Invalid data format:", data);
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again.");
      // Set tasks to empty array if there's an error
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  // Add new task
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const token = localStorage.getItem("@todo:token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const data = await response.json();
      setTasks([...tasks, data]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      showToast("success", t("taskAdded"));
    } catch (error) {
      console.error("Error creating task:", error);
      setError("Failed to create task. Please try again.");
      showToast("error", t("taskAddFailed"));
    }
  }

  // Toggle task completion
  async function handleToggleTask(id: string) {
    try {
      const taskToUpdate = tasks.find((task) => task.id === id);
      if (!taskToUpdate) return;

      const token = localStorage.getItem("@todo:token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/tasks/${id}/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !taskToUpdate.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );

      showToast(
        "success",
        taskToUpdate.completed
          ? t("taskMarkedIncomplete")
          : t("taskMarkedComplete")
      );
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task. Please try again.");
      showToast("error", t("taskUpdateFailed"));
    }
  }

  // Initiate task deletion with 5-second undo window
  function initiateTaskDeletion(task: Task) {
    // Clear any existing deletion timeout
    if (deletingTask.timeoutId) {
      clearTimeout(deletingTask.timeoutId);
    }

    // Set up new deletion timeout
    const timeoutId = setTimeout(() => {
      completeTaskDeletion(task.id);
    }, 5000);

    // Update deleting task state
    setDeletingTask({
      taskId: task.id,
      taskTitle: task.title,
      timeoutId,
    });

    // Store task for potential restoration
    setDeletedTasks((prev) => [...prev, task]);

    // Remove task from the UI immediately (but it's still available for restore)
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    showToast("info", t("taskDeletedUndo"), 5000);
  }

  // Complete task deletion after timeout or when confirmed
  async function completeTaskDeletion(id: string) {
    try {
      const token = localStorage.getItem("@todo:token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Clean up the deletion state
      setDeletingTask({
        taskId: null,
        taskTitle: "",
        timeoutId: null,
      });

      // Remove from deleted tasks store
      setDeletedTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("error", t("taskDeleteFailed"));

      // Restore the task to the UI since the deletion failed
      const taskToRestore = deletedTasks.find((task) => task.id === id);
      if (taskToRestore) {
        setTasks((prev) => [...prev, taskToRestore]);
        setDeletedTasks((prev) => prev.filter((task) => task.id !== id));
      }
    }
  }

  // Cancel task deletion and restore the task
  function cancelTaskDeletion() {
    if (deletingTask.timeoutId) {
      clearTimeout(deletingTask.timeoutId);

      // Restore the task from our deleted tasks store
      const taskToRestore = deletedTasks.find(
        (task) => task.id === deletingTask.taskId
      );
      if (taskToRestore) {
        setTasks((prev) => [...prev, taskToRestore]);
        setDeletedTasks((prev) =>
          prev.filter((task) => task.id !== deletingTask.taskId)
        );
        showToast("success", t("taskRestored"));
      }

      // Clear the deleting task state
      setDeletingTask({
        taskId: null,
        taskTitle: "",
        timeoutId: null,
      });
    }
  }

  // Toggle task details
  function toggleTaskDetails(id: string) {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  }

  // Logout function
  function handleLogout() {
    localStorage.removeItem("@todo:token");
    navigate("/login");
  }

  // Navigate to performance dashboard
  function navigateToPerformance() {
    navigate("/performance");
  }

  // Helper function to safely filter arrays
  const safeFilter = <T,>(
    array: T[] | null | undefined,
    predicate: (item: T) => boolean
  ): T[] => {
    return Array.isArray(array) ? array.filter(predicate) : [];
  };

  // Calculate completed tasks percentage
  const completedTasks = safeFilter(
    tasks,
    (task: Task) => task.completed
  ).length;
  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
  const completedPercentage = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Sort tasks by creation date (most recent first)
  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Function to check task status and return appropriate emoji
  const getTaskEmoji = (task: Task) => {
    if (task.completed) return null;

    const createdDate = new Date(task.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return { emoji: "😀", title: t("taskRecent") };
    } else if (diffDays <= 2) {
      return { emoji: "🙂", title: t("taskTwoDays") };
    } else if (diffDays <= 3) {
      return { emoji: "😐", title: t("taskThreeDays") };
    } else if (diffDays <= 5) {
      return { emoji: "🙁", title: t("taskFiveDays") };
    } else {
      return { emoji: "😟", title: t("taskOverdue") };
    }
  };

  // Start editing a task
  function handleEditTask(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setExpandedTaskId(task.id); // Expand the task while editing
  }

  // Cancel editing
  function handleCancelEdit() {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  }

  // Save edited task
  async function handleSaveTask(id: string) {
    if (!editTitle.trim()) return;

    try {
      const token = localStorage.getItem("@todo:token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      // Update the task in the state
      setTasks(
        tasks.map((task) =>
          task.id === id
            ? { ...task, title: editTitle, description: editDescription }
            : task
        )
      );

      // Reset editing state
      handleCancelEdit();
      showToast("success", t("taskUpdated"));
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task. Please try again.");
      showToast("error", t("taskUpdateFailed"));
    }
  }

  // Função para alternar o menu de ações de uma tarefa
  function toggleActionMenu(taskId: string) {
    if (activeActionMenu === taskId) {
      setActiveActionMenu(null);
    } else {
      setActiveActionMenu(taskId);
    }
  }

  // Fechar o menu de ações quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        activeActionMenu &&
        !(event.target as Element).closest(".action-menu")
      ) {
        setActiveActionMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeActionMenu]);

  return (
    <div className="min-h-screen h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-auto relative">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 w-80">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-3 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-100 text-green-800"
                : toast.type === "error"
                ? "bg-red-100 text-red-800"
                : toast.type === "warning"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            <div className="flex items-center">
              {toast.type === "success" ? (
                <CheckCircle className="mr-2" size={20} weight="fill" />
              ) : toast.type === "error" ? (
                <X className="mr-2" size={20} weight="fill" />
              ) : toast.type === "warning" ? (
                <Warning className="mr-2" size={20} weight="fill" />
              ) : (
                <Info className="mr-2" size={20} weight="fill" />
              )}
              <span className="text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-full hover:bg-opacity-80 ${
                toast.type === "success"
                  ? "bg-green-200 text-green-800"
                  : toast.type === "error"
                  ? "bg-red-200 text-red-800"
                  : toast.type === "warning"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-blue-200 text-blue-800"
              }`}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Undo Delete Banner */}
      {deletingTask.taskId && (
        <div className="fixed bottom-4 left-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">
              {t("taskBeingDeleted").replace(
                "{{title}}",
                deletingTask.taskTitle
              )}
            </span>
          </div>
          <button
            onClick={cancelTaskDeletion}
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md"
          >
            <ArrowCounterClockwise size={16} className="mr-1" />
            {t("undoDelete")}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("taskPageTitle")}
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors"
              title={
                language === "pt" ? "Switch to English" : "Mudar para Português"
              }
            >
              <Translate
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
            </button>
            <button
              onClick={navigateToPerformance}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 transition-colors"
              title={t("viewPerformance")}
            >
              <ChartPie
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:bg-gray-700"
              title={t("switchTheme")}
            >
              {theme === "dark" ? (
                <Sun size={24} className="text-yellow-500" />
              ) : (
                <Moon size={24} className="text-gray-600" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white dark:hover:bg-gray-700 dark:bg-gray-700"
            >
              {t("logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Summary */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t("taskSummary")}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {completedTasks} {t("tasksCompleted")} {totalTasks}{" "}
                {t("tasksTotalCompleted")}
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${completedPercentage}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                {completedPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Add new task form */}
        <form
          onSubmit={handleAddTask}
          className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {t("addNewTask")}
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("taskTitle")}
              </label>
              <input
                id="title"
                type="text"
                placeholder={t("taskTitlePlaceholder")}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="block w-full rounded-lg py-3 px-4 bg-gray-50 dark:bg-gray-700 border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-purple-600 dark:focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("taskDescription")}
              </label>
              <textarea
                id="description"
                placeholder={t("taskDescriptionPlaceholder")}
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-lg py-3 px-4 bg-gray-50 dark:bg-gray-700 border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-purple-600 dark:focus:ring-purple-400"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-4 shadow-sm transition-colors duration-300 flex items-center"
              >
                <PlusCircle size={20} className="mr-2" />
                {t("addTask")}
              </button>
            </div>
          </div>
        </form>

        {/* Task list */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : totalTasks > 0 ? (
          <ul className="space-y-3">
            {sortedTasks.map((task) => (
              <li
                key={task.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow transition-all duration-200"
              >
                <div className="py-4 px-4 flex items-center justify-between group">
                  <div className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`mr-3 flex-shrink-0 ${
                        task.completed
                          ? "text-green-500 hover:text-green-600 dark:bg-gray-700"
                          : "text-gray-400 hover:text-gray-500 dark:bg-gray-700"
                      }`}
                    >
                      <CheckCircle
                        size={24}
                        weight={task.completed ? "fill" : "regular"}
                      />
                    </button>
                    <div className="flex-1">
                      {editingTaskId === task.id ? (
                        <div className="space-y-2">
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            {t("taskTitle")}
                          </label>

                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-lg py-2 px-3 bg-gray-50 dark:bg-gray-700 border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-purple-600 dark:focus:ring-purple-400"
                            placeholder={t("taskTitlePlaceholder")}
                          />
                          <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            {t("taskDescription")}
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full rounded-lg py-2 px-3 bg-gray-50 dark:bg-gray-700 border-0 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-purple-600 dark:focus:ring-purple-400"
                            placeholder={t("taskDescriptionPlaceholder")}
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveTask(task.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center dark:bg-gray-700"
                              title={t("saveTask")}
                            >
                              <FloppyDisk size={18} className="mr-1" />
                              {t("save")}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center dark:bg-gray-700"
                              title={t("cancelEdit")}
                            >
                              <X size={18} className="mr-1" />
                              {t("cancel")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center">
                            <span
                              className={`text-gray-900 dark:text-white ${
                                task.completed
                                  ? "line-through text-gray-500 dark:text-gray-400"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </span>
                            {!task.completed && getTaskEmoji(task) && (
                              <span
                                className="ml-2"
                                title={getTaskEmoji(task)?.title}
                              >
                                {getTaskEmoji(task)?.emoji}
                              </span>
                            )}
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menu de ações para dispositivos móveis */}
                  <div className="md:hidden relative action-menu">
                    {/* Só mostrar o botão de ações quando não estiver editando */}
                    {editingTaskId !== task.id && (
                      <button
                        onClick={() => toggleActionMenu(task.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none dark:bg-gray-700 p-2 rounded-full"
                        title={t("actions")}
                      >
                        <DotsThreeVertical size={20} />
                      </button>
                    )}

                    {activeActionMenu === task.id && !editingTaskId && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleEditTask(task);
                              setActiveActionMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-900"
                          >
                            <PencilSimple size={18} className="mr-2" />
                            {t("editTask")}
                          </button>

                          {task.description && (
                            <button
                              onClick={() => {
                                toggleTaskDetails(task.id);
                                setActiveActionMenu(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-900"
                            >
                              {expandedTaskId === task.id ? (
                                <ArrowsIn size={18} className="mr-2" />
                              ) : (
                                <ArrowsOut size={18} className="mr-2" />
                              )}
                              {expandedTaskId === task.id
                                ? t("hideDetails")
                                : t("showDetails")}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              initiateTaskDeletion(task);
                              setActiveActionMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-900"
                          >
                            <Trash size={18} className="mr-2" />
                            {t("deleteTask")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ações para desktop */}
                  <div className="hidden md:flex items-center space-x-2">
                    {editingTaskId !== task.id && (
                      <>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="text-gray-400 hover:text-blue-500 focus:outline-none dark:bg-gray-700"
                          title={t("editTask")}
                        >
                          <PencilSimple size={20} />
                        </button>
                        {task.description && (
                          <button
                            onClick={() => toggleTaskDetails(task.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none dark:bg-gray-700"
                            title={
                              expandedTaskId === task.id
                                ? t("hideDetails")
                                : t("showDetails")
                            }
                          >
                            {expandedTaskId === task.id ? (
                              <ArrowsIn size={20} />
                            ) : (
                              <ArrowsOut size={20} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => initiateTaskDeletion(task)}
                          className="text-gray-400 hover:text-red-500 focus:outline-none dark:bg-gray-700"
                          title={t("deleteTask")}
                        >
                          <Trash size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {expandedTaskId === task.id &&
                  task.description &&
                  !editingTaskId && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="mt-1 pl-10 pr-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                        {task.description}
                      </div>
                    </div>
                  )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">{t("noTasks")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
