import React, { useState } from "react";
import { CreateTaskDTO, UpdateTaskDTO, Priority, Sprint } from "../types";
import { getPriorityLabel } from "../utils/priorityUtils";
import { AnimatedWrapper } from "./AnimatedWrapper";

interface TaskFormProps {
  initialData?: Partial<UpdateTaskDTO>;
  sprints: Sprint[];
  onSubmit: (data: CreateTaskDTO | UpdateTaskDTO) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialData = {},
  sprints,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    points: initialData.points || 0,
    taskLink: initialData.taskLink || "",
    priority: initialData.priority || Priority.MEDIUM,
    sprintId: initialData.sprintId || "",
    estimatedHours: initialData.estimatedHours || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: CreateTaskDTO | UpdateTaskDTO = {
      ...formData,
      sprintId: formData.sprintId ? Number(formData.sprintId) : undefined,
      estimatedHours: formData.estimatedHours || undefined,
      taskLink: formData.taskLink || undefined,
    };

    onSubmit(submitData);
  };

  const formatTimeDisplay = (hours: number) => {
    if (!hours) return "";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <AnimatedWrapper animation="bounce" timeout={600}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o título da tarefa..."
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva a tarefa..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pontos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Story Points
                </label>
                <input
                  type="number"
                  min="0"
                  max="13"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tempo Estimado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tempo Estimado (horas)
                  {formData.estimatedHours > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({formatTimeDisplay(formData.estimatedHours)})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedHours: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as Priority,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              {/* Sprint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sprint
                </label>
                <select
                  value={formData.sprintId}
                  onChange={(e) =>
                    setFormData({ ...formData, sprintId: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sem Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Link da Tarefa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link da Tarefa
              </label>
              <input
                type="url"
                value={formData.taskLink}
                onChange={(e) =>
                  setFormData({ ...formData, taskLink: e.target.value })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                {isEditing ? "Atualizar Tarefa" : "Criar Tarefa"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </AnimatedWrapper>
    </div>
  );
};
