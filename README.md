# Планёр

Учебный планировщик задач: список по предметам, срок, приоритет и статус.

Стек: React + ASP.NET Core + PostgreSQL.

## Что внутри

| Путь | Содержание |
| --- | --- |
| `frontend/` | Интерфейс |
| `backend/StudyPlanner.Api/` | REST API |
| `docs/dz1/report.md` | ДЗ 1. Сравнение AI-инструментов, выбран Cursor |
| `docs/dz2/` | ДЗ 2. Правила агента и промпт-шаблоны |
| `docs/dz3/` | ДЗ 3. Описание, UI-концепции, user stories, ТЗ |
| `docs/dz4/development_report.md` | ДЗ 4. Отчёт о разработке |
| `.cursorrules` | Правила, которыми пользовался агент |

## Перед первым запуском

Нужны Node.js, .NET SDK 10 и запущенный PostgreSQL. На этой машине служба `postgresql-x64-18` уже стоит.

Локальная строка подключения к базе `first_api` лежит в `backend/StudyPlanner.Api/appsettings.Development.json`. Этот файл не попадает в git. В `appsettings.json` оставлен шаблон без пароля. При запуске API создаёт в схеме `public` таблицу `study_tasks`, если её ещё нет, и заполняет её учебными задачами. Таблица `Books` в этой базе не изменяется.

## Запуск

Два терминала из корня `study-planner`.

API:

```powershell
cd backend\StudyPlanner.Api
dotnet run
```

Интерфейс откроется на http://localhost:5080 (проверка: http://localhost:5080/api/health).

Клиент:

```powershell
cd frontend
npm install
npm run dev
```

Приложение: http://localhost:5173

Публичный сайт: https://mii2-beta.vercel.app. Он показывает интерфейс. Список задач на этой ссылке заработает после публикации API и базы на Render и указания их адреса в переменной `VITE_API_URL` на Vercel. Файл `render.yaml` описывает API и PostgreSQL для Render.

## Тесты

```powershell
cd frontend
npm test
```

Сборка клиента: `npm run build`. Сборка API: `dotnet build` в `backend/StudyPlanner.Api`.

## Что умеет приложение

- список задач, сводка и метка просрочки;
- создание и редактирование;
- смена статуса и удаление с подтверждением;
- фильтр по статусу, приоритету, предмету и поиск;
- отдельная страница задачи;
- состояния загрузки, пустого списка, ошибки валидации и недоступной базы.
