export interface User {
  id: number;
  email: string;
  username: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  points: number;
  taskLink?: string;
  priority: Priority;
  estimatedHours?: number;
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  sprintId?: number;
  sprint?: Sprint;
  notes?: TaskNote[];
  timeEntries?: TimeEntry[];
}

export interface Sprint {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
  userId: number;
  tasks: Task[];
  _count?: {
    tasks: number;
  };
}

export interface SprintMetrics {
  sprint: Sprint;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionRate: number;
    totalPoints: number;
    completedPoints: number;
    pendingPoints: number;
    pointsCompletionRate: number;
  };
}

export interface DailyReport {
  date: string;
  summary: {
    completedTasks: number;
    completedPoints: number;
    pendingTasks: number;
    pendingPoints: number;
  };
  completedTasks: {
    id: number;
    title: string;
    points: number;
    completedAt: string;
    sprint: string;
    taskLink?: string;
  }[];
  pendingTasks: {
    id: number;
    title: string;
    points: number;
    priority: Priority;
    sprint: string;
    taskLink?: string;
  }[];
  sprintProgress: {
    totalTasks: number;
    completedTasks: number;
    totalPoints: number;
    completedPoints: number;
    completionRate: number;
  };
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum SprintStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface TaskNote {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: number;
  userId: number;
}

export interface TimeEntry {
  id: number;
  description?: string;
  hours: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  taskId: number;
  userId: number;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  points?: number;
  taskLink?: string;
  priority?: Priority;
  sprintId?: number;
  estimatedHours?: number;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  points?: number;
  taskLink?: string;
  priority?: Priority;
  sprintId?: number;
  completed?: boolean;
  estimatedHours?: number;
}

export interface CreateNoteDTO {
  content: string;
}

export interface UpdateNoteDTO {
  content?: string;
}

export interface CreateTimeEntryDTO {
  description?: string;
  hours: number;
  startTime?: string;
  endTime?: string;
}

export interface UpdateTimeEntryDTO {
  description?: string;
  hours?: number;
  startTime?: string;
  endTime?: string;
}

export interface CreateSprintDTO {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
}

export interface UpdateSprintDTO {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
}
