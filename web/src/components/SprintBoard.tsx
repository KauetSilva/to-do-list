import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Play,
  Trash2,
  ExternalLink,
  Target,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { Sprint, SprintStatus, Priority } from "../types";
import { sprintsAPI } from "../services/api";
import { useLanguage } from "../hooks/useLanguage";
import { getPriorityLabel, getPriorityColor } from "../utils/priorityUtils";

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

const StatusBadge = ({ status }: { status: SprintStatus }) => {
  const { t } = useLanguage();

  const colors = {
    [SprintStatus.PLANNING]:
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    [SprintStatus.ACTIVE]:
      "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    [SprintStatus.COMPLETED]:
      "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    [SprintStatus.CANCELLED]:
      "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  };

  const statusLabels = {
    [SprintStatus.PLANNING]: t("planning"),
    [SprintStatus.ACTIVE]: t("active"),
    [SprintStatus.COMPLETED]: t("completed"),
    [SprintStatus.CANCELLED]: t("cancelled"),
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};

const SprintBoard: React.FC = () => {
  const { t } = useLanguage();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadSprints();
  }, []);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const data = await sprintsAPI.getSprints();
      setSprints(data);
      const active = data.find(
        (sprint: Sprint) => sprint.status === SprintStatus.ACTIVE
      );
      setActiveSprint(active || null);
    } catch (error) {
      console.error(t("errorLoadingSprints"), error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSprint = async (sprintId: number) => {
    try {
      await sprintsAPI.activateSprint(sprintId);
      await loadSprints();
    } catch (error) {
      console.error(t("errorActivateSprint"), error);
    }
  };

  const handleDeleteSprint = async (sprintId: number) => {
    if (window.confirm(t("confirmDeleteSprint"))) {
      try {
        await sprintsAPI.deleteSprint(sprintId);
        await loadSprints();
      } catch (error) {
        console.error(t("errorDeleteSprint"), error);
      }
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sprintsAPI.createSprint(newSprint);
      setShowCreateModal(false);
      setNewSprint({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      await loadSprints();
    } catch (error) {
      console.error(t("errorCreateSprint"), error);
    }
  };

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
          {t("sprints")}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{t("newSprint")}</span>
        </button>
      </div>

      {/* Active Sprint */}
      {activeSprint && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <Play className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("activeSprint")}
              </h3>
              <StatusBadge status={activeSprint.status} />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {format(new Date(activeSprint.startDate), "dd/MM", {
                locale: ptBR,
              })}{" "}
              -{" "}
              {format(new Date(activeSprint.endDate), "dd/MM", {
                locale: ptBR,
              })}
            </div>
          </div>

          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {activeSprint.name}
          </h4>
          {activeSprint.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeSprint.description}
            </p>
          )}

          {/* Sprint Metrics */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activeSprint.tasks.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("totalTasks")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activeSprint.tasks.filter((t) => t.completed).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("completed")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {activeSprint.tasks.filter((t) => !t.completed).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("pending")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {activeSprint.tasks.reduce((sum, t) => sum + t.points, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t("totalPoints")}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>{t("progress")}</span>
              <span>
                {Math.round(
                  (activeSprint.tasks.filter((t) => t.completed).length /
                    activeSprint.tasks.length) *
                    100
                )}
                {t("completedPercent")}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    activeSprint.tasks.length > 0
                      ? (activeSprint.tasks.filter((t) => t.completed).length /
                          activeSprint.tasks.length) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Sprint List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {sprint.name}
                </h3>
                <StatusBadge status={sprint.status} />
              </div>
              <div className="flex items-center space-x-2">
                {sprint.status === SprintStatus.PLANNING && (
                  <button
                    onClick={() => handleActivateSprint(sprint.id)}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    title={t("activateSprint")}
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteSprint(sprint.id)}
                  className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                  title={t("deleteSprint")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {sprint.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {sprint.description}
              </p>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {format(new Date(sprint.startDate), "dd/MM", { locale: ptBR })} -{" "}
              {format(new Date(sprint.endDate), "dd/MM", { locale: ptBR })}
            </div>

            {/* Sprint Tasks Preview */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {sprint.tasks.length} {t("tasks")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sprint.tasks.filter((t) => t.completed).length} /{" "}
                  {sprint.tasks.length}
                </span>
              </div>

              {sprint.tasks.length > 0 && (
                <div className="space-y-1">
                  {sprint.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span
                          className={`truncate ${
                            task.completed
                              ? "line-through text-gray-500 dark:text-gray-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.taskLink && (
                          <a
                            href={task.taskLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex-shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {task.points}p
                        </span>
                      </div>
                    </div>
                  ))}
                  {sprint.tasks.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{sprint.tasks.length - 3} mais tarefas
                    </div>
                  )}
                </div>
              )}

              {/* Sprint Progress */}
              {sprint.tasks.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span>
                      {Math.round(
                        (sprint.tasks.filter((t) => t.completed).length /
                          sprint.tasks.length) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (sprint.tasks.filter((t) => t.completed).length /
                            sprint.tasks.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {sprints.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("noSprintsCreated")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("createFirstSprint")}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("createSprint")}
          </button>
        </div>
      )}

      {/* Create Sprint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("newSprint")}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
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
                  {t("description")}
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
                    {t("startDate")}
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
                    {t("endDate")}
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
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t("createSprint")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintBoard;
