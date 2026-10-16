import type { TaskSummary } from '../types';

type SummaryCardsProps = {
  summary: TaskSummary;
};

const cards: Array<{ key: keyof TaskSummary; label: string; tone: string }> = [
  { key: 'total', label: 'Всего', tone: 'text-ink' },
  { key: 'inProgress', label: 'В работе', tone: 'text-pine' },
  { key: 'todo', label: 'Ожидают', tone: 'text-gold' },
  { key: 'overdue', label: 'Просрочено', tone: 'text-danger' },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Сводка">
      {cards.map((card) => (
        <article key={card.key} className="rounded-2xl border border-line bg-card px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{card.label}</p>
          <p className={`mt-1 font-display text-3xl ${card.tone}`}>{summary[card.key]}</p>
        </article>
      ))}
    </section>
  );
}
