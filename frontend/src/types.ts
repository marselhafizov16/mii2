export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'inProgress' | 'done';

export type StudyTask = {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
};

export type TaskDraft = {
  title: string;
  description: string;
  subject: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
};

export type TaskFilters = {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  subject: string;
};

export type TaskSummary = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
};

export type FieldErrors = Partial<Record<'title' | 'subject' | 'dueDate' | 'description', string>>;
