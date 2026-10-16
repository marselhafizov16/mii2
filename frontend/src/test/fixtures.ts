import type { StudyTask } from '../types';

export const sqlTask: StudyTask = {
  id: '1',
  title: 'Лабораторная по SQL',
  description: 'Нормализация до третьей нормальной формы',
  subject: 'Базы данных',
  priority: 'high',
  status: 'todo',
  dueDate: '2020-01-10',
  createdAt: '2026-10-01T00:00:00Z',
};

export const notesTask: StudyTask = {
  id: '2',
  title: 'Конспект по графам',
  description: 'Обход в ширину и в глубину',
  subject: 'Алгоритмы',
  priority: 'medium',
  status: 'done',
  dueDate: '2020-01-05',
  createdAt: '2026-10-02T00:00:00Z',
};
