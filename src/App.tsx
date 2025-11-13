import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard"


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [username, setUsername] = useState("");

  const handleLogin = (user) => {
    setUsername(user.username);
    setIsAuthenticated(true);
  };

  const handleLogout =  () => {
    setIsAuthenticated(false);
    setUsername("");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public login/signup page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage onLogin={handleLogin} />
            )
          }
        />

        {/* Protected dashboard route */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard username={username} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirect root path */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
