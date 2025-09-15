import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Sparkles,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Priority } from "../types";
import { tasksAPI } from "../services/api";
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

const DailyReport: React.FC = () => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string>("");

  useEffect(() => {
    loadDailyReport();
  }, [selectedDate]);

  const loadDailyReport = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getDailyReport(selectedDate);
      setReportData(data);
    } catch (error) {
      console.error(t("errorLoadingData"), error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIReport = async () => {
    // TODO: Implementar integração com IA
    // Por enquanto, vamos criar um relatório básico baseado nos dados
    if (!reportData) return;

    const completedTasks = reportData.completedTasks;
    const totalPoints = reportData.summary.completedPoints;

    const productivityScore =
      completedTasks.length > 0 ? t("excellent") : t("canImprove");

    const focusLevel =
      completedTasks.length > 3 ? t("highConcentration") : t("canImproveFocus");

    const workPace =
      totalPoints > 10 ? t("excellentWorkPace") : t("moderatePace");

    let aiReportText = `# Relatório de Atividades - ${format(
      new Date(selectedDate),
      "dd/MM/yyyy",
      { locale: ptBR }
    )}\n\n`;

    aiReportText += `## Resumo de Produtividade\n`;
    aiReportText += `- **Pontuação de Produtividade**: ${productivityScore}\n`;
    aiReportText += `- **Nível de Foco**: ${focusLevel}\n`;
    aiReportText += `- **Ritmo de Trabalho**: ${workPace}\n\n`;

    aiReportText += `## Tarefas Concluídas\n`;
    if (completedTasks.length === 0) {
      aiReportText += `${t("noTasksCompleted")}\n\n`;
    } else {
      completedTasks.forEach((task: any, index: number) => {
        aiReportText += `${index + 1}. **${task.title}** (${task.points} ${t(
          "points"
        )}) - ${t("completedAt")} ${format(
          new Date(task.completedAt),
          "HH:mm",
          {
            locale: ptBR,
          }
        )}\n`;
      });
    }

    setAiReport(aiReportText);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">{t("noDataForDate")}</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          {t("tryAnotherDate")}
        </p>
      </div>
    );
  }

  const isYesterday =
    format(new Date(selectedDate), "yyyy-MM-dd") ===
    format(subDays(new Date(), 1), "yyyy-MM-dd");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            {t("dailyReport")} -{" "}
            {format(new Date(selectedDate), "dd/MM/yyyy", { locale: ptBR })}
            {isYesterday && (
              <span className="ml-2 text-sm font-normal text-blue-600 dark:text-blue-400">
                {t("previousDay")}
              </span>
            )}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generateAIReport}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t("generateReport")}</span>
          </button>
        </div>
      </div>

      {/* AI Generated Report */}
      {aiReport && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Relatório Gerado por IA</span>
            </h3>
            <button
              onClick={() => setAiReport("")}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
              {aiReport}
            </pre>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {t("completedTasks")}
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
            {reportData.summary.completedTasks}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {t("totalTasks")}
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
            {reportData.summary.completedPoints}
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              {t("totalPointsLabel")}
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-2">
            {reportData.summary.pendingTasks}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {t("averageCompletionTime")}
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">
            {reportData.summary.pendingPoints}
          </p>
        </div>
      </div>

      {/* Sprint Progress */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>{t("sprintProgress")}</span>
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Progresso Geral
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {reportData.sprintProgress.completedTasks}/
              {reportData.sprintProgress.totalTasks} tarefas
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${reportData.sprintProgress.completionRate}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {Math.round(reportData.sprintProgress.completionRate)}
              {t("percentCompleted")}
            </span>
            <span>
              {reportData.sprintProgress.completedPoints}/
              {reportData.sprintProgress.totalPoints} {t("points")}
            </span>
          </div>
        </div>
      </div>

      {/* Completed Tasks - Foco Principal */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span>{t("completedTasks")}</span>
        </h3>

        {reportData.completedTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t("noCompletedTasks")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportData.completedTasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </span>
                    {task.sprint && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({task.sprint})
                      </span>
                    )}
                    {task.taskLink && (
                      <a
                        href={task.taskLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("completedAt")}{" "}
                      {format(new Date(task.completedAt), "HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {task.points} {t("points")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Tasks */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span>{t("pendingTasks")}</span>
        </h3>

        {reportData.pendingTasks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t("noPendingTasks")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportData.pendingTasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </span>
                    {task.sprint && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({task.sprint})
                      </span>
                    )}
                    <PriorityBadge priority={task.priority} />
                    {task.taskLink && (
                      <a
                        href={task.taskLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      {task.points} {t("points")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyReport;
