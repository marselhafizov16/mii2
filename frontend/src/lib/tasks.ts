import { parseIsoDate } from './dates';
import type { FieldErrors, StudyTask, TaskDraft, TaskFilters, TaskSummary } from '../types';

export const defaultFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  subject: 'all',
};

export function emptyDraft(): TaskDraft {
  return {
    title: '',
    description: '',
    subject: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
  };
}

export function draftFromTask(task: StudyTask): TaskDraft {
  return {
    title: task.title,
    description: task.description,
    subject: task.subject,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
  };
}

export function isOverdue(task: StudyTask, today = new Date()): boolean {
  if (task.status === 'done') {
    return false;
  }

  const due = parseIsoDate(task.dueDate);
  if (Number.isNaN(due.getTime())) {
    return false;
  }

  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return due < start;
}

export function filterTasks(tasks: StudyTask[], filters: TaskFilters): StudyTask[] {
  const search = filters.search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.subject !== 'all' && task.subject !== filters.subject) return false;
    if (!search) return true;

    return [task.title, task.subject, task.description]
      .join(' ')
      .toLowerCase()
      .includes(search);
  });
}

export function sortTasks(tasks: StudyTask[]): StudyTask[] {
  return [...tasks].sort((left, right) => {
    if (left.status === 'done' && right.status !== 'done') return 1;
    if (right.status === 'done' && left.status !== 'done') return -1;
    return left.dueDate.localeCompare(right.dueDate);
  });
}

export function summarize(tasks: StudyTask[], today = new Date()): TaskSummary {
  return {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === 'todo').length,
    inProgress: tasks.filter((task) => task.status === 'inProgress').length,
    done: tasks.filter((task) => task.status === 'done').length,
    overdue: tasks.filter((task) => isOverdue(task, today)).length,
  };
}

export function validateTaskDraft(draft: TaskDraft): FieldErrors {
  const errors: FieldErrors = {};
  const title = draft.title.trim();
  const subject = draft.subject.trim();

  if (title.length < 3) {
    errors.title = 'Название должно быть не короче 3 символов';
  } else if (title.length > 120) {
    errors.title = 'Название не длиннее 120 символов';
  }

  if (subject.length < 2) {
    errors.subject = 'Укажите предмет';
  } else if (subject.length > 80) {
    errors.subject = 'Название предмета не длиннее 80 символов';
  }

  if (!draft.dueDate) {
    errors.dueDate = 'Укажите срок';
  }

  if (draft.description.trim().length > 2000) {
    errors.description = 'Описание не длиннее 2000 символов';
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function collectSubjects(tasks: StudyTask[], presets: string[]): string[] {
  const subjects = new Set<string>(presets);
  for (const task of tasks) {
    if (task.subject.trim()) {
      subjects.add(task.subject);
    }
  }

  return [...subjects].sort((left, right) => left.localeCompare(right, 'ru'));
}
