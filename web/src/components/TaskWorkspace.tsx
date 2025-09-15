import React, { useState, useEffect } from "react";
import {
  Task,
  TaskNote,
  TimeEntry,
  CreateNoteDTO,
  CreateTimeEntryDTO,
} from "../types";
import { toast } from "react-toastify";
import { Edit2, Save, X, Plus } from "lucide-react";
import { AnimatedWrapper } from "./AnimatedWrapper";

interface TaskWorkspaceProps {
  task: Task;
  onClose: () => void;
  onTaskUpdate: (task: Task) => void;
}

export const TaskWorkspace: React.FC<TaskWorkspaceProps> = ({
  task,
  onClose,
  onTaskUpdate,
}) => {
  const [notes, setNotes] = useState<TaskNote[]>(task.notes || []);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(
    task.timeEntries || []
  );
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingTime, setIsAddingTime] = useState(false);
  const [editingNote, setEditingNote] = useState<TaskNote | null>(null);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(
    null
  );
  const [newNote, setNewNote] = useState("");
  const [newTimeEntry, setNewTimeEntry] = useState<CreateTimeEntryDTO>({
    description: "",
    hours: 0,
    startTime: "",
    endTime: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}/notes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: newNote.trim() }),
      });

      if (response.ok) {
        const note = await response.json();
        setNotes([note, ...notes]);
        setNewNote("");
        setIsAddingNote(false);
        toast.success("Nota adicionada com sucesso!");
      } else {
        toast.error("Erro ao adicionar nota");
      }
    } catch (error) {
      toast.error("Erro ao adicionar nota");
    }
  };

  const handleEditNote = (note: TaskNote) => {
    setEditingNote(note);
    setNewNote(note.content);
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newNote.trim()) return;

    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}/notes/${editingNote.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ content: newNote.trim() }),
        }
      );

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(
          notes.map((note) => (note.id === editingNote.id ? updatedNote : note))
        );
        setNewNote("");
        setEditingNote(null);
        toast.success("Nota atualizada com sucesso!");
      } else {
        toast.error("Erro ao atualizar nota");
      }
    } catch (error) {
      toast.error("Erro ao atualizar nota");
    }
  };

  const handleCancelEditNote = () => {
    setEditingNote(null);
    setNewNote("");
    setIsAddingNote(false);
  };

  const handleCreateTimeEntry = async () => {
    if (newTimeEntry.hours <= 0) {
      toast.error("Informe um tempo válido");
      return;
    }

    try {
      const timeData = {
        ...newTimeEntry,
        startTime: newTimeEntry.startTime || undefined,
        endTime: newTimeEntry.endTime || undefined,
      };

      const response = await fetch(`${API_URL}/tasks/${task.id}/time-entries`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(timeData),
      });

      if (response.ok) {
        const entry = await response.json();
        setTimeEntries([entry, ...timeEntries]);
        setNewTimeEntry({
          description: "",
          hours: 0,
          startTime: "",
          endTime: "",
        });
        setIsAddingTime(false);
        toast.success("Registro de tempo adicionado!");

        // Atualizar a tarefa com o novo tempo gasto
        const updatedTask = {
          ...task,
          timeSpent: task.timeSpent + entry.hours,
        };
        onTaskUpdate(updatedTask);
      } else {
        toast.error("Erro ao adicionar registro de tempo");
      }
    } catch (error) {
      toast.error("Erro ao adicionar registro de tempo");
    }
  };

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditingTimeEntry(entry);
    setNewTimeEntry({
      description: entry.description || "",
      hours: entry.hours,
      startTime: entry.startTime ? entry.startTime.substring(0, 16) : "",
      endTime: entry.endTime ? entry.endTime.substring(0, 16) : "",
    });
  };

  const handleUpdateTimeEntry = async () => {
    if (!editingTimeEntry || newTimeEntry.hours <= 0) {
      toast.error("Informe um tempo válido");
      return;
    }

    try {
      const timeData = {
        ...newTimeEntry,
        startTime: newTimeEntry.startTime || undefined,
        endTime: newTimeEntry.endTime || undefined,
      };

      const response = await fetch(
        `${API_URL}/tasks/${task.id}/time-entries/${editingTimeEntry.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(timeData),
        }
      );

      if (response.ok) {
        const updatedEntry = await response.json();
        setTimeEntries(
          timeEntries.map((entry) =>
            entry.id === editingTimeEntry.id ? updatedEntry : entry
          )
        );
        setNewTimeEntry({
          description: "",
          hours: 0,
          startTime: "",
          endTime: "",
        });
        setEditingTimeEntry(null);
        setIsAddingTime(false);
        toast.success("Registro de tempo atualizado!");

        // Recalcular tempo total
        const oldHours = editingTimeEntry.hours;
        const newHours = updatedEntry.hours;
        const timeDiff = newHours - oldHours;
        const updatedTask = {
          ...task,
          timeSpent: task.timeSpent + timeDiff,
        };
        onTaskUpdate(updatedTask);
      } else {
        toast.error("Erro ao atualizar registro de tempo");
      }
    } catch (error) {
      toast.error("Erro ao atualizar registro de tempo");
    }
  };

  const handleCancelEditTime = () => {
    setEditingTimeEntry(null);
    setNewTimeEntry({
      description: "",
      hours: 0,
      startTime: "",
      endTime: "",
    });
    setIsAddingTime(false);
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}/notes/${noteId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteId));
        toast.success("Nota removida");
      } else {
        toast.error("Erro ao remover nota");
      }
    } catch (error) {
      toast.error("Erro ao remover nota");
    }
  };

  const handleDeleteTimeEntry = async (entryId: number) => {
    const entry = timeEntries.find((e) => e.id === entryId);
    if (!entry) return;

    try {
      const response = await fetch(
        `${API_URL}/tasks/${task.id}/time-entries/${entryId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        setTimeEntries(timeEntries.filter((e) => e.id !== entryId));
        toast.success("Registro de tempo removido");

        // Atualizar a tarefa com o tempo gasto reduzido
        const updatedTask = {
          ...task,
          timeSpent: task.timeSpent - entry.hours,
        };
        onTaskUpdate(updatedTask);
      } else {
        toast.error("Erro ao remover registro de tempo");
      }
    } catch (error) {
      toast.error("Erro ao remover registro de tempo");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <AnimatedWrapper animation="scale" timeout={400}>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {task.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {task.description}
              </p>
              <div className="flex gap-4 mt-4 text-sm">
                <span className="text-blue-600 dark:text-blue-400">
                  Pontos: {task.points}
                </span>
                {task.estimatedHours && (
                  <span className="text-green-600 dark:text-green-400">
                    Estimado: {formatTime(task.estimatedHours)}
                  </span>
                )}
                <span className="text-orange-600 dark:text-orange-400">
                  Gasto: {formatTime(task.timeSpent)}
                </span>
                {task.estimatedHours && (
                  <span
                    className={`${
                      task.timeSpent > task.estimatedHours
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {task.timeSpent > task.estimatedHours
                      ? "Atrasado"
                      : "No prazo"}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notas */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Anotações
                </h3>
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>

              {(isAddingNote || editingNote) && (
                <div
                  className={`mb-4 p-4 border rounded-lg ${
                    editingNote
                      ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {editingNote && (
                    <div className="mb-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Editando anotação
                    </div>
                  )}
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Digite sua anotação..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={
                        editingNote ? handleUpdateNote : handleCreateNote
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      {editingNote ? "Atualizar" : "Salvar"}
                    </button>
                    <button
                      onClick={handleCancelEditNote}
                      className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-gray-900 dark:text-white">
                      {note.content}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(note.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Nenhuma anotação ainda
                  </p>
                )}
              </div>
            </div>

            {/* Registros de Tempo */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Registros de Tempo
                </h3>
                <button
                  onClick={() => setIsAddingTime(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>

              {(isAddingTime || editingTimeEntry) && (
                <div
                  className={`mb-4 p-4 border rounded-lg ${
                    editingTimeEntry
                      ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {editingTimeEntry && (
                    <div className="mb-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      Editando registro de tempo
                    </div>
                  )}
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newTimeEntry.description}
                      onChange={(e) =>
                        setNewTimeEntry({
                          ...newTimeEntry,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descrição do trabalho..."
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={newTimeEntry.hours}
                      onChange={(e) =>
                        setNewTimeEntry({
                          ...newTimeEntry,
                          hours: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Horas (ex: 1.5)"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="datetime-local"
                        value={newTimeEntry.startTime}
                        onChange={(e) =>
                          setNewTimeEntry({
                            ...newTimeEntry,
                            startTime: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="datetime-local"
                        value={newTimeEntry.endTime}
                        onChange={(e) =>
                          setNewTimeEntry({
                            ...newTimeEntry,
                            endTime: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={
                        editingTimeEntry
                          ? handleUpdateTimeEntry
                          : handleCreateTimeEntry
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      {editingTimeEntry ? "Atualizar" : "Salvar"}
                    </button>
                    <button
                      onClick={handleCancelEditTime}
                      className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        {entry.description && (
                          <p className="text-gray-900 dark:text-white font-medium">
                            {entry.description}
                          </p>
                        )}
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatTime(entry.hours)}
                        </p>
                        {(entry.startTime || entry.endTime) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.startTime &&
                              `Início: ${formatDate(entry.startTime)}`}
                            {entry.startTime && entry.endTime && " - "}
                            {entry.endTime &&
                              `Fim: ${formatDate(entry.endTime)}`}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTimeEntry(entry)}
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTimeEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Remover
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Registrado em: {formatDate(entry.createdAt)}
                    </span>
                  </div>
                ))}
                {timeEntries.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Nenhum registro de tempo ainda
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedWrapper>
    </div>
  );
};
