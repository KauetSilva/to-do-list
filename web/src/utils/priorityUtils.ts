import { Priority } from "../types";

export const getPriorityLabel = (priority: Priority): string => {
  const priorityLabels = {
    [Priority.LOW]: "Baixa",
    [Priority.MEDIUM]: "Média",
    [Priority.HIGH]: "Alta",
    [Priority.URGENT]: "Urgente",
  };

  return priorityLabels[priority];
};

export const getPriorityColor = (priority: Priority): string => {
  const colors = {
    [Priority.LOW]:
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    [Priority.MEDIUM]:
      "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    [Priority.HIGH]:
      "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
    [Priority.URGENT]:
      "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  };

  return colors[priority];
};

