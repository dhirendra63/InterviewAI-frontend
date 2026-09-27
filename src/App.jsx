import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewResult from "./pages/InterviewResult";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Resume from "./pages/Resume";
import Credits from "./pages/Credits";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
const Placeholder = ({ title }) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          {title}
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          This section is coming next.
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={<Landing />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route element={<ProtectedRoute />}>

              <Route element={<DashboardLayout />}>
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />
                <Route
                  path="/interview/:id/result"
                  element={<InterviewResult />}
                />
                <Route
                  path="/interview/:id"
                  element={<InterviewRoom />}
                />
                <Route
                  path="/history"
                  element={<History />}
                />
                <Route
                  path="/interview/setup"
                  element={<InterviewSetup />}
                />


                <Route
                  path="/analytics"
                  element={<Analytics />}
                />


                <Route
                  path="/resume"
                  element={<Resume />}
                />

                <Route
                  path="/credits"
                  element={<Credits />}
                />

                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;