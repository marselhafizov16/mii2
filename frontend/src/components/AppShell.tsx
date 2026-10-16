import { Link, Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="mx-auto min-h-screen w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex min-w-0 flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pine">учебный семестр</p>
          <Link to="/" className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Планёр
          </Link>
          <p className="mt-2 max-w-full text-sm leading-6 text-muted">
            Срок, предмет и статус в одном списке.
          </p>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
