import { describe, expect, it } from 'vitest';
import { hasErrors, validateTaskDraft } from '../lib/tasks';
import type { TaskDraft } from '../types';

const validDraft: TaskDraft = {
  title: 'Подготовить конспект',
  description: '',
  subject: 'Алгоритмы',
  priority: 'medium',
  status: 'todo',
  dueDate: '2026-10-20',
};

describe('validateTaskDraft', () => {
  it('требует название не короче трёх символов', () => {
    const errors = validateTaskDraft({ ...validDraft, title: 'ок' });
    expect(errors.title).toBe('Название должно быть не короче 3 символов');
  });

  it('принимает заполненный черновик', () => {
    expect(hasErrors(validateTaskDraft(validDraft))).toBe(false);
  });

  it('требует срок', () => {
    const errors = validateTaskDraft({ ...validDraft, dueDate: '' });
    expect(errors.dueDate).toBe('Укажите срок');
  });
});
