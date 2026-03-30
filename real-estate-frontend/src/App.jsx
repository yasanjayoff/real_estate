import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PropertiesPage from "./pages/properties/PropertiesPage";
import DealsPage from "./pages/deals/DealsPage";
import VisitsPage from "./pages/visits/VisitsPage";
import DocumentsPage from "./pages/documents/DocumentsPage";
import ProfitsPage from "./pages/profits/ProfitsPage";
import UsersPage from "./pages/users/UsersPage";
import ProfilePage from "./pages/profile/ProfilePage";
import NewsListPage from "./pages/news/NewsListPage";
import NewsDetailPage from "./pages/news/NewsDetailPage";
import NewsEventsAdminPage from "./pages/news/NewsEventsAdminPage";
import Home from "./Home";
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              fontSize: "14px",
              borderRadius: "10px",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#f8fafc" },
            },
            error: { iconTheme: { primary: "#ef4444", secondary: "#f8fafc" } },
          }}
        />
        <Routes>
          {/* Fully public — accessible via email links without login */}
          <Route path="/news" element={<NewsListPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />

          {/* Auth */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected — inside app layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route
              path="/deals"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <DealsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/visits"
              element={
                <ProtectedRoute roles={["ADMIN", "BUYER"]}>
                  <VisitsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profits"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <ProfitsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/news-admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <NewsEventsAdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
