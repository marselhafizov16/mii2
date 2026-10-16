// Дата приходит как YYYY-MM-DD. Разбираем её как календарный день,
// потому что new Date('YYYY-MM-DD') читает строку как UTC и сдвигает сутки.
export function parseIsoDate(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return new Date(Number.NaN);
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

const dueDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
});

export function formatDueDate(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return dueDateFormatter.format(date);
}

export function dueHint(isoDate: string, today = new Date()): string {
  const due = parseIsoDate(isoDate);
  if (Number.isNaN(due.getTime())) {
    return '';
  }

  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((due.getTime() - start.getTime()) / 86_400_000);

  if (diff === 0) return 'сегодня';
  if (diff === 1) return 'завтра';
  if (diff === -1) return 'вчера';
  if (diff < 0) return `${Math.abs(diff)} дн. назад`;
  return `через ${diff} дн.`;
}
