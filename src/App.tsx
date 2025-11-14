import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

function App() {
const [isAuthenticated, setIsAuthenticated] = useState(null);  // null = loading
const [username, setUsername] = useState("");

useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    setIsAuthenticated(false);
    return;
  }

  fetch("http://localhost:5000/api/validate", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      return res.json();   // IMPORTANT: return this
    })
    .then(data => {
      if (data.status) {
        setUsername(data.username);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    })
    .catch(() => {
      setIsAuthenticated(false);
    });
}, []);


  const handleLogin = (user) => {
    setUsername(user.username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    localStorage.removeItem("authToken");
  };

if (isAuthenticated === null) {
  return <div>Loading...</div>;   // waits for fetch!
}

  return (
    <BrowserRouter>
      <Routes>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
