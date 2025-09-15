import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  ExternalLink,
  Target,
  Zap,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Eye,
  Edit,
} from "lucide-react";
import { Task, Priority, Sprint, CreateTaskDTO, UpdateTaskDTO } from "../types";
import { tasksAPI, sprintsAPI } from "../services/api";
import { useLanguage } from "../hooks/useLanguage";
import { TaskWorkspace } from "./TaskWorkspace";
import { TaskForm } from "./TaskForm";
import { getPriorityLabel, getPriorityColor } from "../utils/priorityUtils";
import { AnimatedWrapper, StaggeredList } from "./AnimatedWrapper";

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
        priority
      )}`}
    >
      {getPriorityLabel(priority)}
    </span>
  );
};

const TaskList: React.FC = () => {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateSprintModal, setShowCreateSprintModal] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [sortBy, setSortBy] = useState<"priority" | "points" | "createdAt">(
    "priority"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Form states
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    points: 0,
    priority: Priority.MEDIUM,
    taskLink: "",
    sprintId: undefined as number | undefined,
  });

  const [newSprint, setNewSprint] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, sprintsData] = await Promise.all([
        tasksAPI.getTasks(),
        sprintsAPI.getSprints(),
      ]);
      setTasks(tasksData.tasks || tasksData);
      setSprints(sprintsData);
    } catch (error) {
      console.error(t("errorLoadingData"), error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await tasksAPI.toggleTaskCompletion(taskId);
      await loadData();
    } catch (error) {
      console.error(t("errorToggleTask"), error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm(t("confirmDeleteTask"))) {
      try {
        await tasksAPI.deleteTask(taskId);
        await loadData();
      } catch (error) {
        console.error(t("errorDeleteTask"), error);
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksAPI.createTask(newTask);
      setShowCreateTaskModal(false);
      setNewTask({
        title: "",
        description: "",
        points: 0,
        priority: Priority.MEDIUM,
        taskLink: "",
        sprintId: undefined,
      });
      await loadData();
    } catch (error) {
      console.error(t("errorCreateTask"), error);
    }
  };

  const handleTaskFormSubmit = async (data: CreateTaskDTO | UpdateTaskDTO) => {
    try {
      if (editingTask) {
        await tasksAPI.updateTask(editingTask.id, data as UpdateTaskDTO);
        console.log("Tarefa atualizada com sucesso!");
      } else {
        await tasksAPI.createTask(data as CreateTaskDTO);
        console.log("Tarefa criada com sucesso!");
      }
      setShowTaskForm(false);
      setEditingTask(null);
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleViewTaskWorkspace = async (task: Task) => {
    try {
      // Buscar detalhes completos da tarefa incluindo notes e time entries
      const fullTask = await tasksAPI.getTaskDetails(task.id);
      setSelectedTask(fullTask);
    } catch (error) {
      console.error("Error loading task details:", error);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setSelectedTask(updatedTask);
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sprintsAPI.createSprint(newSprint);
      setShowCreateSprintModal(false);
      setNewSprint({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      await loadData();
    } catch (error) {
      console.error(t("errorCreateSprint"), error);
    }
  };

  const filteredAndSortedTasks = tasks
    .filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "priority": {
          const priorityOrder = {
            [Priority.URGENT]: 4,
            [Priority.HIGH]: 3,
            [Priority.MEDIUM]: 2,
            [Priority.LOW]: 1,
          };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        }
        case "points":
          comparison = b.points - a.points;
          break;
        case "createdAt":
          comparison =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const completedPoints = tasks
    .filter((task) => task.completed)
    .reduce((sum, task) => sum + task.points, 0);
  const pendingPoints = totalPoints - completedPoints;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
          {t("tasksLabel")}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowCreateSprintModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Target className="h-4 w-4" />
            <span>{t("newSprint")}</span>
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t("newTask")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {t("totalTasksLabel")}
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
            {tasks.length}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {t("completedLabel")}
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
            {tasks.filter((t) => t.completed).length}
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              {t("pendingLabel")}
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-2">
            {tasks.filter((t) => !t.completed).length}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {t("totalPointsLabel")}
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">
            {totalPoints}
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "all" | "completed" | "pending")
                }
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t("allFilter")}</option>
                <option value="pending">{t("pendingLabel")}</option>
                <option value="completed">{t("completedLabel")}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <SortAsc className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "priority" | "points" | "createdAt"
                  )
                }
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">{t("priorityLabel")}</option>
                <option value="points">{t("pointsLabel")}</option>
                <option value="createdAt">{t("dateLabel")}</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedTasks.length} {t("tasksCount")} {tasks.length}{" "}
            {t("tasksLabelPlural")}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <StaggeredList animation="slide-up" staggerDelay={100}>
          {filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                task.completed
                  ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`mt-1 p-1 rounded-full transition-colors flex-shrink-0 ${
                      task.completed
                        ? "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3
                        className={`font-medium text-gray-900 dark:text-white truncate ${
                          task.completed
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : ""
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.taskLink && (
                        <a
                          href={task.taskLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    <p
                      className={`text-sm text-gray-600 dark:text-gray-400 mb-2 ${
                        task.completed ? "line-through" : ""
                      }`}
                    >
                      {task.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {t("createdOn")}{" "}
                        {format(new Date(task.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      {task.completed && task.completedAt && (
                        <span>
                          {t("completedOn")}{" "}
                          {format(
                            new Date(task.completedAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      )}
                      {task.sprint && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {t("sprintLabel")}: {task.sprint.name}
                        </span>
                      )}
                      {task.estimatedHours && (
                        <span className="text-green-600 dark:text-green-400">
                          Estimado: {formatTime(task.estimatedHours)}
                        </span>
                      )}
                      {task.timeSpent > 0 && (
                        <span
                          className={`${
                            task.estimatedHours &&
                            task.timeSpent > task.estimatedHours
                              ? "text-red-600 dark:text-red-400"
                              : "text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          Gasto: {formatTime(task.timeSpent)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                  <PriorityBadge priority={task.priority} />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {task.points}p
                  </span>
                  <button
                    onClick={() => handleViewTaskWorkspace(task)}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title="Abrir Workspace"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                    title="Editar Tarefa"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                    title={t("deleteTaskLabel")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </StaggeredList>
      </div>

      {filteredAndSortedTasks.length === 0 && (
        <AnimatedWrapper animation="bounce" timeout={600} delay={300}>
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === "all" ? t("noTasksCreated") : t("noTasksFoundFilter")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === "all"
                ? t("createFirstTask")
                : t("noTasksMatchFilter")}
            </p>
            {filter === "all" && (
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("createTaskButton")}
              </button>
            )}
          </div>
        </AnimatedWrapper>
      )}

      {/* Points Summary */}
      {tasks.length > 0 && (
        <AnimatedWrapper animation="scale" timeout={500} delay={400}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t("pointsSummary")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalPoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("totalPointsLabel")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedPoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("completedPointsLabel")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {pendingPoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("pendingPointsLabel")}
                </div>
              </div>
            </div>

            {totalPoints > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{t("generalProgress")}</span>
                  <span>
                    {Math.round((completedPoints / totalPoints) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(completedPoints / totalPoints) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </AnimatedWrapper>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("newTaskTitle")}
              </h3>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("titleLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("descriptionLabel")}
                </label>
                <textarea
                  required
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("pointsLabel")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newTask.points}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        points: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("priorityLabel")}
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value as Priority,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={Priority.LOW}>
                      {getPriorityLabel(Priority.LOW)}
                    </option>
                    <option value={Priority.MEDIUM}>
                      {getPriorityLabel(Priority.MEDIUM)}
                    </option>
                    <option value={Priority.HIGH}>
                      {getPriorityLabel(Priority.HIGH)}
                    </option>
                    <option value={Priority.URGENT}>
                      {getPriorityLabel(Priority.URGENT)}
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("taskLinkLabel")}
                </label>
                <input
                  type="url"
                  value={newTask.taskLink}
                  onChange={(e) =>
                    setNewTask({ ...newTask, taskLink: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("https://...")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("sprintLabel")} ({t("optional")})
                </label>
                <select
                  value={newTask.sprintId || ""}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      sprintId: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("selectSprint")}</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t("createTaskButton")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sprint Modal */}
      {showCreateSprintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("newSprintTitle")}
              </h3>
              <button
                onClick={() => setShowCreateSprintModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("sprintName")}
                </label>
                <input
                  type="text"
                  required
                  value={newSprint.name}
                  onChange={(e) =>
                    setNewSprint({ ...newSprint, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("descriptionLabel")}
                </label>
                <textarea
                  value={newSprint.description}
                  onChange={(e) =>
                    setNewSprint({ ...newSprint, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("startDateLabel")}
                  </label>
                  <input
                    type="date"
                    required
                    value={newSprint.startDate}
                    onChange={(e) =>
                      setNewSprint({ ...newSprint, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("endDateLabel")}
                  </label>
                  <input
                    type="date"
                    required
                    value={newSprint.endDate}
                    onChange={(e) =>
                      setNewSprint({ ...newSprint, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateSprintModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {t("createSprint")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          initialData={editingTask || {}}
          sprints={sprints}
          onSubmit={handleTaskFormSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          isEditing={!!editingTask}
        />
      )}

      {/* Task Workspace Modal */}
      {selectedTask && (
        <TaskWorkspace
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default TaskList;
