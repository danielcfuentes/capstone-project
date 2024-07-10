import "./styles/App.css";
import SignUp from "./Components/Authentication/SignUp";
import LoginPage from "./Components/Authentication/LoginPage";
import Feed from "./Components/Feed/FeedPage";
import RoutesPage from "./Components/Routes/RoutesPage";
import RecommendationPage from "./Components/Recommendation/RecommendationPage";
import ProfileSetupPage from "./Components/Profile/ProfileSetupPage";
import ProfilePage from "./Components/Profile/ProfilePage";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./utils/Header";
import Footer from "./utils/Footer";

// Protected route wrapper component
const ProtectedRoute = ({ children, isLoggedIn, isProfileComplete }) => {
  if (!isLoggedIn) return <Navigate to="/login" />;
  if (!isProfileComplete) return <Navigate to="/profile-setup" />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const isLoggedIn = !!user && !!accessToken && !!refreshToken;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedUser && storedAccessToken && storedRefreshToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setIsProfileComplete(parsedUser.isProfileComplete);
    }
  }, []);

  const handleLogin = (userData, accessToken, refreshToken) => {
    setUser(userData);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsProfileComplete(userData.isProfileComplete);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const handleProfileComplete = () => {
    setIsProfileComplete(true);
    const updatedUser = { ...user, isProfileComplete: true };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedProfile }));
    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, ...updatedProfile })
    );
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
    setIsProfileComplete(false);
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
        {isLoggedIn && isProfileComplete && (
          <Header user={user} onLogout={handleLogout} />
        )}
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                isProfileComplete ? (
                  <Navigate to="/feed" />
                ) : (
                  <Navigate to="/profile-setup" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                isProfileComplete ? (
                  <Navigate to="/feed" />
                ) : (
                  <Navigate to="/profile-setup" />
                )
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={isLoggedIn ? <Navigate to="/" /> : <SignUp />}
          />
          <Route
            path="/profile-setup"
            element={
              isLoggedIn && !isProfileComplete ? (
                <ProfileSetupPage
                  user={user}
                  onProfileComplete={handleProfileComplete}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                isProfileComplete={isProfileComplete}
              >
                <Feed user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routes"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                isProfileComplete={isProfileComplete}
              >
                <RoutesPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                isProfileComplete={isProfileComplete}
              >
                <RecommendationPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                isProfileComplete={isProfileComplete}
              >
                <ProfilePage
                  user={user}
                  onProfileUpdate={handleProfileUpdate}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
        {isLoggedIn && isProfileComplete && <Footer />}
      </BrowserRouter>
    </div>
  );
}

export default App;
