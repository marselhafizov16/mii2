import { useEffect, useId, useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { presetSubjects, priorityLabel, statusLabel } from '../lib/labels';
import { hasErrors, validateTaskDraft } from '../lib/tasks';
import type { FieldErrors, TaskDraft, TaskPriority, TaskStatus } from '../types';

type TaskFormProps = {
  title: string;
  initial: TaskDraft;
  subjects: string[];
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => Promise<void>;
};

const priorities: TaskPriority[] = ['low', 'medium', 'high'];
const statuses: TaskStatus[] = ['todo', 'inProgress', 'done'];

export function TaskForm({ title, initial, subjects, onClose, onSubmit }: TaskFormProps) {
  const titleId = useId();
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const options = subjects.length > 0 ? subjects : presetSubjects;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function update<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateTaskDraft(draft);
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    try {
      await onSubmit(draft);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        const mapped: FieldErrors = {};
        for (const [key, messages] of Object.entries(error.fieldErrors)) {
          if (key === 'title' || key === 'subject' || key === 'dueDate' || key === 'description') {
            mapped[key] = messages[0] ?? 'Проверьте поле';
          }
        }
        setErrors(mapped);
      } else {
        setFormError('Не удалось сохранить задачу');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-muted">
            Закрыть
          </button>
        </div>

        {formError && (
          <p role="alert" className="mb-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
            {formError}
          </p>
        )}

        <label className="block text-sm font-semibold">
          Название
          <input
            value={draft.title}
            onChange={(event) => update('title', event.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-normal"
          />
          {errors.title && <span className="mt-1 block font-normal text-danger">{errors.title}</span>}
        </label>

        <label className="mt-4 block text-sm font-semibold">
          Предмет
          <input
            list="subjects"
            value={draft.subject}
            onChange={(event) => update('subject', event.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-normal"
          />
          <datalist id="subjects">
            {options.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
          {errors.subject && <span className="mt-1 block font-normal text-danger">{errors.subject}</span>}
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Срок
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => update('dueDate', event.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-normal"
            />
            {errors.dueDate && <span className="mt-1 block font-normal text-danger">{errors.dueDate}</span>}
          </label>
          <label className="text-sm font-semibold">
            Приоритет
            <select
              value={draft.priority}
              onChange={(event) => update('priority', event.target.value as TaskPriority)}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-normal"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>{priorityLabel[priority]}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block text-sm font-semibold">
          Статус
          <select
            value={draft.status}
            onChange={(event) => update('status', event.target.value as TaskStatus)}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-normal"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>{statusLabel[status]}</option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm font-semibold">
          Описание
          <textarea
            value={draft.description}
            onChange={(event) => update('description', event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 font-normal"
          />
          {errors.description && (
            <span className="mt-1 block font-normal text-danger">{errors.description}</span>
          )}
        </label>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold">
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}
