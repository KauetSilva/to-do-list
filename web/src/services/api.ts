import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import {
  CreateTaskDTO,
  UpdateTaskDTO,
  CreateSprintDTO,
  UpdateSprintDTO,
  CreateNoteDTO,
  UpdateNoteDTO,
  CreateTimeEntryDTO,
  UpdateTimeEntryDTO,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/user/login", { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post("/user/register", {
      username,
      email,
      password,
    });
    return response.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Tasks endpoints
export const tasksAPI = {
  getTasks: async (page = 1, limit = 10) => {
    const response = await api.get(`/tasks?page=${page}&limit=${limit}`);
    return response.data;
  },

  createTask: async (taskData: CreateTaskDTO) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  updateTask: async (taskId: number, taskData: UpdateTaskDTO) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  toggleTaskCompletion: async (taskId: number) => {
    const response = await api.put(`/tasks/${taskId}/toggle`);
    return response.data;
  },

  deleteTask: async (taskId: number) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  getTasksBySprint: async (sprintId: number) => {
    const response = await api.get(`/tasks/sprint/${sprintId}`);
    return response.data;
  },

  getDailyReport: async (date?: string) => {
    const params = date ? `?date=${date}` : "";
    const response = await api.get(`/tasks/daily-report${params}`);
    return response.data;
  },

  getTaskDetails: async (taskId: number) => {
    const response = await api.get(`/tasks/${taskId}/details`);
    return response.data;
  },

  // Notes endpoints
  createNote: async (taskId: number, noteData: CreateNoteDTO) => {
    const response = await api.post(`/tasks/${taskId}/notes`, noteData);
    return response.data;
  },

  getNotes: async (taskId: number) => {
    const response = await api.get(`/tasks/${taskId}/notes`);
    return response.data;
  },

  updateNote: async (
    taskId: number,
    noteId: number,
    noteData: UpdateNoteDTO
  ) => {
    const response = await api.put(
      `/tasks/${taskId}/notes/${noteId}`,
      noteData
    );
    return response.data;
  },

  deleteNote: async (taskId: number, noteId: number) => {
    const response = await api.delete(`/tasks/${taskId}/notes/${noteId}`);
    return response.data;
  },

  // Time entries endpoints
  createTimeEntry: async (taskId: number, timeData: CreateTimeEntryDTO) => {
    const response = await api.post(`/tasks/${taskId}/time-entries`, timeData);
    return response.data;
  },

  getTimeEntries: async (taskId: number) => {
    const response = await api.get(`/tasks/${taskId}/time-entries`);
    return response.data;
  },

  updateTimeEntry: async (
    taskId: number,
    entryId: number,
    timeData: UpdateTimeEntryDTO
  ) => {
    const response = await api.put(
      `/tasks/${taskId}/time-entries/${entryId}`,
      timeData
    );
    return response.data;
  },

  deleteTimeEntry: async (taskId: number, entryId: number) => {
    const response = await api.delete(
      `/tasks/${taskId}/time-entries/${entryId}`
    );
    return response.data;
  },
};

// Sprints endpoints
export const sprintsAPI = {
  getSprints: async () => {
    const response = await api.get("/sprints");
    return response.data;
  },

  getActiveSprint: async () => {
    const response = await api.get("/sprints/active");
    return response.data;
  },

  getSprint: async (sprintId: number) => {
    const response = await api.get(`/sprints/${sprintId}`);
    return response.data;
  },

  getSprintMetrics: async (sprintId: number) => {
    const response = await api.get(`/sprints/${sprintId}/metrics`);
    return response.data;
  },

  createSprint: async (sprintData: CreateSprintDTO) => {
    const response = await api.post("/sprints", sprintData);
    return response.data;
  },

  updateSprint: async (sprintId: number, sprintData: UpdateSprintDTO) => {
    const response = await api.patch(`/sprints/${sprintId}`, sprintData);
    return response.data;
  },

  activateSprint: async (sprintId: number) => {
    const response = await api.patch(`/sprints/${sprintId}/activate`);
    return response.data;
  },

  deleteSprint: async (sprintId: number) => {
    const response = await api.delete(`/sprints/${sprintId}`);
    return response.data;
  },
};

export default api;
