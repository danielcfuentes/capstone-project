import "./styles/App.css";
import SignUp from "./Components/Authentication/SignUp";
import LoginPage from "./Components/Authentication/LoginPage";
import Feed from "./Components/Feed/FeedPage";
import RoutesPage from "./Components/Routes/RoutesPage";
import RecommendationPage from "./Components/Recommendation/RecommendationPage";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedUser && storedAccessToken && storedRefreshToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
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
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/feed" /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/feed" />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/feed"
            element={user ? <Feed user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/routes"
            element={
              user ? <RoutesPage user={user} onLogout={handleLogout}/> : <Navigate to="/login" />
            }
          />
          <Route
            path="/recommendations"
            element={
              user ? (
                <RecommendationPage user={user} onLogout={handleLogout}/>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
