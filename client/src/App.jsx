import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext.jsx';
import { BoardsProvider } from './components/BoardsContext.jsx';
import { TasksProvider } from './components/TasksContext.jsx';
import { HistoryProvider } from './components/HistoryContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import KanbanBoard from './components/kanban/KanbanBoard.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BoardsProvider>
          <TasksProvider>
            <HistoryProvider>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/board" element={<Dashboard />} />
                  <Route path="/board/:boardId" element={<KanbanBoard />} />
                </Route>
              </Routes>
            </HistoryProvider>
          </TasksProvider>
        </BoardsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;