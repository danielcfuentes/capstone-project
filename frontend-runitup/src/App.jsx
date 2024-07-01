import "./styles/App.css";
import SignUp from "./Components/Authentication/SignUp";
import LoginPage from "./Components/Authentication/LoginPage";
import Feed from "./Components/Feed/FeedPage";
import RoutesPage from "./Components/Routes/RoutesPage";
import RecommendationPage from "./Components/Recommendation/RecommendationPage";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./utils/Header";

// Protected route wrapper component
const ProtectedRoute = ({ children, isLoggedIn }) => {
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const isLoggedIn = !!user && !!accessToken && !!refreshToken;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedUser && storedAccessToken && storedRefreshToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  const handleLogin = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const handleLogout = async () => {
    if (refreshToken) {
      await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/logout`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshToken) {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_ADDRESS}/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refreshToken: refreshToken,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
          localStorage.setItem("accessToken", data.accessToken);
        } else {
          handleLogout();
        }
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [refreshToken]);

  return (
    <div className="app">
      <BrowserRouter>
        {isLoggedIn && <Header user={user} onLogout={handleLogout} />}
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/feed" /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/feed" />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/feed"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Feed user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routes"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <RoutesPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <RecommendationPage user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
