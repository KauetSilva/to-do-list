import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import {
  ArrowLeft,
  Moon,
  Sun,
  Trophy,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  ListChecks,
  Translate,
} from "phosphor-react";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  lastWeekCompleted: number;
  lastMonthCompleted: number;
  dailyAverage: number;
}

export function Performance() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
    lastWeekCompleted: 0,
    lastMonthCompleted: 0,
    dailyAverage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  // Helper function to safely filter arrays
  const safeFilter = <T,>(
    array: T[] | null | undefined,
    predicate: (item: T) => boolean
  ): T[] => {
    return Array.isArray(array) ? array.filter(predicate) : [];
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("@todo:token");
    if (!token) {
      navigate("/login");
    } else {
      fetchTasks();
    }
  }, [navigate]);

  // Fetch tasks and calculate statistics
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
      console.log("Performance API Response:", data); // Log the API response

      let taskArray: Task[] = [];

      // Check data structure
      if (data && typeof data === "object") {
        // If data has a tasks property, use it
        if (data.tasks && Array.isArray(data.tasks)) {
          taskArray = data.tasks;
        }
        // If data is directly an array
        else if (Array.isArray(data)) {
          taskArray = data;
        }
      }

      console.log("Task array to use:", taskArray);
      setTasks(taskArray);
      calculateStats(taskArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again.");
      setTasks([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  }

  // Calculate task statistics
  function calculateStats(tasks: Task[]) {
    if (!Array.isArray(tasks)) {
      tasks = [];
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completed = safeFilter(tasks, (task) => task.completed).length;
    const pending = tasks.length - completed;

    const lastWeekCompleted = safeFilter(
      tasks,
      (task) => task.completed && new Date(task.createdAt) >= oneWeekAgo
    ).length;

    const lastMonthCompleted = safeFilter(
      tasks,
      (task) => task.completed && new Date(task.createdAt) >= oneMonthAgo
    ).length;

    const completionRate = tasks.length ? (completed / tasks.length) * 100 : 0;

    // Assuming we have tasks for at least the last 30 days
    const dailyAverage = lastMonthCompleted / 30;

    setStats({
      total: tasks.length,
      completed,
      pending,
      completionRate,
      lastWeekCompleted,
      lastMonthCompleted,
      dailyAverage,
    });
  }

  // Go back to tasks page
  function handleBackToTasks() {
    navigate("/tasks");
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-auto">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleBackToTasks}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:bg-gray-700"
              title="Back to Tasks"
            >
              <ArrowLeft
                size={20}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("performanceTitle")}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:bg-gray-700"
              title={
                language === "pt" ? "Switch to English" : "Mudar para Português"
              }
            >
              <Translate
                size={24}
                className="text-purple-600 dark:text-purple-400"
              />
              <span className="sr-only">
                {language === "pt"
                  ? "Switch to English"
                  : "Mudar para Português"}
              </span>
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
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Key metrics */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Completion rate */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                  <Trophy
                    size={28}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {t("completionRate")}
                </h3>
                <div className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(stats.completionRate)}%
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("ofAllTasks")}
                </p>
              </div>

              {/* Total tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <CheckCircle
                    size={28}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {t("totalTasks")}
                </h3>
                <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {stats.completed} {t("completed")}, {stats.pending}{" "}
                  {t("pending")}
                </p>
              </div>

              {/* Last 7 days */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <Calendar
                    size={28}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {t("last7Days")}
                </h3>
                <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.lastWeekCompleted}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("tasksCompleted7Days")}
                </p>
              </div>

              {/* Daily average */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
                  <Clock
                    size={28}
                    className="text-yellow-600 dark:text-yellow-400"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {t("dailyAverage")}
                </h3>
                <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.dailyAverage.toFixed(1)}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("tasksPerDay")}
                </p>
              </div>
            </div>

            {/* Completion progress */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t("taskCompletionProgress")}
              </h2>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
              <div className="mt-4 flex justify-between">
                <div className="flex items-center">
                  <CheckCircle
                    size={20}
                    weight="fill"
                    className="text-green-500 mr-2"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.completed} {t("completedLabel")}
                  </span>
                </div>
                <div className="flex items-center">
                  <XCircle size={20} className="text-red-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.pending} {t("pendingLabel")}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent tasks */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <ListChecks
                  size={24}
                  className="mr-2 text-purple-600 dark:text-purple-400"
                />
                {t("yourRecentTasks")}
              </h2>

              {tasks.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          task.completed ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1 sm:max-w-none max-w-[200px]">
                        <span
                          className={`text-gray-900 dark:text-white ${
                            task.completed
                              ? "line-through text-gray-500 dark:text-gray-400"
                              : ""
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("noTasksFound")}
                  </p>
                </div>
              )}

              {tasks.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleBackToTasks}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline dark:bg-gray-700"
                  >
                    {t("viewAllTasks")} {tasks.length} {t("tasks")}
                  </button>
                </div>
              )}
            </div>

            {/* Monthly stats */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t("monthlyOverview")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("tasksCompletedLabel")}
                  </h3>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.lastMonthCompleted}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("inLast30Days")}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("productivityScore")}
                  </h3>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.lastMonthCompleted > 30
                      ? "A+"
                      : stats.lastMonthCompleted > 20
                      ? "A"
                      : stats.lastMonthCompleted > 15
                      ? "B"
                      : stats.lastMonthCompleted > 10
                      ? "C"
                      : "D"}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t("basedOnActivity")}
                  </p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {t("tipsToImprove")}
              </h2>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="mr-2 text-purple-600 dark:text-purple-400">
                    •
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("tip1")}
                  </p>
                </li>
                <li className="flex">
                  <span className="mr-2 text-purple-600 dark:text-purple-400">
                    •
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("tip2")}
                  </p>
                </li>
                <li className="flex">
                  <span className="mr-2 text-purple-600 dark:text-purple-400">
                    •
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("tip3")}
                  </p>
                </li>
                <li className="flex">
                  <span className="mr-2 text-purple-600 dark:text-purple-400">
                    •
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("tip4")}
                  </p>
                </li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
