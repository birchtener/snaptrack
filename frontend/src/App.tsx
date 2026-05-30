import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AuthPage from "@/pages/auth/AuthPage";
import AuthGuard from "@/pages/auth/components/AuthGuard";
import { LoginForm } from "./pages/auth/components/LoginForm";
import { SignupForm } from "./pages/auth/components/SignupForm";
import { Button } from "@base-ui/react";
import { useClerk, useAuth } from "@clerk/react";
function App() {
  const { signOut } = useClerk();
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
                to={isSignedIn ? "/app/organizations" : "/login"}
                replace
              />
            }
          />

          <Route element={<AuthPage />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
          </Route>

          <Route element={<AuthGuard />}>
            <Route
              path="/app/organizations"
              element={
                <div>
                  <Button onClick={() => signOut({ redirectUrl: "/" })}>
                    Sign Out
                  </Button>
                </div>
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to={isSignedIn ? "/app/organizations" : "/login"}
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
