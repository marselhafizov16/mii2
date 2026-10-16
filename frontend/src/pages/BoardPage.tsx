import { useCallback, useEffect, useState } from 'react';
import { ApiError, createTask, deleteTask, getTasks, updateTask, updateTaskStatus } from '../api/client';
import { SummaryCards } from '../components/SummaryCards';
import { TaskCard } from '../components/TaskCard';
import { TaskFilters } from '../components/TaskFilters';
import { TaskForm } from '../components/TaskForm';
import { presetSubjects } from '../lib/labels';
import {
  collectSubjects,
  defaultFilters,
  draftFromTask,
  emptyDraft,
  filterTasks,
  sortTasks,
  summarize,
} from '../lib/tasks';
import type { StudyTask, TaskDraft, TaskFilters as Filters, TaskStatus } from '../types';

type EditorState = { mode: 'create' } | { mode: 'edit'; task: StudyTask };

export function BoardPage() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await getTasks());
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось загрузить задачи');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const subjects = collectSubjects(tasks, presetSubjects);
  const visible = sortTasks(filterTasks(tasks, filters));
  const filtered = filters.search.trim() !== ''
    || filters.status !== 'all'
    || filters.priority !== 'all'
    || filters.subject !== 'all';

  async function runChange(id: string, action: () => Promise<void>) {
    setPendingId(id);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось обновить задачу');
    } finally {
      setPendingId(null);
    }
  }

  async function saveDraft(draft: TaskDraft) {
    if (!editor) return;

    if (editor.mode === 'create') {
      const created = await createTask(draft);
      setTasks((current) => [...current, created]);
    } else {
      const updated = await updateTask(editor.task.id, draft);
      setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
    }

    setEditor(null);
  }

  function changeStatus(task: StudyTask, status: TaskStatus) {
    void runChange(task.id, async () => {
      const updated = await updateTaskStatus(task.id, status);
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    });
  }

  function removeTask(task: StudyTask) {
    void runChange(task.id, async () => {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-line bg-card/80 p-4 lg:sticky lg:top-4">
        <button
          type="button"
          onClick={() => setEditor({ mode: 'create' })}
          className="mb-5 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white"
        >
          Новая задача
        </button>
        <TaskFilters filters={filters} subjects={subjects} onChange={setFilters} />
      </aside>

      <section className="min-w-0 space-y-4">
        {!loading && !(error && tasks.length === 0) && (
          <SummaryCards summary={summarize(tasks)} />
        )}

        <label className="block">
          <span className="sr-only">Поиск</span>
          <input
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            placeholder="Поиск по задачам"
            className="w-full rounded-2xl border border-line bg-card px-4 py-3"
          />
        </label>

        {error && (
          <div role="alert" className="rounded-2xl border border-danger/30 bg-white px-4 py-3 text-sm text-danger">
            <p className="break-words">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-2 font-semibold underline">
              Повторить
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            <p className="text-sm text-muted">Загружаем задачи…</p>
            <div className="h-28 animate-pulse rounded-2xl bg-card" />
            <div className="h-28 animate-pulse rounded-2xl bg-card" />
          </div>
        ) : visible.length === 0 && !error ? (
          <div className="rounded-3xl border border-dashed border-line bg-card/70 px-6 py-12 text-center">
            <p className="font-display text-3xl">{filtered ? 'Ничего не нашлось' : 'Пока пусто'}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              {filtered
                ? 'Сбросьте фильтры или измените поисковый запрос.'
                : 'Добавьте первую учебную задачу: предмет, срок и приоритет.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                pending={pendingId === task.id}
                onEdit={(item) => setEditor({ mode: 'edit', task: item })}
                onDelete={removeTask}
                onStatusChange={changeStatus}
              />
            ))}
          </div>
        )}
      </section>

      {editor && (
        <TaskForm
          key={editor.mode === 'edit' ? editor.task.id : 'create'}
          title={editor.mode === 'create' ? 'Новая задача' : 'Изменить задачу'}
          initial={editor.mode === 'edit' ? draftFromTask(editor.task) : emptyDraft()}
          subjects={subjects}
          onClose={() => setEditor(null)}
          onSubmit={saveDraft}
        />
      )}
    </div>
  );
}
