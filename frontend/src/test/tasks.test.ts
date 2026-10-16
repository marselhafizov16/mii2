import { describe, expect, it } from 'vitest';
import { defaultFilters, filterTasks, summarize } from '../lib/tasks';
import { notesTask, sqlTask } from './fixtures';

describe('filterTasks', () => {
  it('оставляет задачи выбранного статуса и поискового запроса', () => {
    const result = filterTasks([sqlTask, notesTask], {
      ...defaultFilters,
      status: 'todo',
      search: 'sql',
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Лабораторная по SQL');
  });
});

describe('summarize', () => {
  it('считает просроченные задачи и не включает выполненные', () => {
    expect(summarize([sqlTask, notesTask], new Date(2026, 9, 15))).toEqual({
      total: 2,
      todo: 1,
      inProgress: 0,
      done: 1,
      overdue: 1,
    });
  });
});
