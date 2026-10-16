import type { TaskPriority, TaskStatus } from '../types';

export const priorityLabel: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const statusLabel: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  inProgress: 'В работе',
  done: 'Готово',
};

export const presetSubjects = [
  'Машинное обучение',
  'Базы данных',
  'Веб-разработка',
  'Алгоритмы',
];

export function nextStatus(status: TaskStatus): TaskStatus {
  if (status === 'todo') return 'inProgress';
  if (status === 'inProgress') return 'done';
  return 'todo';
}

export function nextStatusLabel(status: TaskStatus): string {
  if (status === 'todo') return 'В работу';
  if (status === 'inProgress') return 'Готово';
  return 'Вернуть';
}
