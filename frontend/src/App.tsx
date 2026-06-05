import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useAuth } from "@clerk/react";
import AuthPage from "@/pages/auth/AuthPage";
import AuthGuard from "@/pages/auth/components/AuthGuard";
import WorkspacePage from "@/pages/dashboard/workspaces/WorkspacePage";
import EventPage from "@/pages/dashboard/events/EventPage";
import CreateWorkspacePage from "@/pages/dashboard/workspaces/CreateWorkspacePage";
import LoginForm from "./pages/auth/components/LoginForm";
import SignupForm from "./pages/auth/components/SignupForm";
import DashboardLayout from "./pages/dashboard/layouts/DashboardLayout";
import CreateEventPage from "./pages/dashboard/events/CreateEventPage";
function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="snaptrack-theme">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={isSignedIn ? "/app/workspaces" : "/login"}
                replace
              />
            }
          />

          <Route element={<AuthPage />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
          </Route>

          <Route element={<AuthGuard />}>
            <Route element={<DashboardLayout />}>
              {/* Workspace */}
              <Route path="/app/workspaces" element={<WorkspacePage />} />
              <Route
                path="/app/workspaces/create"
                element={<CreateWorkspacePage />}
              />
              <Route path="/app/:workspaceId/events" element={<EventPage />} />
              <Route
                path="/app/:workspaceId/master-list"
                element={<div>Master List</div>}
              />
              <Route path="/app/:workspaceId/team" element={<div>Team</div>} />
              <Route
                path="/app/:workspaceId/billing"
                element={<div>Billing</div>}
              />
              <Route path="/app/:workspaceId/logs" element={<div>Logs</div>} />
              <Route
                path="/app/:workspaceId/settings"
                element={<div>Workspace Settings</div>}
              />

              {/* Event */}
              <Route
                path="/app/:workspaceId/event/create"
                element={<CreateEventPage />}
              />
              <Route
                path="/app/:workspaceId/event/:eventId"
                element={<div>Overview</div>}
              />
              <Route
                path="/app/:workspaceId/event/:eventId/scanner"
                element={<div>Scanner</div>}
              />
              <Route
                path="/app/:workspaceId/event/:eventId/rosters"
                element={<div>Rosters</div>}
              />
              <Route
                path="/app/:workspaceId/event/:eventId/sessions"
                element={<div>Sessions</div>}
              />
              <Route
                path="/app/:workspaceId/event/:eventId/event-logs"
                element={<div>Event Logs</div>}
              />
              <Route
                path="/app/:workspaceId/event/:eventId/settings"
                element={<div>Event Settings</div>}
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to={isSignedIn ? "/app/workspaces" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
