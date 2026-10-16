import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, deleteTask, getTask, updateTaskStatus } from '../api/client';
import { dueHint, formatDueDate } from '../lib/dates';
import { nextStatus, nextStatusLabel, priorityLabel, statusLabel } from '../lib/labels';
import { isOverdue } from '../lib/tasks';
import type { StudyTask } from '../types';

export function TaskDetailsPage() {
  const { id } = useParams();
  const [task, setTask] = useState<StudyTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);
    setError(null);

    getTask(id)
      .then((loaded) => {
        if (active) setTask(loaded);
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(caught instanceof ApiError ? caught.message : 'Не удалось открыть задачу');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function changeStatus() {
    if (!task) return;
    setPending(true);
    setError(null);
    try {
      setTask(await updateTaskStatus(task.id, nextStatus(task.status)));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось обновить статус');
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!task) return;
    setPending(true);
    setError(null);
    try {
      await deleteTask(task.id);
      setRemoved(true);
      setTask(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Не удалось удалить задачу');
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/" className="text-sm font-semibold text-pine">
        ← К списку
      </Link>

      {loading && <p className="mt-6 text-muted">Загружаем задачу…</p>}

      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-danger/30 bg-white px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {removed && <p className="mt-6 text-lg">Задача удалена.</p>}

      {task && (
        <div className="mt-4 rounded-3xl border border-line bg-card p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{task.subject}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight">{task.title}</h1>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Статус</dt>
              <dd className="mt-1 font-semibold">{statusLabel[task.status]}</dd>
            </div>
            <div>
              <dt className="text-muted">Приоритет</dt>
              <dd className="mt-1 font-semibold">{priorityLabel[task.priority]}</dd>
            </div>
            <div>
              <dt className="text-muted">Срок</dt>
              <dd className="mt-1 font-semibold">
                {formatDueDate(task.dueDate)}
                <span className="mt-1 block font-normal text-muted">{dueHint(task.dueDate)}</span>
                {isOverdue(task) && <span className="mt-1 block text-danger">Просрочено</span>}
              </dd>
            </div>
          </dl>
          <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed">
            {task.description || 'Описание не добавлено.'}
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={pending}
              onClick={() => void changeStatus()}
              className="rounded-full bg-pine px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {nextStatusLabel(task.status)}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => void remove()}
              className="rounded-full border border-danger/40 px-4 py-2 text-sm font-semibold text-danger disabled:opacity-60"
            >
              Удалить
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
