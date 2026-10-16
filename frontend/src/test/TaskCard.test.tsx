import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TaskCard } from '../components/TaskCard';
import { notesTask, sqlTask } from './fixtures';

function renderCard(task = sqlTask) {
  render(
    <MemoryRouter>
      <TaskCard
        task={task}
        onEdit={() => undefined}
        onDelete={() => undefined}
        onStatusChange={() => undefined}
      />
    </MemoryRouter>,
  );
}

describe('TaskCard', () => {
  it('показывает название и метку просрочки', () => {
    renderCard(sqlTask);
    expect(screen.getByRole('heading', { name: 'Лабораторная по SQL' })).toBeInTheDocument();
    expect(screen.getByText('Просрочено')).toBeInTheDocument();
  });

  it('не помечает просроченной уже выполненную задачу', () => {
    renderCard(notesTask);
    expect(screen.queryByText('Просрочено')).not.toBeInTheDocument();
  });
});
