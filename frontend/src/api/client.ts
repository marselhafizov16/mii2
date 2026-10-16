import type { StudyTask, TaskDraft, TaskStatus } from '../types';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5080';

type ErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError('Нет соединения с сервером. Проверьте, что API запущен.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    const message = body?.message
      ?? (response.status === 401 ? 'Нужно войти в аккаунт' : 'Не удалось выполнить запрос');
    throw new ApiError(message, response.status, body?.errors ?? {});
  }

  return response.json() as Promise<T>;
}

function toPayload(draft: TaskDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    subject: draft.subject.trim(),
    priority: draft.priority,
    status: draft.status,
    dueDate: draft.dueDate,
  };
}

export function getTasks(): Promise<StudyTask[]> {
  return request<StudyTask[]>('/api/tasks');
}

export function getTask(id: string): Promise<StudyTask> {
  return request<StudyTask>(`/api/tasks/${id}`);
}

export function createTask(draft: TaskDraft): Promise<StudyTask> {
  return request<StudyTask>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(toPayload(draft)),
  });
}

export function updateTask(id: string, draft: TaskDraft): Promise<StudyTask> {
  return request<StudyTask>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toPayload(draft)),
  });
}

export function updateTaskStatus(id: string, status: TaskStatus): Promise<StudyTask> {
  return request<StudyTask>(`/api/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/api/tasks/${id}`, { method: 'DELETE' });
}
