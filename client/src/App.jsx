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
import Dashboard from './components/dashboard/Dashboard.jsx';

function Placeholder({ title }) {
  return (
    <div className="coming-soon">
      <h2>{title}</h2>
      <p>This section is being built by another team member.</p>
    </div>
  );
}

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

                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/board" element={<Dashboard />} />
                  <Route path="/board/:boardId" element={<Placeholder title="Kanban Board" />} />
                </Route>

                <Route path="*" element={<Placeholder title="404 — Not Found" />} />
              </Routes>
            </HistoryProvider>
          </TasksProvider>
        </BoardsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;