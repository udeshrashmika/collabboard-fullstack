import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ComingSoon from './components/common/ComingSoon.jsx';

// NOTE (Member 1): routes marked TODO belong to Member 2 / Member 3.
// Swap ComingSoon for the real component once their branches are merged.
// BoardsProvider / TasksProvider / HistoryProvider will be added back by
// their owners — do not import them here.

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes — Member 1 */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes — layout + guard are Member 1 */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* TODO(m02): replace with <Dashboard /> */}
            <Route path="/board" element={<ComingSoon title="Dashboard" />} />
            {/* TODO(m03): replace with <KanbanBoard /> */}
            <Route path="/board/:boardId" element={<ComingSoon title="Kanban Board" />} />
          </Route>

          <Route path="*" element={<ComingSoon title="404 — Not Found" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;