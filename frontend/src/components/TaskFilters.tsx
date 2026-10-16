import type { ReactNode } from 'react';
import { priorityLabel, statusLabel } from '../lib/labels';
import type { TaskFilters as Filters, TaskPriority, TaskStatus } from '../types';

type TaskFiltersProps = {
  filters: Filters;
  subjects: string[];
  onChange: (filters: Filters) => void;
};

const statuses: Array<TaskStatus | 'all'> = ['all', 'todo', 'inProgress', 'done'];
const priorities: Array<TaskPriority | 'all'> = ['all', 'high', 'medium', 'low'];

export function TaskFilters({ filters, subjects, onChange }: TaskFiltersProps) {
  return (
    <div className="space-y-5">
      <FilterGroup label="Статус">
        {statuses.map((status) => (
          <FilterButton
            key={status}
            active={filters.status === status}
            onClick={() => onChange({ ...filters, status })}
          >
            {status === 'all' ? 'Все' : statusLabel[status]}
          </FilterButton>
        ))}
      </FilterGroup>

      <FilterGroup label="Приоритет">
        {priorities.map((priority) => (
          <FilterButton
            key={priority}
            active={filters.priority === priority}
            onClick={() => onChange({ ...filters, priority })}
          >
            {priority === 'all' ? 'Все' : priorityLabel[priority]}
          </FilterButton>
        ))}
      </FilterGroup>

      <label className="block text-sm font-semibold">
        Предмет
        <select
          value={filters.subject}
          onChange={(event) => onChange({ ...filters, subject: event.target.value })}
          className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 font-normal"
        >
          <option value="all">Все предметы</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line'
      }`}
    >
      {children}
    </button>
  );
}
