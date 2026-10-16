import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { BoardPage } from './pages/BoardPage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<BoardPage />} />
          <Route path="tasks/:id" element={<TaskDetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
