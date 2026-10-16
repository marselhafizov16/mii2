import { useState } from 'react';
import { Link } from 'react-router-dom';
import { dueHint, formatDueDate } from '../lib/dates';
import { nextStatus, nextStatusLabel, priorityLabel, statusLabel } from '../lib/labels';
import { isOverdue } from '../lib/tasks';
import type { StudyTask, TaskStatus } from '../types';

type TaskCardProps = {
  task: StudyTask;
  pending?: boolean;
  onEdit: (task: StudyTask) => void;
  onDelete: (task: StudyTask) => void;
  onStatusChange: (task: StudyTask, status: TaskStatus) => void;
};

const priorityClass: Record<StudyTask['priority'], string> = {
  high: 'border-accent',
  medium: 'border-gold',
  low: 'border-pine',
};

export function TaskCard({ task, pending = false, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [confirming, setConfirming] = useState(false);
  const overdue = isOverdue(task);

  return (
    <article className="rounded-2xl border border-line bg-card p-4 shadow-[0_1px_0_rgba(30,36,48,0.04)]">
      <div className={`border-l-4 pl-4 ${priorityClass[task.priority]}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <span>{task.subject}</span>
          <span aria-hidden="true">·</span>
          <span>{priorityLabel[task.priority]}</span>
          {overdue && (
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-danger normal-case tracking-normal">
              Просрочено
            </span>
          )}
        </div>
        <h3 className="mt-1 text-lg font-semibold leading-snug">
          <Link to={`/tasks/${task.id}`} className="hover:text-accent">
            {task.title}
          </Link>
        </h3>
        {task.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{task.description}</p>
        )}
        <p className="mt-3 text-sm">
          <span className="text-muted">Срок: </span>
          {formatDueDate(task.dueDate)}
          <span className="text-muted"> · {dueHint(task.dueDate)}</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium">
            {statusLabel[task.status]}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => onStatusChange(task, nextStatus(task.status))}
            className="rounded-full bg-pine px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {nextStatusLabel(task.status)}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onEdit(task)}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
          >
            Изменить
          </button>
          {confirming ? (
            <span className="flex items-center gap-2 text-sm">
              <span>Удалить?</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => onDelete(task)}
                className="font-semibold text-danger"
              >
                Да
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="font-semibold">
                Нет
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(true)}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-danger disabled:opacity-60"
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
