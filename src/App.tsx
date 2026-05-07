import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import TreePage from './pages/Tree';
import LevelsPage from './pages/Levels';
import BonusesPage from './pages/Bonuses';
import WithdrawPage from './pages/Withdraw';
import NotificationsPage from './pages/Notifications';
import ProfilePage from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { useAuth } from './providers/AuthProvider';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthorized) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthorized) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/tree" element={<RequireAuth><TreePage /></RequireAuth>} />
        <Route path="/levels" element={<RequireAuth><LevelsPage /></RequireAuth>} />
        <Route path="/bonuses" element={<RequireAuth><BonusesPage /></RequireAuth>} />
        <Route path="/withdraw" element={<RequireAuth><WithdrawPage /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
