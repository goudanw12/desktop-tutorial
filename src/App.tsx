import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import ErrorBoundary from '@/components/ErrorBoundary';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import Publish from '@/pages/Publish';
import Inbox from '@/pages/Inbox';
import ChatDetail from '@/pages/ChatDetail';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import PostDetail from '@/pages/PostDetail';
import Topic from '@/pages/Topic';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppInit({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppInit>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="explore" element={<Explore />} />
              <Route path="publish" element={<Publish />} />
              <Route path="messages" element={<Inbox />} />
              <Route path="notifications" element={<Inbox />} />
              <Route path="chat/:id" element={<ChatDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:userId" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="post/:postId" element={<PostDetail />} />
              <Route path="topic/:tag" element={<Topic />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppInit>
      </Router>
    </ErrorBoundary>
  );
}
